import mongoose, { Document, Schema } from "mongoose";
import { RoleEnum, RoleEnumType } from "../enums/role.enum";
import { PermissionEnum, PermissionEnumType } from "../enums/permission.enum";
import { RolePermission } from "../utils/role-permission";

export interface RolePermissionDocument extends Document {
  role: RoleEnumType;
  permissions: Array<PermissionEnumType>;
  createdAt: Date;
  updatedAt: Date;
}

const rolePermissionModel = new Schema<RolePermissionDocument>(
  {
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      required: true,
    },
    permissions: {
      type: [String],
      enum: Object.values(PermissionEnum),
      required: true,
      default: function (this: RolePermissionDocument) {
        return RolePermission[this.role];
      },
    },
  },
  {
    timestamps: true,
  }
);

const RolePermissionModel = mongoose.model<RolePermissionDocument>(
  "RolePermission",
  rolePermissionModel
);
export default RolePermissionModel;
