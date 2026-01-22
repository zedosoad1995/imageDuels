import { RD_INI } from 'src/images/constants/rating';
import { Glicko2Service } from '../../providers/rating/glicko2/glicko2.service';

const E = 1e-6;
const service = new Glicko2Service();

export const getFinalRD = (volatility: number, iniRD: number = 50) => {
  let rd = iniRD;
  while (true) {
    const res = service.calculateNewRatings(
      {
        rating: 1200,
        ratingDeviation: rd,
        volatility,
      },
      {
        rating: 1200,
        ratingDeviation: rd,
        volatility,
      },
      true,
    );

    const newRD = res[0].ratingDeviation;

    if (Math.abs(newRD - rd) < E) {
      return newRD;
    }

    rd = newRD;
  }
};

export const getChangeRating = ({
  numRounds,
  volatility,
  iniRD = 50,
  iniRating = 2000,
  startWithEqRD = true,
}: {
  numRounds: number;
  iniRD?: number;
  iniRating?: number;
  startWithEqRD?: boolean;
  volatility: number;
}) => {
  let rd = iniRD;
  if (startWithEqRD) {
    rd = getFinalRD(volatility);
  }

  let rating = iniRating;

  console.log('Init Rating', iniRating);

  for (let i = 1; i <= numRounds; i++) {
    const res = service.calculateNewRatings(
      {
        rating,
        ratingDeviation: rd,
        volatility,
      },
      {
        rating,
        ratingDeviation: rd,
        volatility,
      },
      false,
    );

    rating = res[0].rating;
    console.log(`Round ${i}, rating`, rating);
  }
};

export const getChangeRD = ({
  numRounds,
  volatility,
  iniRD = RD_INI,
}: {
  numRounds: number;
  iniRD?: number;
  volatility: number;
}) => {
  let rd = iniRD;

  console.log('Init RD', iniRD);

  for (let i = 1; i <= numRounds; i++) {
    const res = service.calculateNewRatings(
      {
        rating: 1000,
        ratingDeviation: rd,
        volatility,
      },
      {
        rating: 1000,
        ratingDeviation: rd,
        volatility,
      },
      false,
    );

    rd = res[0].ratingDeviation;
    console.log(`Round ${i}, RD`, rd);
  }
};
