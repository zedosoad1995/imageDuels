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
