import { Request, Response } from "express";
import * as authService from "../services/authService";



export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email,orgContractAddress,organization,privateKey,walletAddress } = req.body;
        const user = await authService.createAdmin(name, email,orgContractAddress,organization,privateKey,walletAddress);
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
        const { _id } = req.body;
        const user = await authService.blockUser(_id);
        res.status(200).json({ message: "User blocked successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const unblockUser = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;
        const user = await authService.unblockUser(_id);
        res.status(200).json({ message: "User unblocked successfully", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const addDocument = async (req: Request, res: Response) => {
    try {
        const { userId, cid, type, approvedBy } = req.body;
        const document = await authService.addDocument(userId, cid, type, approvedBy);
        res.status(200).json({ message: "Document added successfully", document });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const user = await authService.getAllUsers();
        res.status(200).json({ message: "User Fetched successful", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const getAllAdmins = async (req: Request, res: Response) => {
    try {
        const admin = await authService.getAllAdmins();
        res.status(200).json({ message: "Admin Fetched successful", admin });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const approveDocument = async (req: Request, res: Response) => {
    try {
        const { cid, approvedBy } = req.body
        const data = await authService.approvedDocument(cid, approvedBy);
        return res.status(200).json({ message: "Document Approved successfully", data })
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}
export const rejectDocument = async (req: Request, res: Response) => {
    try {
        const { cid, rejectedBy } = req.body
        const data = await authService.rejectDocument(cid, rejectedBy);
        return res.status(200).json({ message: "Document Rejected successfully", data })
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}
export const getGraphData = async (req: Request, res: Response) => {
    try {
        const {filterType, startDate, endDate } = req.query;
        
        let format = "%Y-%m"; 
        if (filterType === "day") format = "%Y-%m-%d";
        else if (filterType === "week") format = "%Y-%U";
        else if (filterType === "year") format = "%Y";
        const data = await authService.getGraphData(format, startDate as string,endDate as string);
        res.status(200).json({ message: "User Graph Data Fetched successful", data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const fakeDataToStore = async (req: Request, res: Response) => {
    try {
        const data = await authService.fakeDataToStore();
        res.status(200).json({ message: "Fake Data Stored successfully", data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const userListByWalletAddress = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.query;
        const user = await authService.userListByWalletAddress(walletAddress as string);
        res.status(200).json({ message: "User Fetched successful", user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const getOrganizationContractAddress = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        const data = await authService.getOrganizationContractAddress(type as string);
        res.status(200).json({ message: "Organization Contract Address Fetched successful", data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const getAllOrganization = async (req: Request, res: Response) => {
    try {
        const data = await authService.getAllOrganization();
        res.status(200).json({ message: "Organization Fetched successful", data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const getAllAdminsByWalletAddress = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.query;
        const data = await authService.getAllAdminsByWalletAddress(walletAddress as string);
        res.status(200).json({ message: "Admin Fetched successful", data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}






