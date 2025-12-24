import { Injectable } from '@nestjs/common';
import { GLICKO_SCALE, RATING_INI, TAU } from 'src/images/constants/rating';

interface IPlayer {
  rating: number;
  ratingDeviation: number;
  volatility: number;
}

@Injectable()
export class Glicko2Service {
  public calculateNewRatings(p1: IPlayer, p2: IPlayer, isWin: boolean) {
    const p1NewParams = this.calculateNewRating(p1, p2, isWin);
    const p2NewParams = this.calculateNewRating(p2, p1, !isWin);

    return [p1NewParams, p2NewParams];
  }

  public calculateNewRating(p1: IPlayer, p2: IPlayer, isWin: boolean) {
    const mu = this.getNormalizedRating(p1);
    const muj = this.getNormalizedRating(p2);
    const rd = this.getNormalizedVolatility(p1);
    const rdj = this.getNormalizedVolatility(p2);

    const gj = this.getG(rdj);
    const winProb = this.getWinProb(mu, muj, gj);
    const v = this.getV(winProb, gj);

    const delta = this.getDelta(isWin, winProb, gj, v);

    const newVol = this.getNewVolatility(delta, p1.volatility, rd, v);
    const newNormRd = this.getNewNormalizedRd(rd, newVol, v);
    const newMu = this.getNewNormalizedRating(
      mu,
      newNormRd,
      gj,
      isWin,
      winProb,
    );

    return {
      rating: GLICKO_SCALE * newMu + RATING_INI,
      ratingDeviation: GLICKO_SCALE * newNormRd,
      volatility: newVol,
    };
  }

  public getWinProbability(p1: IPlayer, p2: IPlayer) {
    const mu = this.getNormalizedRating(p1);
    const muj = this.getNormalizedRating(p2);
    const rdj = this.getNormalizedVolatility(p2);

    const gj = this.getG(rdj);
    return this.getWinProb(mu, muj, gj);
  }

  private getNormalizedRating = (p: IPlayer) => {
    return (p.rating - RATING_INI) / GLICKO_SCALE;
  };

  private getNormalizedVolatility = (p: IPlayer) => {
    return p.ratingDeviation / GLICKO_SCALE;
  };

  private getG = (vol: number) => {
    return 1 / Math.sqrt(1 + (3 * vol * vol) / (Math.PI * Math.PI));
  };

  private getWinProb = (mu: number, muj: number, gj: number) => {
    return 1 / (1 + Math.exp(-gj * (mu - muj)));
  };

  private getV = (winProb: number, gj: number) => {
    const lossProb = 1 - winProb;

    return 1 / (gj * gj * winProb * lossProb);
  };

  private getDelta = (
    isWin: boolean,
    winProb: number,
    gj: number,
    v: number,
  ) => {
    return v * gj * (Number(isWin) - winProb);
  };

  private getNewVolatility = (
    delta: number,
    vol: number,
    rd: number,
    v: number,
  ) => {
    const a = Math.log(vol * vol);
    const convergence = 1e-6;

    const f = (x: number) => {
      return (
        (Math.exp(x) * (delta * delta - rd * rd - v - Math.exp(x))) /
          (2 * Math.pow(rd * rd + v + Math.exp(x), 2)) -
        (x - a) / (TAU * TAU)
      );
    };

    let A = a;
    let B: number;
    if (delta * delta > rd * rd + v) {
      B = Math.log(delta * delta - rd * rd - v);
    } else {
      let k = 1;
      while (f(a - k * TAU) < 0) {
        k += 1;
      }

      B = a - k * TAU;
    }

    let fA = f(A);
    let fB = f(B);

    while (Math.abs(B - A) > convergence) {
      const C = A + ((A - B) * fA) / (fB - fA);
      const fC = f(C);

      if (fC * fB <= 0) {
        A = B;
        fA = fB;
      } else {
        fA = fA / 2;
      }

      B = C;
      fB = fC;
    }

    return Math.exp(A / 2);
  };

  private getNewNormalizedRd = (rd: number, newVol: number, v: number) => {
    const preRd = Math.sqrt(rd * rd + newVol * newVol);

    return 1 / Math.sqrt(1 / (preRd * preRd) + 1 / v);
  };

  private getNewNormalizedRating = (
    mu: number,
    newNormRd: number,
    gj: number,
    isWin: boolean,
    winProb: number,
  ) => {
    return mu + newNormRd * newNormRd * gj * (Number(isWin) - winProb);
  };
}
