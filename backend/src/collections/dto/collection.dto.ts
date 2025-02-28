import { z } from 'zod';

const imagesResSchema = z.object({
  id: z.string(),
  filepath: z.string(),
  numVotes: z.number(),
  rating: z.number(),
});

export const collectionResSchema = z.object({
  id: z.string(),
  title: z.string(),
  question: z.string().nullable(),
  description: z.string().nullable(),
  mode: z.string(),
  images: z.array(imagesResSchema),
});

export const manyCollectionsResSchema = z.array(
  collectionResSchema.omit({ images: true }),
);
