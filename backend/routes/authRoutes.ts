import express from "express";
import { register, login, userList } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/userList", userList);

export default router;
