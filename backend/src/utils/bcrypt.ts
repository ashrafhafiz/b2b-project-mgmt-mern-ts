import bcrypt from "bcrypt";

export const hashValue = async (password: string, saltRounds: number = 10) =>
  await bcrypt.hash(password, saltRounds);

export const compareValue = async (password: string, hashedPassword: string) =>
  await bcrypt.compare(password, hashedPassword);
