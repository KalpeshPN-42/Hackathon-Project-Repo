import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import resumeRouter from "./resume";
import adminRouter from "./admin";
import recruiterRouter from "./recruiter";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/jobs", jobsRouter);
router.use("/applications", applicationsRouter);
router.use("/resume", resumeRouter);
router.use("/admin", adminRouter);
router.use("/recruiter", recruiterRouter);

export default router;
