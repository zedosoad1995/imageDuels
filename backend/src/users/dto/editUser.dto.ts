import { z } from 'zod';

export const editUserSchema = z
  .object({
    canSeeNSFW: z.boolean(),
  })
  .strict();

export type EditUserDto = z.infer<typeof editUserSchema>;
