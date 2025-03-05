import { z } from "zod";
import { customEnum } from "../../Utils/validation";
import { CollectionModeType } from "../../Types/collection";

export const editCollectionSchema = z.object({
  title: z.string().min(1).max(200),
  question: z.string().max(200),
  description: z.string(),
  mode: customEnum(["PERSONAL", "PRIVATE", "PUBLIC"] as CollectionModeType[]),
});

export type EditCollectionType = z.infer<typeof editCollectionSchema>;
