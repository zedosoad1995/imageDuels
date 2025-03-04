import { z } from 'zod';

export const getMeSchema = z.object({
  id: z.string(),
  email: z.string(),
});
