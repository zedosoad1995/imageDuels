export enum CollectionModeType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  PERSONAL = "PERSONAL",
}

export interface ICollection {
  id: string;
  title: string;
  mode: CollectionModeType;
  question: string | null;
  description: string | null;
  isNSFW: boolean;
  isLive: boolean;
  isValid: boolean;
  createdBy: string;
  maxUserVotesPerImage: number | null;
}

export type IGetCollectionsOrderBy = "new" | "popular";

export interface IGetCollectionsQuery {
  onlySelf?: boolean;
  orderBy?: IGetCollectionsOrderBy;
  search?: string;
  cursor?: string | null;
  mode?: CollectionModeType;
}

export type IGetCollections = {
  collections: (ICollection & {
    totalImages: number;
    totalVotes: number;
    thumbnailImages: string[];
  })[];
  nextCursor: string | null;
};

export type IGetCollection = ICollection & {
  images: {
    id: string;
    filepath: string;
    numVotes: number;
    percentile: number;
    height: number;
    width: number;
  }[];
  belongsToMe: boolean;
  nextCursor: string | null;
};

export interface ICreateCollectionBody {
  title: string;
  mode: CollectionModeType;
  description: string | null;
  question: string | null;
  isNSFW: boolean;
  maxUserVotesPerImage?: number | null;
}

export type IEditCollectionBody = Partial<ICreateCollectionBody> & {
  isLive?: boolean;
};
