import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    userType: string;
    walletAddress: string;
    privateKey: string;
    documentHash: String[];
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        userType: { type: String, default: "User" },
        walletAddress: { type: String, required: true },
        privateKey: { type: String, required: true },

    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
