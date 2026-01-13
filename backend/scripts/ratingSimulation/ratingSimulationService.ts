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

const expectedScore = (rA: number, rB: number): number =>
  1 / (1 + Math.pow(10, (rB - rA) / 400));

export class RatingSimulationService<TState> {
  constructor(
    private readonly ratingSystem: IRatingSystem<TState>,
    private readonly matchmaker: IMatchmaker,
  ) {}

  runSimulation(params: RunSimulationParams): SimulationResult {
    const { numPlayers, numRounds, trueMin = 800, trueMax = 2400 } = params;

    // 1. Generate players with random true ratings + rating-system-specific initial state
    const players: SimPlayer<TState>[] = Array.from(
      { length: numPlayers },
      (_, i) => ({
        id: i,
        trueRating: trueMin + Math.random() * (trueMax - trueMin),
        state: this.ratingSystem.createInitialState(),
        numVotes: 0,
        momentum: 0,
      }),
    );

    // 2. Run matches
    for (let round = 0; round < numRounds; round++) {
      const [i1, i2] = this.matchmaker.pickPair(players);
      const p1 = players[i1];
      const p2 = players[i2];

      const p1WinProb = expectedScore(p1.trueRating, p2.trueRating);
      const roll = Math.random();

      let result: MatchResult;
      if (roll < p1WinProb) {
        result = 'P1_WIN';
      } else {
        result = 'P2_WIN'; // ignoring draws for now
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
        momentum: (1 - MOMENTUM_ALPHA) * p1.momentum + MOMENTUM_ALPHA * delta1,
      };

      players[i2] = {
        ...p2,
        state: newP2State,
        numVotes: p2.numVotes + 1,
        momentum: (1 - MOMENTUM_ALPHA) * p2.momentum + MOMENTUM_ALPHA * delta2,
      };
    }

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

    const totalAbs = errors.reduce((s, e) => s + e.absDiff, 0);
    const maxAbs = errors.reduce((m, e) => (e.absDiff > m ? e.absDiff : m), 0);
    const fractionWithin1 =
      errors.filter((e) => e.absDiff <= 1).length / numPlayers;
    const fractionWithin2 =
      errors.filter((e) => e.absDiff <= 2).length / numPlayers;
    const fractionWithin3 =
      errors.filter((e) => e.absDiff <= 3).length / numPlayers;
    const fractionWithin5 =
      errors.filter((e) => e.absDiff <= 5).length / numPlayers;
    const fractionWithin10 =
      errors.filter((e) => e.absDiff <= 10).length / numPlayers;

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
