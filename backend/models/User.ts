import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  userType: string;
  privateKey: string;
  walletAddress: string;
  isBlocked: boolean;
  token: string;
  orgContractAddress: string;
  organization: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    userType: { type: String, default: "User" },
    privateKey: { type: String }, // it should be required 
    walletAddress: { type: String },
    isBlocked: { type: Boolean, default: false },
    token: { type: String },
    orgContractAddress: { type: String },
    organization: { type: String }
  },
  { timestamps: true }
);


export default mongoose.model<IUser>("User", UserSchema);
