import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/app.error";

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  data: {
    title: string;
    description?: string | null;
    priority?: string | null;
    status?: string | null;
    assignedTo?: string | null;
    dueDate?: string | null;
  }
) => {
  const { title, description, priority, status, assignedTo, dueDate } = data;
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }
  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace!"
    );
  }

  if (assignedTo) {
    const isAssignedToUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });
    if (!isAssignedToUserMember) {
      throw new Error("Assigned user is not a member of this workspace");
    }
  }

  const task = new TaskModel({
    title,
    description,
    priority,
    status,
    assignedTo,
    dueDate,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
  });

  await task.save();
  return { task };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  data: {
    title: string;
    description?: string | null;
    priority?: string | null;
    status?: string | null;
    assignedTo?: string | null;
    dueDate?: string | null;
  }
) => {
  const { title, description, priority, status, assignedTo, dueDate } = data;
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }
  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace!"
    );
  }
  const task = await TaskModel.findOne({
    _id: taskId,
    project: projectId,
    workspace: workspaceId,
  });
  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project!"
    );
  }

  if (assignedTo) {
    const isAssignedToUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });
    if (!isAssignedToUserMember) {
      throw new BadRequestException(
        "Assigned user is not a member of this workspace!"
      );
    }
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    { ...data },
    { new: true }
  );
  if (!updatedTask) {
    throw new BadRequestException("Failed to update the task!");
  }

  return { task: updatedTask };
};

export const getAllTasksInWorkspaceService = async (
  workspaceId: string,
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }

  const query: Record<string, any> = {
    workspace: workspaceId,
  };
  if (filters.projectId) query.project = filters.projectId;
  if (filters.status && filters.status?.length > 0)
    query.status = { $in: filters.status };
  if (filters.priority && filters.priority?.length > 0)
    query.priority = { $in: filters.priority };
  if (filters.assignedTo && filters.assignedTo?.length > 0)
    query.assignedTo = { $in: filters.assignedTo };
  if (filters.keyword && filters.keyword !== undefined)
    query.title = { $regex: filters.keyword, $options: "i" };
  if (filters.dueDate) query.dueDate = { $eq: new Date(filters.dueDate) };

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    tasks,
    pagination: { pageSize, pageNumber, totalCount, totalPages, limit: skip },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }
  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace!"
    );
  }
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "_id name profilePicture -password");

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project!"
    );
  }

  return { task };
};

export const deleteTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found!");
  }
  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace!"
    );
  }
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project!"
    );
  }

  const deletedTask = await TaskModel.findOneAndDelete({ _id: task._id });

  return { deletedTask };
};
