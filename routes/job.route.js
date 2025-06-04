import express from "express"
import isAthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob } from "../controllers/job.controller.js";
const router=express.Router();

router.post("/post",isAthenticated, postJob);
router.get("/get",isAthenticated, getAllJobs);
router.get("/getadminjobs",isAthenticated, getAdminJobs);
router.get("/get/:id",isAthenticated, getJobById);


export default router;