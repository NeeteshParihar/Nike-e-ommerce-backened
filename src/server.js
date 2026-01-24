import "./uitls/loadEnvs.js"; // this will load the env's in the environment first as imports are execute before file start executing anything other

import express from "express";
import adminRouter from "./routes/adminRoutes.js";
import connectDB from "./config/connectMongoDB.js";

const PORT = process.env.PORT || 5000;
const app = express();

// estabilse the connection 

connectDB();

// middlewares
// Middleware to parse JSON bodies into js Object
app.use(express.json());


app.post("/api/user/:id", async(req, res)=>{
    try{

        const id = req.params.id;
        console.log(id);

        res.status(200).json({
            success: true,
            id
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "internal server error!"
           
        })
    }
})

app.use("/api/admin", adminRouter);

app.listen( PORT, ()=>{
    console.log(`the server is running on port ${PORT}`);
});