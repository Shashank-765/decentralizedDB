import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  profileImage: string;
  userType: string;
  privateKey: string;
  documentHash: string[];
  bloodGroup: string;
  walletAddress: string;
  gender: "Male" | "Female";
  otp: string;
  isBlocked: boolean;
  isotp_verified: boolean;
  token:string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String},
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    profileImage: { type: String },
    userType: { type: String, default: "User" },
    privateKey: { type: String }, // it should be required 
    documentHash: [{ type: String }],
    bloodGroup: { type: String },
    walletAddress: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female"] },
    otp: { type: String, default: "" },
    isotp_verified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    token:{ type: String}
  },
  { timestamps: true }
);

// Hash password before saving
// UserSchema.pre("save", async function (next) {
//      const user = this as IUser;
//     if (!user .isModified("password")) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// Compare password method
// UserSchema.methods.matchPassword = async function (enteredPassword: string) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

export default mongoose.model<IUser>("User", UserSchema);
