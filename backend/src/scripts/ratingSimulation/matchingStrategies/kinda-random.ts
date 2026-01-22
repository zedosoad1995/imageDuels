import { randInt } from 'src/common/helpers/random';
import { IMatchmaker, IRatingSystem, SimPlayer } from '../types';

export class KindaRandMatchmaker implements IMatchmaker {
  constructor(private readonly ratingSystem: IRatingSystem<any>) {}

  pickPair<TState>(players: SimPlayer<TState>[]): [number, number] {
    const n = players.length;

    let minVotes = players[0].numVotes;
    for (let i = 1; i < n; i++) {
      if (players[i].numVotes < minVotes) {
        minVotes = players[i].numVotes;
      }
    }

    const leastVoted = players.filter((p) => p.numVotes === minVotes);

    const baseRating = this.ratingSystem.getComparableRating(
      leastVoted[0].state as any,
    );

    if (Math.random() < 0.2) {
      const newPlayers = players.filter((p) => p.id !== leastVoted[0].id);

      return [
        leastVoted[0].id,
        newPlayers.splice(randInt(newPlayers.length - 1), 1)[0].id,
      ];
    }

    const sortedImages = players
      .slice()
      .sort(
        (a, b) =>
          Math.abs(
            this.ratingSystem.getComparableRating(a.state as any) - baseRating,
          ) -
          Math.abs(
            this.ratingSystem.getComparableRating(b.state as any) - baseRating,
          ),
      );

    const image2 = sortedImages[randInt(Math.min(sortedImages.length - 1, 10))];

    return [leastVoted[0].id, image2.id];
  }
}
