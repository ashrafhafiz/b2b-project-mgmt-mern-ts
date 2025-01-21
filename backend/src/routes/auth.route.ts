import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import {
  googleLoginCallback,
  loginUserController,
  logOutUserController,
  registerUserController,
} from "../controllers/auth.controller";

const router = Router();

const failureUrl = `${config.GOOGLE_CALLBACK_URL}?status=failure`;

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/logout", logOutUserController);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: failureUrl }),
  googleLoginCallback
);

export default router;
