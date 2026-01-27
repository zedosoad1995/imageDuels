import { CollectionModeEnum } from '@prisma/client';
import { customEnum } from 'src/common/helpers/validation';
import { z } from 'zod';

export const createCollectionSchema = z
  .object({
    title: z.string().max(200),
    question: z.string().max(200).optional(),
    description: z.string().optional(),
    mode: customEnum(Object.values(CollectionModeEnum)),
    isNSFW: z.boolean(),
    maxUserVotesPerImage: z.number().optional().nullable().default(null),
  })
  .strict();

export type CreateCollectionDto = z.infer<typeof createCollectionSchema>;
