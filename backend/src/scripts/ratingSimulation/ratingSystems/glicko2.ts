import {
  Glicko2Service,
  IPlayer,
} from 'src/providers/rating/glicko2/glicko2.service';
import { IRatingSystem, MatchResult } from '../types';
import {
  RATING_INI,
  RD_INI,
  TAU,
  VOLATILITY_INI,
} from 'src/images/constants/rating';

export class Glicko2RatingSystem implements IRatingSystem<IPlayer> {
  constructor(private readonly glicko2: Glicko2Service) {}

  createInitialState(): IPlayer {
    return {
      rating: 1000, //RATING_INI,
      ratingDeviation: 350, //RD_INI,
      volatility: 0.001, //VOLATILITY_INI,
    };
  }

  getComparableRating(state: IPlayer): number {
    return state.rating;
  }

  getUncertainty(state: IPlayer): number {
    return state.ratingDeviation;
  }

  updateAfterMatch(
    p1: IPlayer,
    p2: IPlayer,
    result: MatchResult,
  ): [IPlayer, IPlayer] {
    const isWin = result === 'P1_WIN';
    return this.glicko2.calculateNewRatings(p1, p2, isWin);
  }

  updateTimeDecay(p: IPlayer, unitTimeSinceLastUpdate: number): void {
    const rdMax = 150;
    const c = 60;

    p.ratingDeviation = Math.min(
      Math.sqrt(
        Math.pow(p.ratingDeviation, 2) +
          Math.pow(c, 2) * unitTimeSinceLastUpdate,
      ),
      rdMax,
    );
  }
}
