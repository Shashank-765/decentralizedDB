
import express from "express";
import {
  createAdmin, login, updateUser, getuserdata,
  blockUser, unblockUser, addDocument, approveDocument, rejectDocument, getGraphData, fakeDataToStore, userListByWalletAddress, getAllOrganization, getAllAdminsByWalletAddress
} from "../controllers/authController";
import { authorize } from "../Authorization/Auth";

const router = express.Router();

router.post("/createAdmin", authorize, createAdmin);
router.post("/updateUser", authorize, updateUser);
router.post("/login", login);
router.get("/getUserProfileData", getuserdata);
router.post("/blockUser", authorize, blockUser);
router.post("/unblockUser", authorize, unblockUser);
router.post("/addDocument", authorize, addDocument);
router.post("/approveDocument", authorize, approveDocument);
router.post("/rejectDocument", authorize, rejectDocument)
router.get('/getGraphData', authorize, getGraphData)
router.post('/fakeDataToStore', fakeDataToStore)
router.get('/userListByWalletAddress', userListByWalletAddress)
router.get('/getAllAdminsByWalletAddress', getAllAdminsByWalletAddress)
router.get('/getAllOrganization', getAllOrganization)

export default router;
