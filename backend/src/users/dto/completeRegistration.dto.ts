import { z } from 'zod';

export const completeRegistrationSchema = z
  .object({
    username: z
      .string()
      .regex(/^[^\s@]+$/, "Username cannot contain spaces or '@'")
      .trim()
      .min(1)
      .max(20),
  })
  .strict();

export type CompleteRegistrationDto = z.infer<
  typeof completeRegistrationSchema
>;
