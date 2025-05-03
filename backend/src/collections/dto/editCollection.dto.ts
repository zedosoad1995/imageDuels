import { CollectionModeEnum } from '@prisma/client';
import { customEnum } from 'src/common/helpers/validation';
import { z } from 'zod';

export const editCollectionSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    question: z.string().max(200).optional(),
    description: z.string().optional(),
    mode: customEnum(Object.values(CollectionModeEnum)).optional(),
    isNSFW: z.boolean().optional(),
  })
  .partial();

export type EditCollectionDto = z.infer<typeof editCollectionSchema>;
