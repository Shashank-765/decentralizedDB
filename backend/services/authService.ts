import User, { IUser } from "../models/User";
import {mnemonic} from "../config/config.json"
import {ethers} from "ethers"
import nodemailer from "nodemailer";
import {generateAccessToken} from '../Authorization/Auth'
 let transporter = nodemailer.createTransport({
  host: "mail.smtp2go.com",
  port: 2525,
  secure: false,
  auth: {
    user: 'Businessbay',
    pass: '4RlUtFpREiCs5tn7',
  },
});
export const registerUser = async (name: string, email: string, password: string, userType: string,mobile: string,bloodGroup: string,gender:string): Promise<IUser> => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error("User already exists");
    }
    const token = await generateAccessToken(email);
    const userCount = await User.countDocuments();
    console.log('userCount', userCount)
    // Generate wallet using mnemonic and user index
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${userCount}`);
    console.log('wallet', wallet)
    const user = new User({ name, email, password, userType,mobile,bloodGroup,gender, walletAddress: wallet.address,
        privateKey: wallet.privateKey,token });
    await user.save();

    return user;
};
export const updateUser = async (name: string,email: string,userType: string,mobile: string,bloodGroup: string,gender: "Male" | "Female"): Promise<IUser> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  user.name = name? name : user.name;
  user.email = email? email : user.email;   
  user.userType = userType? userType : user.userType;
  user.mobile = mobile? mobile : user.mobile;
  user.bloodGroup = bloodGroup? bloodGroup : user.bloodGroup;
  user.gender = gender? gender: user.gender;

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
export const updateUserPassword = async (email: string, newPassword: string): Promise<IUser> => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    user.password = newPassword;
    await user.save();

    return user;
};
export const sendOtpVerificationEmail = async (email:string,otppass:string) => {
    const userdata = await User.findOne({ email });
   if (!userdata) {
       throw new Error("User not found");
   }
     userdata.otp = otppass;
     userdata.isotp_verified = false;
     await userdata.save();


     const otp = otppass
     const mailOptions = {
      from: 'noreply@businessbay.io',
      to: email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Confirmation</title>
            <style>
                .button {
                    background-color: #008CBA;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    font-size: 16px;
                    border-radius: 5px;
                    display: inline-block;
                    margin-top: 10px;
                }

                .button:hover {
                    background-color: #005f7a;
                }

                table {
                    width: 600px;
                    margin: 0 auto;
                    border-collapse: collapse;
                }

                table td {
                    padding: 10px;
                }

                .transaction-details, .payment-details {
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    margin-top: 20px;
                    padding: 15px;
                    border-radius: 5px;
                }

                .transaction-details td, .payment-details td {
                    padding: 8px;
                    font-family: 'Lato', sans-serif;
                    color: #333;
                }

                .status {
                    color: green;
                    font-weight: bold;
                }

                .title {
                    font-weight: bold;
                    font-size: 18px;
                    margin-bottom: 10px;
                }

                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-family: 'Lato', sans-serif;
                    font-size: 14px;
                    color: #666;
                }
            </style>
        </head>

        <body>
            <div style="margin:0;font-family: 'Lato', sans-serif;">
                <table style="width:600px;background-color:rgb(255,255,255);margin:0 auto;border-spacing:0;border-collapse:collapse">
                    <tbody>
                        <tr>
                            <td>
                                <p style="color:#000;text-align:center;font-size:16px;margin-bottom:20px;">
                                  Please verify your account by entering below OTP.
                                </p>
                                <p style="color:#000;text-align:center;font-size:16px;margin-bottom:20px;">
                                   OTP --- ${otp}
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </body>

        </html>

      `,
    };    
    await transporter.sendMail(mailOptions);
    return userdata;
};
export const verifyOtp = async (email: string, otp: string): Promise<IUser> => {
      const userfound = await User.findOne({ email });
    if (!userfound) {
        throw new Error("User not found");
    }
    if (userfound.otp !== otp) {
        throw new Error("Invalid OTP");
    }
    userfound.isotp_verified = true;
    userfound.otp = '';
    await userfound.save();
    return userfound;
}
export const loginUser = async (email: string, password: string): Promise<IUser> => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("email Doesn't exist");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }
     const token = await generateAccessToken(email);
     user.token=token;
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

