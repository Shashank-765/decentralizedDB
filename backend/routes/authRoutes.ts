
import express from "express";
import {
  createAdmin, login, userList, updateUser, getuserdata,
  blockUser, unblockUser, addDocument, getAllUsers, getAllAdmins
} from "../controllers/authController";
import { authorize } from "../Authorization/Auth";

const router = express.Router();

router.post("/createAdmin", createAdmin);
router.post("/updateUser", authorize, updateUser);
router.post("/login", login);
router.get("/userList", userList);
router.get("/getUserProfileData", getuserdata);
router.get("/getAllUsers", getAllUsers);
router.get("/getAllAdmins", getAllAdmins);
router.post("/blockUser", authorize, blockUser);
router.post("/unblockUser", authorize, unblockUser);
router.post("/addDocument", authorize, addDocument);
// router.get("/logout", (req, res) => {
//   req.logout(err => {
//     if (err) {
//       return res.status(500).json({ message: "Logout failed" });
//     }

//     req.session.destroy(() => {
//       res.clearCookie("connect.sid");
//       res.status(200).json({ message: "Logged out" });
//     });
//   });
// });


export default router;
