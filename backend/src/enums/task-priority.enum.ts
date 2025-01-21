export const TaskPriorityEnum = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum;
