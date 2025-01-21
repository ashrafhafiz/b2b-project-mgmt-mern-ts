import { Router } from "express";
import {
  createTaskController,
  deleteTaskController,
  getAllTasksInWorkspaceController,
  getTaskByIdController,
  updateTaskController,
} from "../controllers/task.controller";

const router = Router();

router.post(
  "/project/:projectId/workspace/:workspaceId/create",
  createTaskController
);
router.put(
  "/:taskId/project/:projectId/workspace/:workspaceId/update",
  updateTaskController
);
router.delete(
  "/:taskId/project/:projectId/workspace/:workspaceId/delete",
  deleteTaskController
);
router.get("/workspace/:workspaceId/all", getAllTasksInWorkspaceController);
router.get(
  "/:taskId/project/:projectId/workspace/:workspaceId",
  getTaskByIdController
);

export default router;
