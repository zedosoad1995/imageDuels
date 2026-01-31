import api from ".";
import {
  ICreateCollectionBody,
  ICollection,
  IGetCollection,
  IGetCollections,
  IGetCollectionsQuery,
  IEditCollectionBody,
  IGetMyCollectionStats,
} from "../Types/collection";

export const getCollections = (
  query: IGetCollectionsQuery = {}
): Promise<IGetCollections> => {
  return api.get("/collections", {
    params: query,
  });
};

export const getCollection = (
  id: string,
  cursor?: string | null,
  orderBy?: "new" | "best-rated" | "worst-rated"
): Promise<IGetCollection> => {
  const params: { cursor?: string; orderBy?: string } = {};
  if (cursor) params.cursor = cursor;
  if (orderBy) params.orderBy = orderBy;
  return api.get(`/collections/${id}`, {
    params,
  });
};

export const getMyCollectionStats = (): Promise<IGetMyCollectionStats> => {
  return api.get("/collections/me/stats");
};

export const createCollection = (
  body: ICreateCollectionBody
): Promise<ICollection> => {
  return api.post("/collections", body);
};

export const editCollection = (
  id: string,
  body: IEditCollectionBody
): Promise<ICollection> => {
  return api.patch(`/collections/${id}`, body);
};

export const deleteCollection = (id: string): Promise<void> => {
  return api.delete(`/collections/${id}`);
};

export const addImageToCollection = (
  id: string,
  image: File
): Promise<ICollection> => {
  const formData = new FormData();
  formData.append("image", image, image.name);

  return api.post(`/collections/${id}/add-image`, formData);
};

export const getDuel = (
  id: string
): Promise<{ token: string | undefined; image1: string; image2: string }> => {
  return api.get(`/collections/${id}/duels`);
};
