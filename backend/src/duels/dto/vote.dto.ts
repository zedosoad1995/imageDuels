import { DuelOutcomeEnum } from '@prisma/client';
import { customEnum } from 'src/common/helpers/validation';
import { z } from 'zod';

export const voteSchema = z
  .object({
    outcome: customEnum(Object.values(DuelOutcomeEnum)),
  })
  .strict();

export type VoteDto = z.infer<typeof voteSchema>;
