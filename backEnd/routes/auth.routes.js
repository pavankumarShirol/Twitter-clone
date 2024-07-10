import express from "express";
import {logout, signin, signup,getMe} from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/protectRoute.js";


const router = express.Router();

// router.get("/signup",(req,res)=>{
//     res.json({
//         data:"you hit the sign up endpoint"
//     })
// });

// router.get("/signup",signup);

router.get("/me",protectRoute,getMe);

router.post("/signup",signup);

router.post("/signin",signin);

router.post("/logout",logout);

export default router;