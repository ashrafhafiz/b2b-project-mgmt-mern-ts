import mongoose from "mongoose";
import WorkspaceModel from "../models/workspace.model";
import UserModel from "../models/user.model";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import RolePermissionModel from "../models/role-permission.model";
import { RoleEnum } from "../enums/role.enum";
import { TaskStatusEnum } from "../enums/task-status.enum";
import { BadRequestException, NotFoundException } from "../utils/app.error";

export const createWorkspaceService = async (
  userId: string,
  body: { name: string; description?: string | undefined }
) => {
  const { name, description } = body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log("Session create workspace started...");

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found!");
    }

    const ownerRole = await RolePermissionModel.findOne({
      role: RoleEnum.OWNER,
    }).session(session);
    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const existingWorkspace = await WorkspaceModel.findOne({ name }).session(
      session
    );
    if (existingWorkspace) {
      throw new BadRequestException("Name already in use!");
    }

    const workspace = new WorkspaceModel({
      name,
      description,
      owner: userId,
    });
    await workspace.save({ session });

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save({ session });

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log("Session create workspace ended...");

    return { workspace };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found!");
  }

  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  const workspaces = memberships.map((membership) => membership.workspaceId);

  return { workspaces };
};

export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }

  const members = await MemberModel.find({ workspaceId }).populate("role");

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return { workspace: workspaceWithMembers };
};

export const getWorkspaceMembersService = async (workspaceId: string) => {
  const members = await MemberModel.find({ workspaceId })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "role");

  const roles = await RolePermissionModel.find({}, { role: 1, _id: 1 })
    .select("-permissions")
    .lean();

  return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date();
  const totalTasks = await TaskModel.countDocuments({ workspace: workspaceId });
  const overdueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });
  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });
  const analytics = { totalTasks, overdueTasks, completedTasks };

  return { analytics };
};

export const changeWorkspaceMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }

  const role = await RolePermissionModel.findById(roleId);
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId,
  });
  if (!member) {
    throw new NotFoundException("Member not found in the workspace!");
  }

  member.role = role;
  await member.save();
  return { member };
};

export const updateWorkspaceByIdService = async (
  workspaceId: string,
  name: string,
  description?: string | null
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }
  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;

  await workspace.save();

  return { workspace };
};

export const deleteWorkspaceByIdService = async (
  workspaceId: string,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const workspace = await WorkspaceModel.findById(workspaceId).session(
      session
    );
    if (!workspace) {
      throw new NotFoundException("Workspace not found!");
    }

    // Check if the user owns the workspace
    if (workspace.owner.toString() !== userId) {
      throw new BadRequestException(
        "You are not authorized to delete this workspace!"
      );
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException("User not found!");
    }

    await ProjectModel.deleteMany({ workspace: workspace._id }).session(
      session
    );
    await TaskModel.deleteMany({ workspace: workspace._id }).session(session);
    await MemberModel.deleteMany({ workspaceId: workspace._id }).session(
      session
    );

    // Update the user's currentWorkspace if if matches the deleted workspace
    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({ userId }).session(
        session
      );
      // Update the user's currentWorkspace
      user.currentWorkspace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;
      await user.save({ session });
    }
    await workspace.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();
    return { currentWorkspace: user.currentWorkspace };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
