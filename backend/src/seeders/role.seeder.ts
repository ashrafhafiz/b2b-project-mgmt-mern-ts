import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config";
import RolePermissionModel from "../models/role-permission.model";
import { RolePermission } from "../utils/role-permission";

const seedRoles = async () => {
  console.log("Seeding roles started...");

  try {
    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Clearing existing roles...");
    await RolePermissionModel.deleteMany({}, { session });

    for (const roleName in RolePermission) {
      const role = roleName as keyof typeof RolePermission;
      const permissions = RolePermission[role];

      // Check if the role already exists
      const existingRole = await RolePermissionModel.findOne({
        role: role,
      }).session(session);

      if (!existingRole) {
        const newRole = new RolePermissionModel({
          role: role,
          permissions: permissions,
        });
        await newRole.save({ session });
        console.log(`Role ${role} added with permissions...`);
      } else {
        console.log(`Role ${role} already exists...`);
      }
    }

    await session.commitTransaction();
    console.log("Transaction committed...");

    session.endSession();
    console.log("Session ended...");

    console.log("Seeding completed successfully...");
  } catch (error) {
    console.log("Error during seeding roles, ", error);
  }
};

seedRoles().catch((error) => console.log("Error running seed script: ", error));
