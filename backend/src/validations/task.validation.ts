import { z } from "zod";
import { TaskPriorityEnum } from "../enums/task-priority.enum";
import { TaskStatusEnum } from "../enums/task-status.enum";

const titleSchema = z
  .string()
  .trim()
  .min(2, { message: "Title is required!" })
  .max(255);
const descriptionSchema = z.string().trim().max(255).optional();
const statusSchema = z
  .enum(Object.values(TaskStatusEnum) as [string, ...string[]])
  .optional();
const prioritySchema = z
  .enum(Object.values(TaskPriorityEnum) as [string, ...string[]])
  .optional();
const assignedToSchema = z.string().trim().min(24).nullable().optional();
const dueDateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      return !val || !isNaN(Date.parse(val));
    },
    { message: "Invalid date format. Please provide a valid date!" }
  );

export const taskIdSchema = z.string().trim().min(24);

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  priority: prioritySchema,
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema,
});

export const UpdateTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  priority: prioritySchema,
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema,
});
