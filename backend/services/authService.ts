import User, { IUser } from "../models/User";
import {mnemonic} from "../config/config.json"
import {ethers} from "ethers"
export const registerUser = async (name: string, email: string, password: string, userType: string): Promise<IUser> => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error("User already exists");
    }
    const userCount = await User.countDocuments();
    console.log('userCount', userCount)
    // Generate wallet using mnemonic and user index
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${userCount}`);
    console.log('wallet', wallet)
    const user = new User({ name, email, password, userType, walletAddress: wallet.address,
        privateKey: wallet.privateKey });
    await user.save();

    return user;
};

export const loginUser = async (email: string, password: string): Promise<IUser> => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("email Doesn't exist");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    return user;
};

export const userList = async (): Promise<IUser[]> => {
    const users = await User.find({ userType: "User" });

    if (users.length === 0) {
        throw new Error("No users found");
    }

    return users;
};

