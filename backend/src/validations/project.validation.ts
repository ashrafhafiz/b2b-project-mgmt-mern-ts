import { z } from "zod";

export const projectIdSchema = z
  .string()
  .trim()
  .min(24, { message: "Project ID is required!" });
const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Name is required!" })
  .max(255);
const descriptionSchema = z.string().trim().max(255).optional();
const emojiSchema = z.string().trim().optional();

export const createProjectSchema = z.object({
  name: nameSchema,
  emoji: emojiSchema,
  description: descriptionSchema,
});

export const updateProjectSchema = z.object({
  name: nameSchema,
  emoji: emojiSchema,
  description: descriptionSchema,
});
