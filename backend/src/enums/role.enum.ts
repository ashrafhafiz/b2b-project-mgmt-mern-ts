export const RoleEnum = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type RoleEnumType = keyof typeof RoleEnum;
