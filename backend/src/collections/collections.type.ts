import { CollectionModeEnum } from '@prisma/client';

export type IGetCollectionsOrderBy = 'new' | 'popular';

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
