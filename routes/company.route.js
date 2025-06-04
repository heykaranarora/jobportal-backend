import express from "express"
import isAthenticated from "../middlewares/isAuthenticated.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";
const router=express.Router();

router.post("/register",isAthenticated, registerCompany);
router.get("/get",isAthenticated, getCompany);
router.get("/get/:id", isAthenticated, getCompanyById);
router.put("/update/:id", isAthenticated,singleUpload, updateCompany);


export default router;