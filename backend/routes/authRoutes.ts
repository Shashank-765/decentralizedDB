
import express from "express";
import {
  createAdmin, login, userList, updateUser, getuserdata,
  blockUser, unblockUser, addDocument, getAllUsers, getAllAdmins, approveDocument, rejectDocument,getGraphData,fakeDataToStore,userListByWalletAddress
} from "../controllers/authController";
import { authorize } from "../Authorization/Auth";

const router = express.Router();

router.post("/createAdmin", authorize, createAdmin);
router.post("/updateUser", authorize, updateUser);
router.post("/login", login);
router.get("/userList", userList);
router.get("/getUserProfileData", getuserdata);
router.get("/getAllUsers", getAllUsers);
router.get("/getAllAdmins", getAllAdmins);
router.post("/blockUser", authorize, blockUser);
router.post("/unblockUser", authorize, unblockUser);
router.post("/addDocument", authorize, addDocument);
router.post("/approveDocument", authorize, approveDocument);
router.post("/rejectDocument", authorize, rejectDocument)
router.get('/getGraphData',authorize,getGraphData)
router.post('/fakeDataToStore',fakeDataToStore)
router.get('/userListByWalletAddress',userListByWalletAddress)

export default router;
