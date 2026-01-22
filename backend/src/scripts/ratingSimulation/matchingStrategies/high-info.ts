import { IMatchmaker, IRatingSystem, SimPlayer } from '../types';

export class HighInfoGainMatchmaker implements IMatchmaker {
  constructor(private readonly ratingSystem: IRatingSystem<any>) {}

  pickPair<TState>(players: SimPlayer<TState>[]): [number, number] {
    const n = players.length;
    if (n < 2) throw new Error('Need at least 2 players');

    // ---- 1) Base: random among least-voted (exploration / coverage) ----
    let minVotes = players[0].numVotes;
    for (let i = 1; i < n; i++) {
      if (players[i].numVotes < minVotes) {
        minVotes = players[i].numVotes;
      }
    }

    const leastVoted = players.filter((p) => p.numVotes === minVotes);
    const base = leastVoted[Math.floor(Math.random() * leastVoted.length)];

    const baseRating = this.ratingSystem.getComparableRating(base.state as any);
    const baseUnc = this.ratingSystem.getUncertainty
      ? this.ratingSystem.getUncertainty(base.state as any)
      : 0;

    // ---- 2) Opponent candidates: everyone except base ----
    const candidates = players.filter((p) => p.id !== base.id);

    const maxVotes =
      players.reduce((m, p) => (p.numVotes > m ? p.numVotes : m), 0) || 1;

    // ---- 3) Compute info-gain style weights ----

    // Fairness kernel: closer rating => higher value (0..1)
    // Using your distance-based "temperature" idea.
    const FAIR_TEMPERATURE = 20; // smaller = more local, larger = flatter

    // Uncertainty scaling: typical Glicko RD scale ~ 350
    const UNC_SCALE = 350;

    const W_FAIR = 10; // importance of similar rating
    const W_UNC = 0; //-1; // importance of uncertainty
    const W_LV = 0; // importance of low votes
    const W_TS = 0; //10;

    const maxTimeSince =
      players.reduce(
        (m, p) => (p.lastRoundUpdate > m ? p.lastRoundUpdate : m),
        0,
      ) || 1;

    const weights = candidates.map((p) => {
      const oppRating = this.ratingSystem.getComparableRating(p.state as any);
      const oppUnc = this.ratingSystem.getUncertainty
        ? this.ratingSystem.getUncertainty(p.state as any)
        : 0;

      const diff = Math.abs(baseRating - oppRating);

      // 1) fairness / closeness in rating (0..1, max at diff=0)
      const fairness = Math.exp(-diff / FAIR_TEMPERATURE);

      // 2) uncertainty: higher RD => more useful comparison, normalize ~0..1
      const uncSum = baseUnc + oppUnc;
      const uncNorm = uncSum > 0 ? uncSum / (uncSum + UNC_SCALE) : 0;

      // 3) low votes: prefer under-served opponents (0..1)
      const lowVotesNorm = 1 - p.numVotes / maxVotes;

      const timeSinceNorm = 1 - p.lastRoundUpdate / maxTimeSince;

      const TSC = 0.7;

      const score =
        W_FAIR * fairness +
        W_UNC * uncNorm +
        W_LV * lowVotesNorm +
        W_TS * (timeSinceNorm > TSC ? (timeSinceNorm - TSC) / (1 - TSC) : 0);

      // ensure strictly positive for roulette wheel
      return Math.max(score, 1e-6);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Extreme edge case fallback
    if (!isFinite(totalWeight) || totalWeight <= 0) {
      const fallback =
        candidates[Math.floor(Math.random() * candidates.length)];
      const i1 = players.findIndex((p) => p.id === base.id);
      const i2 = players.findIndex((p) => p.id === fallback.id);
      return [i1, i2];
    }

    // ---- 4) Roulette-wheel sampling over info-gain weights ----
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
