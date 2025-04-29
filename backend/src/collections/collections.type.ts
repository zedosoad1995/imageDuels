export type IGetCollectionsOrderBy = 'new' | 'popular';

export interface IGetCollections {
  userId?: string;
  orderBy?: IGetCollectionsOrderBy;
  showAll?: boolean;
}
