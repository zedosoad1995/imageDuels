import api from ".";

export interface ICollection {
  id: string;
  title: string;
  mode: string;
  question?: string;
  description?: string;
  images: {
    id: string;
    filepath: string;
    numVotes: number;
  }[];
}

export type IGetCollections = Omit<ICollection, "images">[];

export const getCollections = (): Promise<IGetCollections> => {
  return api.get("/collections");
};

export const getCollection = (id: string): Promise<ICollection> => {
  return api.get(`/collections/${id}`);
};

export const addImageToCollection = (
  id: string,
  image: Blob
): Promise<ICollection> => {
  const formData = new FormData();
  formData.append("image", image);

  return api.post(`/collections/${id}/add-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
