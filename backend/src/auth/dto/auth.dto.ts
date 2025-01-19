import { z } from 'zod';

export const LoginSchema = z
  .object({
    email: z.string(),
    password: z.string(),
  })
  .strict();

export type LoginDto = z.infer<typeof LoginSchema>;
