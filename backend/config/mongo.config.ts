import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shashank:U6YWW3TvbQyZA4qB@cluster0.yqzbd.mongodb.net/DecentralizedDb?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
     
    } as mongoose.ConnectOptions);

    console.log("✅ MongoDB Connected Successfully");
    return
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;


