export type CollectionModeType = "PUBLIC" | "PRIVATE" | "PERSONAL";

export interface ICollection {
  id: string;
  title: string;
  mode: CollectionModeType;
  question?: string;
  description?: string;
}

export type IGetCollections = ICollection[];

export type IGetCollection = ICollection & {
  images: {
    id: string;
    filepath: string;
    numVotes: number;
  }[];
};

export interface ICreateCollectionBody {
  title: string;
  mode: CollectionModeType;
  description?: string;
  question?: string;
}
