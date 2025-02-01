import { z } from 'zod';

export function customEnum<T extends string>(enumVals: T[]) {
  return z.enum<T, [T, ...T[]]>(enumVals as unknown as [T, ...T[]]);
}
