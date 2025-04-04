import express from 'express'
import cors from 'cors'

import bookRouter from './routes/book.route'
import connectDB from './config/mongo.config'
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express()
connectDB()
app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use(errorHandler);

app.use('/books', bookRouter)

export default app
