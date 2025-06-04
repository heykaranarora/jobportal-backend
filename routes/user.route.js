import express from "express"
import { register,login,updateProfile,logout } from "../controllers/user.controller.js";
import isAthenticated from "../middlewares/isAuthenticated.js";
const router=express.Router();
import { singleUpload } from "../middlewares/multer.js";

router.post("/register",singleUpload,register);
router.post("/login", login);
router.get("/logout", isAthenticated, logout);
router.post("/profile/update", isAthenticated,singleUpload, updateProfile);



export default router;