export type CollectionModeType = "PUBLIC" | "PRIVATE" | "PERSONAL";

export interface ICollection {
  id: string;
  title: string;
  mode: CollectionModeType;
  question: string | null;
  description: string | null;
}

export type IGetCollectionsOrderBy = "new" | "popular";

export interface IGetCollectionsQuery {
  onlySelf?: boolean;
  orderBy?: IGetCollectionsOrderBy;
}

export type IGetCollections = (ICollection & {
  totalImages: number;
  totalVotes: number;
  thumbnailImages: string[];
})[];

export type IGetCollection = ICollection & {
  images: {
    id: string;
    filepath: string;
    numVotes: number;
    percentile: number;
  }[];
  belongsToMe: boolean;
};

export interface ICreateCollectionBody {
  title: string;
  mode: CollectionModeType;
  description: string | null;
  question: string | null;
}

export type IEditCollectionBody = Partial<ICreateCollectionBody>;
