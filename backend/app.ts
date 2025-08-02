import express from 'express'
import cors from 'cors'
import connectDB from './config/mongo.config'
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import session from "express-session";

const app = express()
connectDB()
app.use(cors({
  origin: (origin, callback) => callback(null, origin),
  credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "@arun#rana$metaspacechain",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,      
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));


app.use("/api/auth", authRoutes);
app.use(errorHandler);


export default app

let arr =[1,2,-5,6,-9,0,-1,6];
 for(let i=0;i<arr.length;i++){
    
 }
