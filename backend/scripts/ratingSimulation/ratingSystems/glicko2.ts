import {
  Glicko2Service,
  IPlayer,
} from 'src/providers/rating/glicko2/glicko2.service';
import { IRatingSystem, MatchResult } from '../types';
import {
  RATING_INI,
  RD_INI,
  VOLATILITY_INI,
} from 'src/images/constants/rating';

export class Glicko2RatingSystem implements IRatingSystem<IPlayer> {
  constructor(private readonly glicko2: Glicko2Service) {}

  createInitialState(): IPlayer {
    return {
      rating: RATING_INI,
      ratingDeviation: RD_INI,
      volatility: VOLATILITY_INI,
    };
  }

  getComparableRating(state: IPlayer): number {
    return state.rating;
  }

  updateAfterMatch(
    p1: IPlayer,
    p2: IPlayer,
    result: MatchResult,
  ): [IPlayer, IPlayer] {
    const isWin = result === 'P1_WIN';
    return this.glicko2.calculateNewRatings(p1, p2, isWin);
  }
}
