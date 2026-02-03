import "./uitls/loadEnvs.js"; // this will load the env's in the environment first as imports are execute before file start executing anything other

import express from "express";
import adminRouter from "./routes/adminRoutes.js";
import common from "./routes/commonRouter.js";
import connectDB from "./config/connectMongoDB.js";

const PORT = process.env.PORT || 5000;
const app = express();

// estabilse the connection 

connectDB();

// middlewares
// Middleware to parse JSON bodies into js Object
app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/common", common);

app.listen( PORT, ()=>{
    console.log(`the server is running on port ${PORT}`);
});