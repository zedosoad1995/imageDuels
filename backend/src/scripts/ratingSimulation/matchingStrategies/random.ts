import { IMatchmaker, SimPlayer } from '../types';

export class RandomMatchmaker implements IMatchmaker {
  pickPair<TState>(players: SimPlayer<TState>[]): [number, number] {
    const n = players.length;
    const i1 = Math.floor(Math.random() * n);
    let i2 = Math.floor(Math.random() * (n - 1));
    if (i2 >= i1) i2 += 1;
    return [i1, i2];
  }
}
