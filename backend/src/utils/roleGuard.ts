import { PermissionEnumType } from "../enums/permission.enum";
import { UnauthorizedException } from "./app.error";
import { RolePermission } from "./role-permission";

export const roleGuard = (
  role: keyof typeof RolePermission,
  requiredPermissions: PermissionEnumType[]
) => {
  const permissions = RolePermission[role];

  const hasPermission = requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );

  if (!hasPermission) {
    throw new UnauthorizedException(
      "You do not have the necessary permissions to perform this action!"
    );
  }
};
