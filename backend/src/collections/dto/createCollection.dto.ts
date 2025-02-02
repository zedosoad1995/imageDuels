import { CollectionModeEnum } from '@prisma/client';
import { customEnum } from 'src/common/helpers/validation';
import { z } from 'zod';

export const createCollectionSchema = z
  .object({
    title: z.string().min(1).max(200),
    question: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    mode: customEnum(Object.values(CollectionModeEnum)),
  })
  .strict();

export type CreateCollectionDto = z.infer<typeof createCollectionSchema>;
