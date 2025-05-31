import express from 'express'
import cors from 'cors'
import passport from "passport";
import bookRouter from './routes/book.route'
import connectDB from './config/mongo.config'
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import session from "express-session";
import "./config/passportConfig";

const app = express()
connectDB()
app.use(cors())
// app.use(cors({
//   origin: (origin, callback) => callback(null, origin),
//   credentials: true
// }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "@arun#rana$metaspacechain",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,       // ✅ Set true only in HTTPS production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true               
}));


app.use("/api/auth", authRoutes);
app.use(errorHandler);

app.use('/books', bookRouter)

export default app
