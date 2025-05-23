import { z } from 'zod';

const collectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  question: z.string().nullable(),
  description: z.string().nullable(),
  mode: z.string(),
  isNSFW: z.boolean(),
  isLive: z.boolean(),
  isValid: z.boolean(),
});

export const collectionResSchema = z.object({
  ...collectionSchema.shape,
  images: z.array(
    z.object({
      id: z.string(),
      filepath: z.string(),
      numVotes: z.number(),
      percentile: z.number(),
    }),
  ),
  belongsToMe: z.boolean(),
});

export const manyCollectionsResSchema = z.array(
  z.object({
    ...collectionSchema.shape,
    createdBy: z.string(),
    totalImages: z.number(),
    totalVotes: z.number(),
    thumbnailImages: z.array(z.string()),
  }),
);
