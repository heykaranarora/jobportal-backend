import express from "express"
import { adminLogin, getAllUsers,logout,deleteUser, blockUser, unblockUser,getAllCompanies,verifyOtp,deleteCompany,loginData 
    
 } from "../controllers/admin.controler.js";
import isAthenticated from "../middlewares/isAuthenticated.js";

const router=express.Router();
router.post("/login", adminLogin);
router.get  ("/getallusers", getAllUsers);
router.get("/getallcompanies", getAllCompanies);
router.get("/logout", isAthenticated, logout);
router.delete('/deleteuser/:id',isAthenticated, deleteUser);
router.patch('/blockuser/:id', isAthenticated,blockUser);
router.patch('/unblockuser/:id',isAthenticated, unblockUser);
router.post('/verifyotp',verifyOtp);
router.delete('/deletecompany/:id',isAthenticated,deleteCompany);
router.get('/logindetails',isAthenticated,loginData);



export default router;