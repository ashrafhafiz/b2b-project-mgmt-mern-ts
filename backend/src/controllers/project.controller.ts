import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "../validations/project.validation";
import { workspaceIdSchema } from "../validations/workspace.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { PermissionEnum } from "../enums/permission.enum";
import { roleGuard } from "../utils/roleGuard";
import { HTTPSTATUS } from "../config/http.config";
import {
  createProjectService,
  deleteProjectService,
  getAllProjectsInWorkspaceService,
  getProjectAnalyticsService,
  getProjectByIdInWorkspaceByIdService,
  updateProjectService,
} from "../services/project.service";
import { parse } from "path";

export const createProjectContoller = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, emoji, description } = createProjectSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.CREATE_PROJECT]);
    const { project } = await createProjectService(
      userId,
      workspaceId,
      name,
      emoji,
      description
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Project has been created successfully!",
      project,
    });
  }
);

export const getAllProjectsInWorkspaceContoller = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.VIEW_ONLY]);

    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const pageNumber = parseInt(req.query.pageNumber as string) || 1;

    const { projects, totalCount, totalPages, skip } =
      await getAllProjectsInWorkspaceService(workspaceId, pageSize, pageNumber);

    return res.status(HTTPSTATUS.OK).json({
      message: "Projects have been fetched successfully!",
      projects,
      pagination: {
        totalCount,
        pageSize,
        pageNumber,
        totalPages,
        skip,
        limit: pageSize,
      },
    });
  }
);

export const getProjectByIdInWorkspaceByIdContoller = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.VIEW_ONLY]);

    const { project } = await getProjectByIdInWorkspaceByIdService(
      projectId,
      workspaceId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Project has been fetched successfully!",
      project,
    });
  }
);

export const getProjectAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.VIEW_ONLY]);

    const { analytics } = await getProjectAnalyticsService(
      projectId,
      workspaceId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Project analytics retrieved successfully!",
      analytics,
    });
  }
);

export const updateProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;
    const { name, emoji, description } = updateProjectSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.EDIT_PROJECT]);

    const { project } = await updateProjectService(
      userId,
      workspaceId,
      projectId,
      name,
      emoji,
      description
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Project has been updated successfully!",
      project,
    });
  }
);

export const deleteProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [PermissionEnum.DELETE_PROJECT]);

    const { project } = await deleteProjectService(workspaceId, projectId);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Project has been deleted successfully!",
      project,
    });
  }
);
