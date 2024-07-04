import express from "express";
import {logout, signin, signup} from "../controllers/auth.controller.js"


const router = express.Router();

// router.get("/signup",(req,res)=>{
//     res.json({
//         data:"you hit the sign up endpoint"
//     })
// });

// router.get("/signup",signup);

router.post("/signup",signup);


router.post("/signin",signin);

router.post("/logout",logout);

export default router;