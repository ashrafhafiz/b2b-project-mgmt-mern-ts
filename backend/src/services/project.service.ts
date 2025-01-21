import mongoose from "mongoose";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { NotFoundException } from "../utils/app.error";
import { TaskStatusEnum } from "../enums/task-status.enum";
import WorkspaceModel from "../models/workspace.model";

export const createProjectService = async (
  userId: string,
  workspaceId: string,
  name: string,
  emoji?: string | null,
  description?: string | null
) => {
  const project = new ProjectModel({
    name,
    description,
    emoji,
    workspace: workspaceId,
    createdBy: userId,
  });
  await project.save();
  return { project };
};

export const getAllProjectsInWorkspaceService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number
) => {
  const totalCount = await ProjectModel.countDocuments({
    workspace: workspaceId,
  });
  const skip = (pageNumber - 1) * pageSize;

  const projects = await ProjectModel.find({ workspace: workspaceId })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / pageSize);
  return { projects, totalCount, totalPages, skip };
};

export const getProjectByIdInWorkspaceByIdService = async (
  projectId: string,
  workspaceId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id name description emoji");

  return { project };
};

export const getProjectAnalyticsService = async (
  projectId: string,
  workspaceId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });
  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace!"
    );
  }

  const currentDate = new Date();
  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: { $ne: TaskStatusEnum.DONE },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          {
            $count: "count",
          },
        ],
      },
    },
  ]);
  const _analytics = taskAnalytics[0];
  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return { analytics };
};

export const updateProjectService = async (
  userId: string,
  workspaceId: string,
  projectId: string,
  name: string,
  emoji?: string | null,
  description?: string | null
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });
  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace!"
    );
  }

  name && (project.name = name);
  emoji && (project.emoji = emoji);
  description && (project.description = description);

  await project.save();

  return { project };
};

export const deleteProjectService = async (
  workspaceId: string,
  projectId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });
  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace!"
    );
  }

  await TaskModel.deleteMany({ project: project._id });
  await project.deleteOne();
  return { project };
};
