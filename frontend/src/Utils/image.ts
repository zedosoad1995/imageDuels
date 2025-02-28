export const getImageURL = (filename: string) => {
  return import.meta.env.VITE_IMAGES_URL + "/" + filename;
};
