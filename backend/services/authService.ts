import User, { IUser } from "../models/User";
import { generateAccessToken } from '../Authorization/Auth'
import DocumentCidModel , {DocumentCid} from "../models/documentCid";

export const createAdmin = async (name: string, email: string): Promise<IUser> => {
    console.log(name,email,'this is name and email');
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User already exists");
    }
    const token = await generateAccessToken(email);
    const user = new User({
        name, email, userType: "Admin", token
    });
    await user.save();

    return user;
};
export const updateUser = async (name: string, email: string, userType: string): Promise<IUser> => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    user.name = name ? name : user.name;
    user.email = email ? email : user.email;
    user.userType = userType ? userType : user.userType;
    await user.save();

    return user;
};
export const getUserData = async (email: string): Promise<IUser> => {
    const data = await User.findOne({ email });
    if (!data) {
        throw new Error("User not found");
    }
    return data;
}
export const loginUser = async (email: string, walletAddress: string, name: string): Promise<IUser> => {
    const userExists = await User.findOne({ email });
    let user;
    
    if (userExists) {
        if (userExists.isBlocked) {
            throw new Error("User is blocked");
        }
        user = userExists;
        
        if (!userExists.walletAddress) {
            userExists.walletAddress = walletAddress;
            await userExists.save();
        }
    } else {
        user = await User.create({
            email,
            walletAddress,
            name,
        });
    }
    
    const token = await generateAccessToken(email);
    user.token = token;
    await user.save();
    return user;
};
export const userList = async (): Promise<IUser[]> => {
    const users = await User.find({ userType: "User" });

    if (users.length === 0) {
        throw new Error("No users found");
    }

    return users;
};
export const blockUser = async (id: string): Promise<IUser> => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }
    user.isBlocked = false;
    await user.save();
    return user;
};
export const unblockUser = async (id: string): Promise<IUser> => {
try {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }
    user.isBlocked = true;
    await user.save();
    return user;
} catch (error : any) {
    throw new Error(error.message);
}
};
export const addDocument = async (userId: string, cid: string, type: string, walletAddress: string): Promise<DocumentCid> => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
      const document =  new DocumentCidModel({ userId, cid, type, walletAddress });
      await document.save();
        return document;
    } catch (error: any) {
        throw new Error(error.message);
    }
};


