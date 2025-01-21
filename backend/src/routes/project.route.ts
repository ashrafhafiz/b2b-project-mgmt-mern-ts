import { Router } from "express";
import {
  createProjectContoller,
  deleteProjectController,
  getAllProjectsInWorkspaceContoller,
  getProjectAnalyticsController,
  getProjectByIdInWorkspaceByIdContoller,
  updateProjectController,
} from "../controllers/project.controller";

const router = Router();

router.post("/workspace/:workspaceId/create", createProjectContoller);
router.get("/workspace/:workspaceId/all", getAllProjectsInWorkspaceContoller);
router.get(
  "/:projectId/workspace/:workspaceId",
  getProjectByIdInWorkspaceByIdContoller
);
router.get(
  "/:projectId/workspace/:workspaceId/analytics",
  getProjectAnalyticsController
);
router.put(
  "/:projectId/workspace/:workspaceId/update",
  updateProjectController
);
router.delete(
  "/:projectId/workspace/:workspaceId/delete",
  deleteProjectController
);

export default router;
