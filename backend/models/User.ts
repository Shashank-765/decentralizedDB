import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  userType: string;
  privateKey: string;
  documentType: string;
  walletAddress: string;
  isBlocked: boolean;
  token: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    userType: { type: String, default: "User" },
    privateKey: { type: String }, // it should be required 
    documentType: { type: String, default: "" },
    walletAddress: { type: String },
    isBlocked: { type: Boolean, default: false },
    token: { type: String }
  },
  { timestamps: true }
);


export default mongoose.model<IUser>("User", UserSchema);
