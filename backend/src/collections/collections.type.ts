export type IGetCollectionsOrderBy = 'new' | 'popular';

export interface IGetCollections {
  userId?: string;
  orderBy?: IGetCollectionsOrderBy;
  showAllModes?: boolean;
  showNSFW?: boolean;
  search?: string;
}
