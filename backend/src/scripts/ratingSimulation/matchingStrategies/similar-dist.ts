import { IMatchmaker, IRatingSystem, SimPlayer } from '../types';

export class SimilarRatingDistMatchmaker implements IMatchmaker {
  constructor(private readonly ratingSystem: IRatingSystem<any>) {}

  pickPair<TState>(players: SimPlayer<TState>[]): [number, number] {
    const n = players.length;
    if (n < 2) throw new Error('Need at least 2 players');

    // 1) Find minimum numVotes across all players
    let minVotes = players[0].numVotes;
    for (let i = 1; i < n; i++) {
      if (players[i].numVotes < minVotes) {
        minVotes = players[i].numVotes;
      }
    }

    // 2) Choose base among the least-voted players
    const leastVoted = players.filter((p) => p.numVotes === minVotes);
    const base = leastVoted[Math.floor(Math.random() * leastVoted.length)];
    const baseRating = this.ratingSystem.getComparableRating(base.state as any);

    // 3) Build candidate list (everyone except base)
    const candidates = players.filter((p) => p.id !== base.id);

    // 4) Compute weights based on rating distance
    // closer => higher weight
    // tune: smaller = more local, larger = flatter.
    // 0: 50, 1*TEMPERATURE: 25, 2*TEMPERATURE: 12, 3: 5, 4: 2, 5: 0.7. (diff: prob%)
    // Higher temperature, may make things more interesting, by introducing more variety to the fights
    const TEMPERATURE = 20;

    const weights = candidates.map((p) => {
      const r = this.ratingSystem.getComparableRating(p.state as any);
      const diff = Math.abs(r - baseRating);
      return Math.exp(-diff / TEMPERATURE);
    });

    // 5) Sample opponent according to weights
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) {
      // extreme edge case: all weights 0, fallback to uniform random
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
