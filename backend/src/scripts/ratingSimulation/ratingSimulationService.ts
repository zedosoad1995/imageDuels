// rating-simulation.service.ts
import {
  IRatingSystem,
  IMatchmaker,
  MatchResult,
  RunSimulationParams,
  SimulationResult,
  SimPlayer,
  PlayerRankError,
} from './types';

const SPAM_VOTING_PROB = 0.01;
const RARE_VOTING_PROB = 0.1;
const TYPICAL_VOTING_PROB = 1 - (RARE_VOTING_PROB + SPAM_VOTING_PROB);
const TYPICAL_ELO_RATING_DEVIATION = 50;
const RARE_ELO_RATING_DEVIATION = 200;

const ADD_NOISE = true;
const HAS_TIME_DECAY = false;

if (RARE_ELO_RATING_DEVIATION <= TYPICAL_ELO_RATING_DEVIATION) {
  throw new Error('Rare elo dev, must be higher than typical');
}

if (SPAM_VOTING_PROB + RARE_VOTING_PROB + TYPICAL_VOTING_PROB !== 1) {
  throw new Error('Prob sum must be 1');
}

const expectedScore = (rA: number, rB: number): number =>
  1 / (1 + Math.pow(10, (rB - rA) / 400));

function randn() {
  // standard normal ~ N(0,1)
  let u = 1 - Math.random();
  let v = 1 - Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randNormal(mean, std) {
  return mean + std * randn();
}

export class RatingSimulationService<TState> {
  constructor(
    private readonly ratingSystem: IRatingSystem<TState>,
    private readonly matchmaker: IMatchmaker,
  ) {}

  runSimulation(params: RunSimulationParams): SimulationResult {
    const { customRounds, trueMin = 800, trueMax = 2400 } = params;

    const players: SimPlayer<TState>[] = [];
    let globalRoundNum = 0;

    for (const { numPlayers, numRounds } of customRounds) {
      // 1. Generate players with random true ratings + rating-system-specific initial state
      players.push(
        ...Array.from({ length: numPlayers }, (_, i) => ({
          id: i + players.length,
          trueRating: trueMin + Math.random() * (trueMax - trueMin),
          state: this.ratingSystem.createInitialState(),
          numVotes: 0,
          momentum: 0,
          lastRoundUpdate: globalRoundNum,
        })),
      );

      // 2. Run matches
      for (let round = 0; round < numRounds; round++) {
        globalRoundNum += 1;

        const [i1, i2] = this.matchmaker.pickPair(players);
        const p1 = players[i1];
        const p2 = players[i2];

        const rollEventType = Math.random();
        const roll = Math.random();

        let result: MatchResult;

        if (ADD_NOISE && rollEventType <= SPAM_VOTING_PROB) {
          if (roll < 0.5) {
            result = 'P1_WIN';
          } else {
            result = 'P2_WIN';
          }
        } else {
          const eloRatingDeviation =
            rollEventType <= SPAM_VOTING_PROB + RARE_VOTING_PROB
              ? RARE_ELO_RATING_DEVIATION
              : TYPICAL_ELO_RATING_DEVIATION;

          const randDiff = ADD_NOISE
            ? Math.random() * 2 * eloRatingDeviation - eloRatingDeviation
            : 0;

          const p1WinProb = expectedScore(
            p1.trueRating + randDiff,
            p2.trueRating + randDiff,
          );

          if (roll < p1WinProb) {
            result = 'P1_WIN';
          } else {
            result = 'P2_WIN';
          }
        }

        const [newP1State, newP2State] = this.ratingSystem.updateAfterMatch(
          p1.state,
          p2.state,
          result,
        );

        const oldRating1 = this.ratingSystem.getComparableRating(p1.state);
        const oldRating2 = this.ratingSystem.getComparableRating(p2.state);
        const newRating1 = this.ratingSystem.getComparableRating(newP1State);
        const newRating2 = this.ratingSystem.getComparableRating(newP2State);

        const delta1 = newRating1 - oldRating1;
        const delta2 = newRating2 - oldRating2;

        // smoothing factor: 0.1 = “last 10-ish games”
        const MOMENTUM_ALPHA = 0.1;

        players[i1] = {
          ...p1,
          state: newP1State,
          numVotes: p1.numVotes + 1,
          momentum:
            (1 - MOMENTUM_ALPHA) * p1.momentum + MOMENTUM_ALPHA * delta1,
          lastRoundUpdate: globalRoundNum,
        };

        players[i2] = {
          ...p2,
          state: newP2State,
          numVotes: p2.numVotes + 1,
          momentum:
            (1 - MOMENTUM_ALPHA) * p2.momentum + MOMENTUM_ALPHA * delta2,
          lastRoundUpdate: globalRoundNum,
        };
      }

      // Real rating random evolution
      const RAND_TIME_CHANGE = 0;
      if (!RAND_TIME_CHANGE) {
        for (let pi = 0; pi < players.length; pi++) {
          (players[pi].state as any).rating += randNormal(0, RAND_TIME_CHANGE);
        }
      }

      if (HAS_TIME_DECAY) {
        // Time decay
        for (let pi = 0; pi < players.length; pi++) {
          this.ratingSystem.updateTimeDecay(
            players[pi].state,
            Math.floor(
              (globalRoundNum - players[pi].lastRoundUpdate) / (numPlayers * 1),
            ),
          );
        }
      }
    }

    // console.log(
    //   JSON.stringify(
    //     players
    //       .map(({ numVotes, state, lastRoundUpdate }) => ({
    //         numVotes,
    //         rd: (state as any).ratingDeviation,
    //         lastRoundUpdate,
    //       }))
    //       .sort((a, b) => b.lastRoundUpdate - a.lastRoundUpdate),
    //   ),
    // );

    // 3. Compute rankings & errors

    // sort by true rating
    const byTrue = [...players].sort((a, b) => b.trueRating - a.trueRating);
    const trueRankById = new Map<number, number>();
    byTrue.forEach((p, idx) => trueRankById.set(p.id, idx));

    // sort by estimated rating
    const byEstimated = [...players].sort(
      (a, b) =>
        this.ratingSystem.getComparableRating(b.state) -
        this.ratingSystem.getComparableRating(a.state),
    );
    const estRankById = new Map<number, number>();
    byEstimated.forEach((p, idx) => estRankById.set(p.id, idx));

    const errors: PlayerRankError[] = players.map((p) => {
      const estRating = this.ratingSystem.getComparableRating(p.state);
      const trueRank = trueRankById.get(p.id)!;
      const estRank = estRankById.get(p.id)!;
      const absDiff = Math.abs(trueRank - estRank);

      return {
        id: p.id,
        trueRating: p.trueRating,
        estRating,
        trueRank,
        estRank,
        absDiff,
      };
    });

    const numPlayers = customRounds.reduce(
      (acc, curr) => acc + curr.numPlayers,
      0,
    );

    const totalAbs =
      (errors.reduce((s, e) => s + e.absDiff, 0) / numPlayers) * 100;
    const maxAbs =
      (errors.reduce((m, e) => (e.absDiff > m ? e.absDiff : m), 0) /
        numPlayers) *
      100;
    const fractionWithin1 =
      errors.filter((e) => e.absDiff / numPlayers <= 0.01).length / numPlayers;
    const fractionWithin2 =
      errors.filter((e) => e.absDiff / numPlayers <= 0.02).length / numPlayers;
    const fractionWithin3 =
      errors.filter((e) => e.absDiff / numPlayers <= 0.03).length / numPlayers;
    const fractionWithin5 =
      errors.filter((e) => e.absDiff / numPlayers <= 0.05).length / numPlayers;
    const fractionWithin10 =
      errors.filter((e) => e.absDiff / numPlayers <= 0.1).length / numPlayers;

    return {
      players: errors,
      avgAbsRankError: totalAbs / numPlayers,
      maxAbsRankError: maxAbs,
      fractionWithin1,
      fractionWithin2,
      fractionWithin3,
      fractionWithin5,
      fractionWithin10,
    };
  }
}
