import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validations/workspace.validation";
import { projectIdSchema } from "../validations/project.validation";
import { createTaskSchema, taskIdSchema } from "../validations/task.validation";
import { HTTPSTATUS } from "../config/http.config";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import { PermissionEnum } from "../enums/permission.enum";
import {
  createTaskService,
  deleteTaskService,
  getAllTasksInWorkspaceService,
  getTaskByIdService,
  updateTaskService,
} from "../services/task.service";

export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const userId = req.user?._id;
    const data = createTaskSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.CREATE_TASK]);

    const { task } = await createTaskService(
      workspaceId,
      projectId,
      userId,
      data
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Task has been created successfully!",
      task,
    });
  }
);

export const updateTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const userId = req.user?._id;
    const data = createTaskSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.EDIT_TASK]);

    const { task } = await updateTaskService(
      workspaceId,
      projectId,
      taskId,
      data
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task has been updated successfully!",
      task,
    });
  }
);

export const getAllTasksInWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status
        ? (req.query.status as string)?.split(",")
        : undefined,
      priority: req.query.priority
        ? (req.query.priority as string)?.split(",")
        : undefined,
      assignedTo: req.query.assignedTo
        ? (req.query.assignedTo as string)?.split(",")
        : undefined,
      keyword: req.query.keyword as string | undefined,
      dueDate: req.query.dueDate as string | undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 10,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.VIEW_ONLY]);

    const results = await getAllTasksInWorkspaceService(
      workspaceId,
      filters,
      pagination
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Tasks has been fetched successfully!",
      ...results,
    });
  }
);

export const getTaskByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.VIEW_ONLY]);

    const { task } = await getTaskByIdService(workspaceId, projectId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task has been fetched successfully!",
      task,
    });
  }
);

export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.DELETE_TASK]);

    const { deletedTask } = await deleteTaskService(
      workspaceId,
      projectId,
      taskId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task has been fetched successfully!",
      task: deletedTask,
    });
  }
);
