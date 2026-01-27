import { CollectionModeEnum } from '@prisma/client';
import { customEnum } from 'src/common/helpers/validation';
import { z } from 'zod';

export const editCollectionSchema = z
  .object({
    title: z.string().min(1).max(200),
    question: z.string().max(200),
    description: z.string(),
    mode: customEnum(Object.values(CollectionModeEnum)),
    isNSFW: z.boolean(),
    isLive: z.boolean(),
    maxUserVotesPerImage: z.number().min(1).max(200).nullable(),
  })
  .partial();

export type EditCollectionDto = z.infer<typeof editCollectionSchema>;
