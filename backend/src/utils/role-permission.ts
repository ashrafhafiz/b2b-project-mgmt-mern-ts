import { RoleEnum, RoleEnumType } from "../enums/role.enum";
import { PermissionEnum, PermissionEnumType } from "../enums/permission.enum";

export const RolePermission: Record<RoleEnumType, Array<PermissionEnumType>> = {
  OWNER: [
    PermissionEnum.CREATE_WORKSPACE,
    PermissionEnum.EDIT_WORKSPACE,
    PermissionEnum.DELETE_WORKSPACE,
    PermissionEnum.MANAGE_WORKSPACE_SETTINGS,

    PermissionEnum.ADD_MEMBER,
    PermissionEnum.CHANGE_MEMBER_ROLE,
    PermissionEnum.REMOVE_MEMBER,

    PermissionEnum.CREATE_PROJECT,
    PermissionEnum.EDIT_PROJECT,
    PermissionEnum.DELETE_PROJECT,

    PermissionEnum.CREATE_TASK,
    PermissionEnum.EDIT_TASK,
    PermissionEnum.DELETE_TASK,

    PermissionEnum.VIEW_ONLY,
  ],
  ADMIN: [
    PermissionEnum.MANAGE_WORKSPACE_SETTINGS,

    PermissionEnum.ADD_MEMBER,

    PermissionEnum.CREATE_PROJECT,
    PermissionEnum.EDIT_PROJECT,
    PermissionEnum.DELETE_PROJECT,

    PermissionEnum.CREATE_TASK,
    PermissionEnum.EDIT_TASK,
    PermissionEnum.DELETE_TASK,

    PermissionEnum.VIEW_ONLY,
  ],
  MEMBER: [
    PermissionEnum.CREATE_TASK,
    PermissionEnum.EDIT_TASK,

    PermissionEnum.VIEW_ONLY,
  ],
};
