import api from ".";

export const deleteImage = (id: string): Promise<void> => {
  return api.delete(`/images/${id}`);
};
