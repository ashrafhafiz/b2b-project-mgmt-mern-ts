import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDB from "./config/db.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/app.error";
import { ErrorCodeEnum } from "./enums/error-code.enum";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import workspaceRouter from "./routes/workspace.route";
import memberRouter from "./routes/member.route";
import projectRouter from "./routes/project.route";
import taskRouter from "./routes/task.route";
import "./config/passort.config";
import passport from "passport";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // throw new BadRequestException(
    //   "Bad request",
    //   ErrorCodeEnum.AUTH_INVALID_TOKEN
    // );
    res.status(HTTPSTATUS.OK).json({
      message: "Hello subscribe to the channel & share.",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRouter);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRouter);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRouter);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRouter);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRouter);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRouter);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDB();
});
