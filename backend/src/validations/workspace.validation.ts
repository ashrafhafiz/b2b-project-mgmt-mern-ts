import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Name is required!" })
  .max(255);
const descriptionSchema = z.string().trim().max(255).optional();

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const updateWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const workspaceIdSchema = z
  .string()
  .trim()
  .min(24, { message: "Workspcae ID is required!" });

export const changeUserRoleSchema = z.object({
  memberId: z.string().trim().min(24),
  roleId: z.string().trim().min(24),
});
