import express from "express";
import adminRouter from "./routes/adminRoutes.js";
import connectDB from "./config/connectMongoDB.js";

// load the environment variables
import dotenv from 'dotenv';
dotenv.config({path: "./.env"});

const PORT = process.env.PORT || 5000;
const app = express();

// estabilse the connection 

connectDB();

// middlewares
// Middleware to parse JSON bodies into js Object
app.use(express.json());

app.use("/api/admin", adminRouter);

app.listen( PORT, ()=>{
    console.log(`the server is running on port ${PORT}`);
});