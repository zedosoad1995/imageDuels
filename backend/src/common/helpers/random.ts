import { randomBytes } from 'crypto';

export const randInt = (max: number, min: number = 0) => {
  return Math.floor(min + Math.random() * (max - min + 1));
};

export const generateRandomString = (length: number) => {
  if (length % 2 !== 0) {
    length++;
  }

  const res = randomBytes(length / 2).toString('hex');

  return res;
};

export function sampleN<T>(arr: T[], n: number): T[] {
  if (n > arr.length) throw new Error('n > array length');

  const copy = arr.slice();
  for (let i = copy.length - 1; i >= copy.length - n; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(copy.length - n);
}
