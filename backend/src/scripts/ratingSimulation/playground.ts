import { Glicko2Service } from '../../providers/rating/glicko2/glicko2.service';
import { getChangeRating, getChangeRD, getFinalRD } from './getFinalRD';

const run = () => {
  const service = new Glicko2Service();

  const res = service.calculateNewRatings(
    {
      rating: 1200,
      ratingDeviation: 150,
      volatility: 0.1,
    },
    {
      rating: 1200,
      ratingDeviation: 150,
      volatility: 0.1,
    },
    true,
  );
  console.log(res);

  for (const lala of [5, 10, 20, 50, 100, 150, 200, 300]) {
    console.log(
      service.getWinProbability(
        {
          rating: 1200 + lala,
          ratingDeviation: 150,
          volatility: 0.1,
        },
        {
          rating: 1200,
          ratingDeviation: 150,
          volatility: 0.1,
        },
      ),
      lala,
    );
    console.log(
      service.getWinProbability(
        {
          rating: 1200 + lala,
          ratingDeviation: 100,
          volatility: 0.1,
        },
        {
          rating: 1200,
          ratingDeviation: 100,
          volatility: 0.1,
        },
      ),
      lala,
    );
    console.log(
      service.getWinProbability(
        {
          rating: 1200 + lala,
          ratingDeviation: 50,
          volatility: 0.1,
        },
        {
          rating: 1200,
          ratingDeviation: 50,
          volatility: 0.1,
        },
      ),
      lala,
    );
  }

  console.log(getFinalRD(0.03));
  getChangeRating({ numRounds: 1, volatility: 0.03 });
  getChangeRD({ numRounds: 20, volatility: 0.03, iniRD: 150 });
};

run();

/*
Results
volatility: 0.001
    rating: same
        RD: 40 -> 4.5 change (+/-), 51.28% prob win (Prob of winning next time they fight)
        RD: 60 -> 9.9, 52.79%
        RD: 80 -> 17, 54.74%
        RD: 100 -> 26, 57.16%
        RD: 120 -> 35.7, 59.54%
        RD: 150 -> 51.3, 59.54%
*/
