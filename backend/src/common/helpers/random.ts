export const randInt = (max: number, min: number = 0) => {
  return Math.floor(min + Math.random() * (max - min));
};
