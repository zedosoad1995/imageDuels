import { CollectionModeEnum } from '@prisma/client';

export type IGetCollectionsOrderBy = 'new' | 'popular';

export type IGetCollectionOrderBy = 'new' | 'best-rated' | 'worst-rated';

export interface IGetCollections {
  onlySelf?: boolean;
  userId?: string;
  orderBy?: IGetCollectionsOrderBy;
  showAllModes?: boolean;
  mode?: CollectionModeEnum;
  showNSFW?: boolean;
  search?: string;
  limit?: number;
  cursor?: string | null | undefined;
}
