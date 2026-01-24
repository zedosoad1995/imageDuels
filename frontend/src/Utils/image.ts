export const getImageURL = (filename: string): string | undefined => {
  if (!filename || filename.trim() === "") {
    // Return undefined to prevent broken image requests
    // React will not set the src attribute when undefined
    return undefined;
  }
  return import.meta.env.VITE_IMAGES_URL + "/" + filename;
};
