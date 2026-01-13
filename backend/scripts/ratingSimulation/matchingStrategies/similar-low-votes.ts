import { IMatchmaker, IRatingSystem, SimPlayer } from '../types';

export class SimilarRatingLVMatchmaker implements IMatchmaker {
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

    // 3) Choose opponent with similar rating (but different id)
    const window = 200; // max rating diff
    const candidates = players.filter((p) => {
      if (p.id === base.id) return false;
      const r = this.ratingSystem.getComparableRating(p.state as any);
      return Math.abs(r - baseRating) <= window;
    });

    const opponent =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : // fallback: any other player
          players.filter((p) => p.id !== base.id)[
            Math.floor(Math.random() * (n - 1))
          ];

    const i1 = players.findIndex((p) => p.id === base.id);
    const i2 = players.findIndex((p) => p.id === opponent.id);

    return [i1, i2];
  }
}
