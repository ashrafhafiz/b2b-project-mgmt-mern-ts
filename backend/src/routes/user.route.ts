import { Router } from "express";
import { getCurrentUser } from "../controllers/user.controller";

const router = Router();

router.get("/current", getCurrentUser);

export default router;
