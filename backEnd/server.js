import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as clodinary} from "cloudinary";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";

import connectMongoDB from "./db/connectMongoDB.js";

const app = express();

dotenv.config();

clodinary.config({
    cloud_name:process.env.CLODINARY_CLOUD_NAME,
    api_key:process.env.CLODINARY_API_KEY,
    api_secret:process.env.CLODINARY_API_SECRET
});

const PORT = process.env.PORT;

// app.get("/",(req,res) =>{
//     res.send("server is ready");
// })

app.use(express.json()); // middle ware
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);

app.listen(PORT, () => {
    console.log("Server is runnig on port 8000");
    connectMongoDB();
}); 