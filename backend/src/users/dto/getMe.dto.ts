import { RoleEnum, User } from '@prisma/client';
import { customEnum } from 'src/common/helpers/validation';
import { z } from 'zod';

export const getMeSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: customEnum(Object.values(RoleEnum)),
  canSeeNSFW: z.boolean(),
  isProfileCompleted: z.boolean(),
});
