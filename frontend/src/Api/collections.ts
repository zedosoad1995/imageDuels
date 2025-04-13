import api from ".";
import {
  ICreateCollectionBody,
  ICollection,
  IGetCollection,
  IGetCollections,
  IGetCollectionsQuery,
  IEditCollectionBody,
} from "../Types/collection";

export const getCollections = (
  query: IGetCollectionsQuery = {}
): Promise<IGetCollections> => {
  return api.get("/collections", {
    params: query,
  });
};

export const getCollection = (id: string): Promise<IGetCollection> => {
  return api.get(`/collections/${id}`);
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

export const createDuel = (
  id: string
): Promise<{ duelId: string | undefined; image1: string; image2: string }> => {
  return api.post(`/collections/${id}/duels`);
};
