
import express from "express";
import {
  createAdmin, login, userList, updateUser, getuserdata,
  blockUser, unblockUser, addDocument
} from "../controllers/authController";
import { authorize } from "../Authorization/Auth";

const router = express.Router();

router.post("/createAdmin", createAdmin);
router.post("/updateUser", authorize, updateUser);
router.post("/login", login);
router.post("/userList", userList);
router.get("/getuserdata", getuserdata);
router.post("/blockUser",authorize, blockUser);
router.post("/unblockUser",authorize, unblockUser);
router.post("/addDocument", authorize, addDocument);
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out" });
    });
  });
});


export default router;
