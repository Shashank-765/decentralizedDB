import User, { IUser } from "../models/User";




export const UploadDocs = async (name: string, email: string, password: string): Promise<IUser> => {
    const userExists = await User.findOne({ email });

    if (!userExists) {
        throw new Error("User Doesn't exists");
    }

    

    const user = new User({ name, email, password });
    await user.save();

    return user;
};

