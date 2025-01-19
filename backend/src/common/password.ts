import { genSalt, hash, compare } from 'bcryptjs';

const SALT = 6;

export const hashPassword = async (password: string) => {
  const salt = await genSalt(SALT);
  const hashedPassword = await hash(password, salt);

  return hashedPassword;
};

export const checkPasswords = async (
  suppliedPassword: string,
  storedPassword: string,
) => {
  return compare(suppliedPassword, storedPassword);
};
