import { IMatchmaker, IRatingSystem, SimPlayer } from '../types';

export class SimilarRatingMomentumMatchmaker implements IMatchmaker {
  constructor(private readonly ratingSystem: IRatingSystem<any>) {}

  pickPair<TState>(players: SimPlayer<TState>[]): [number, number] {
    const n = players.length;
    if (n < 2) throw new Error('Need at least 2 players');

    // 1) Find minimum numVotes
    let minVotes = players[0].numVotes;
    for (let i = 1; i < n; i++) {
      if (players[i].numVotes < minVotes) {
        minVotes = players[i].numVotes;
      }
    }

    // 2) Base = random among least-voted
    const leastVoted = players.filter((p) => p.numVotes === minVotes);
    const base = leastVoted[Math.floor(Math.random() * leastVoted.length)];

    const baseRating = this.ratingSystem.getComparableRating(base.state as any);

    // ---------- momentum gating ----------
    const MOMENTUM_MIN = 10; // minimum absolute momentum to matter
    const MIN_VOTES_FOR_MOM = 3; // require some data
    const MOMENTUM_FACTOR = 1; // how hard to push when it applies
    const MAX_MOMENTUM = 100; // clamp
    const momentumOn = false;

    let targetRating = baseRating;

    if (
      base.numVotes >= MIN_VOTES_FOR_MOM &&
      Math.abs(base.momentum) >= MOMENTUM_MIN &&
      momentumOn
    ) {
      const clampedMomentum = Math.max(
        -MAX_MOMENTUM,
        Math.min(MAX_MOMENTUM, base.momentum),
      );

      // only the excess over the threshold affects matchmaking
      const effective =
        Math.sign(clampedMomentum) * (Math.abs(clampedMomentum) - MOMENTUM_MIN);

      targetRating = baseRating + MOMENTUM_FACTOR * effective;
    }
    // else: no momentum effect, targetRating = baseRating
    // -------------------------------------

    // 3) Candidates = everyone except base
    const candidates = players.filter((p) => p.id !== base.id);

    // 4) Weights based on distance to targetRating
    const TEMPERATURE = 20;
    const weights = candidates.map((p) => {
      const r = this.ratingSystem.getComparableRating(p.state as any);
      const diff = Math.abs(r - targetRating);
      return Math.exp(-diff / TEMPERATURE);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) {
      const fallback =
        candidates[Math.floor(Math.random() * candidates.length)];
      const i1 = players.findIndex((p) => p.id === base.id);
      const i2 = players.findIndex((p) => p.id === fallback.id);
      return [i1, i2];
    }

    let threshold = Math.random() * totalWeight;
    let pickedIndex = 0;
    for (let i = 0; i < candidates.length; i++) {
      threshold -= weights[i];
      if (threshold <= 0) {
        pickedIndex = i;
        break;
      }
    }

    const opponent = candidates[pickedIndex];

    const i1 = players.findIndex((p) => p.id === base.id);
    const i2 = players.findIndex((p) => p.id === opponent.id);

    return [i1, i2];
  }
}
