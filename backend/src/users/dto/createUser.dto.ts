import { z } from 'zod';

export const createUserSchema = z
  .object({
    username: z
      .string()
      .regex(/^[^\s@]+$/, "Username cannot contain spaces or '@'")
      .trim()
      .min(1),
    email: z.string().email(),
    password: z.string().min(6).max(100),
  })
  .strict();

export type CreateUserDto = z.infer<typeof createUserSchema>;
