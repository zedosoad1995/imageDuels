import { Glicko2Service } from 'src/providers/rating/glicko2/glicko2.service';
import { RandomMatchmaker } from './matchingStrategies/random';
import { RatingSimulationService } from './ratingSimulationService';
import { Glicko2RatingSystem } from './ratingSystems/glicko2';
import { SimilarRatingMatchmaker } from './matchingStrategies/similar';
import { SimilarRatingLVMatchmaker } from './matchingStrategies/similar-low-votes';
import { SimulationResult } from './types';
import { SimilarRatingDistMatchmaker } from './matchingStrategies/similar-dist';
import { SimilarRatingMomentumMatchmaker } from './matchingStrategies/similar-momentum';
import { HighInfoGainMatchmaker } from './matchingStrategies/high-info';

type Strat =
  | 'rand'
  | 'similar'
  | 'similar-lv'
  | 'similar-dist'
  | 'similar-momentum'
  | 'high-info';

const getMatchingStrat = (strat: Strat) => {
  if (strat === 'rand') {
    return new RandomMatchmaker();
  }

  if (strat === 'similar-lv') {
    return new SimilarRatingLVMatchmaker(
      new Glicko2RatingSystem(new Glicko2Service()),
    );
  }

  if (strat === 'similar-dist') {
    return new SimilarRatingDistMatchmaker(
      new Glicko2RatingSystem(new Glicko2Service()),
    );
  }

  if (strat === 'similar-momentum') {
    return new SimilarRatingMomentumMatchmaker(
      new Glicko2RatingSystem(new Glicko2Service()),
    );
  }

  if (strat === 'high-info') {
    return new HighInfoGainMatchmaker(
      new Glicko2RatingSystem(new Glicko2Service()),
    );
  }

  return new SimilarRatingMatchmaker(
    new Glicko2RatingSystem(new Glicko2Service()),
  );
};

// ---------- stats helpers ----------

interface MetricStats {
  mean: number;
  min: number;
  max: number;
  median: number;
}

const computeStats = (values: number[]): MetricStats => {
  if (values.length === 0) {
    return { mean: NaN, min: NaN, max: NaN, median: NaN };
  }

  const n = values.length;
  const sum = values.reduce((s, v) => s + v, 0);
  const mean = sum / n;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const median =
    n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  return { mean, min, max, median };
};

const logStats = (name: string, values: number[]) => {
  const { mean, min, max, median } = computeStats(values);
  console.log(
    `${name}: mean=${mean.toFixed(4)}, median=${median.toFixed(
      4,
    )}, min=${min.toFixed(4)}, max=${max.toFixed(4)}`,
  );
};

// ---------- multi-run driver ----------

const runMany = async () => {
  const NUM_RUNS = 1000;
  const NUM_PLAYERS = 100;
  const NUM_ROUNDS = 1000;
  const STRAT: Strat = 'high-info';

  const avgAbsRankErrors: number[] = [];
  const maxAbsRankErrors: number[] = [];
  const fractionsWithin1: number[] = [];
  const fractionsWithin2: number[] = [];
  const fractionsWithin3: number[] = [];
  const fractionsWithin5: number[] = [];
  const fractionsWithin10: number[] = [];

  for (let i = 0; i < NUM_RUNS; i++) {
    const ratingSystem = new Glicko2RatingSystem(new Glicko2Service());
    const matchmaker = getMatchingStrat(STRAT);
    const sim = new RatingSimulationService(ratingSystem, matchmaker);

    const result: SimulationResult = sim.runSimulation({
      numPlayers: NUM_PLAYERS,
      numRounds: NUM_ROUNDS,
    });

    avgAbsRankErrors.push(result.avgAbsRankError);
    maxAbsRankErrors.push(result.maxAbsRankError);
    fractionsWithin1.push(result.fractionWithin1);
    fractionsWithin2.push(result.fractionWithin2);
    fractionsWithin3.push(result.fractionWithin3);
    fractionsWithin5.push(result.fractionWithin5);
    fractionsWithin10.push(result.fractionWithin10);

    // console.log(
    //   `Run #${i + 1}: avgAbsRankError=${result.avgAbsRankError.toFixed(
    //     4,
    //   )}, fractionWithin3=${result.fractionWithin3.toFixed(4)}`,
    // );
  }

  console.log(`\n==== Aggregated over runs (strat: ${STRAT}) ====`);
  logStats('avgAbsRankError', avgAbsRankErrors);
  logStats('maxAbsRankError', maxAbsRankErrors);
  logStats('fractionWithin1', fractionsWithin1);
  logStats('fractionWithin2', fractionsWithin2);
  logStats('fractionWithin3', fractionsWithin3);
  logStats('fractionWithin5', fractionsWithin5);
  logStats('fractionWithin10', fractionsWithin10);
};

runMany().catch((e) => {
  console.error(e);
  process.exit(1);
});
