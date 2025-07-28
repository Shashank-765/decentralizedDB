import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
console.log(MONGO_URI,'this is mongo url====>')
if (!MONGO_URI) {
  throw new Error("Please provide MONGO_URI in the environment variables");
}
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
     
    } as mongoose.ConnectOptions);

    console.log("MongoDB Connected Successfully ...");
    return
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;


