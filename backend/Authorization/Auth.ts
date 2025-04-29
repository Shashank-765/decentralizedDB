import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from "../models/User";

// Custom Request type to add userData and id
interface CustomRequest extends Request {
  userData?: any; // ideally use your UserModel type
  id?: number;
}
export const generateAccessToken = async (email: string): Promise<string> => {
  const secret = '@metaspace@Bastionex';
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  const token = jwt.sign({ email }, secret, { expiresIn: '24h' });
  return token;
};

// Middleware to authorize user
export const authorize = async (req: CustomRequest,res: Response,next: NextFunction): Promise<void> => {
  const _secrate = req.headers["_token"] as string | undefined;

  if (!_secrate) {
    res.status(401).json({ success: false, message: "Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(_secrate, '@metaspace@Bastionex') as JwtPayload;
    const userData = await User.findOne({email:decoded?.email});
    if (!userData) {
      res.status(400).json({ message: "User not found", success: false });
      return;
    }
    req.userData = userData;
    req.id = userData.id;
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    res
      .status(401)
      .json({ success: false, message: "Unauthorized user", error: err });
  }
};
