import { z } from 'zod';

export const LoginSchema = z
  .object({
    usernameOrEmail: z.string(),
    password: z.string(),
  })
  .strict();

export type LoginDto = z.infer<typeof LoginSchema>;
