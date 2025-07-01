import { Request, Response } from "express";
import * as authService from "../services/authService";
export const register = async (req: Request, res: Response)  => {
    try {
        const { name, email, password, userType,mobile,bloodGroup,gender } = req.body;
        const user = await authService.registerUser(name, email, password,userType,mobile,bloodGroup,gender);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const updateUser = async (req: Request, res: Response)  => {
    try {
        const { name, email, userType,mobile,bloodGroup,gender } = req.body;
        const user = await authService.updateUser(name, email,userType,mobile,bloodGroup,gender);
        res.status(201).json({ message: "User updated successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const getuserdata = async (req: Request, res: Response)  => {
    try {
        const { email } = req.query;
        const data = await authService.getUserData(email as string);
        res.status(201).json({ message: "data fetched", data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const verifyUserPassword = async (req: Request, res: Response) => {  
    try {
        const { email, password, name,profileImage } = req.body;
        const user = await authService.loginUser(email, password,name,profileImage);
        res.status(200).json({ message: "Password verified successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const otpverificationemailendpoint = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const otppass = '123456';
        const user = await authService.sendOtpVerificationEmail(email,otppass);
        res.status(200).json({ message: "OTP sent successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;
        const user = await authService.updateUserPassword(email, newPassword);
        res.status(200).json({ message: "Password updated successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const verifyOtp = async (req: Request, res: Response) => {
    try {   
        const { email, otp } = req.body;
        const user = await authService.verifyOtp(email, otp);
        res.status(200).json({ message: "OTP verified successfully", user });
    }
    catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const login = async (req: Request, res: Response) => {
    try {
        const { walletAddress, email , name,profileImage} = req.body;
        const user = await authService.loginUser(email, walletAddress, name,profileImage);
        res.status(200).json({ message: "Login successful", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const userList = async (req: Request, res: Response) => {
    try {
        const user = await authService.userList();
        res.status(200).json({ message: "User Fetched successful", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const blockUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const user = await authService.blockUser(id);
        res.status(200).json({ message: "User blocked successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const unblockUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const user = await authService.unblockUser(id);
        res.status(200).json({ message: "User unblocked successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

