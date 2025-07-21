import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
dotenv.config();

// Custom Request type to add userData and id
interface CustomRequest extends Request {
  userData?: IUser;
  id?: number;
}
export const generateAccessToken = async (email: string): Promise<string> => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  const token = jwt.sign({ email }, secret, { expiresIn: '24h' });
  return token;
};

// Middleware to authorize user
export const authorize = async (req: CustomRequest,res: Response,next: NextFunction): Promise< Response | void> => {
  const _secrate = req.headers["_token"] as string | undefined;

  if (!_secrate) {
    return res.status(401).json({ success: false, message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(_secrate, process.env.JWT_SECRET as string) as JwtPayload;
    const userData = await User.findOne({email:decoded?.email});
    if (!userData) {
      return res.status(400).json({ message: "User not found", success: false });
    }
    req.userData = userData;
    req.id = userData.id;
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user...", error: err });
  }
};
