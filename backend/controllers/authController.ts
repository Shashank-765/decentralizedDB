import { Request, Response } from "express";
import * as authService from "../services/authService";
export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        const user = await authService.createAdmin(name, email);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { name, email, userType } = req.body;
        const user = await authService.updateUser(name, email, userType);
        res.status(201).json({ message: "User updated successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const getuserdata = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        const data = await authService.getUserData(email as string);
        res.status(201).json({ message: "data fetched", data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const login = async (req: Request, res: Response) => {
    try {
        const { walletAddress, email, name } = req.body;
        const user = await authService.loginUser(email, walletAddress, name);
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

