import { z } from 'zod';

export const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  })
  .strict();

export type CreateUserDto = z.infer<typeof createUserSchema>;
