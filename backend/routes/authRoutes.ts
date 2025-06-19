
import express from "express";
import passport from "passport";
import {
  register, login, userList, updateUser, getuserdata,
  verifyUserPassword, updatePassword,
  otpverificationemailendpoint, verifyOtp
} from "../controllers/authController";
import { authorize } from "../Authorization/Auth";

const router = express.Router();

router.post("/register", register);
router.post("/updateUser", authorize, updateUser);
router.post("/login", login);
router.post("/userList", userList);
router.get("/getuserdata", getuserdata);
router.post("/updatePassword", updatePassword);
router.post("/verifyUserPassword", verifyUserPassword);
router.post("/otpverifiucation", otpverificationemailendpoint);
router.post("/verifiedotp", verifyOtp);

router.get("/google",passport.authenticate("google", {
      scope: ["profile", "email"],
      session: true 
  })
);

router.get("/google/callback",passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/decentralizedDb/#/?authSuccess=true");
  }
);

router.get("/facebook", passport.authenticate("facebook", { 
   scope: ["email"] 
   }));

router.get("/facebook/callback", passport.authenticate("facebook", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/decentralizedDb/#/?authSuccess=true")
  }
);

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});

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
