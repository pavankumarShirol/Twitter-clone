import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import generateTokenAndSetCookie from '../lib/utils/generateToken.js'

export const signup = async (req,res) => {
    // res.json({
    //     data:"You hit the signup end point"
    // })

    try{
        const {fullName,username,email,password} = req.body;

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // check email Format
        if(!emailRegex.test(email)){
            return res.status(400).json({error : "Invalid email format"});
        }

        // Check for existing user
        const existingUser = await User.findOne({username : username});
        if(existingUser){
            return res.status(400).json({error : "Username is alreay taken"});
        }

        // Check for existing Email
        const existingEmail = await User.findOne({email : email});
        if(existingEmail){
            return res.status(400).json({error : "Username is alreay taken"});
        }

        // Hash password
        if(password.length < 6){
            return res.status(400).json({error : "Password length is less than 6"});
        }
        const salt = await bcrypt.genSalt(11);
        const hashedPassword = await bcrypt.hash(password,salt);

        // Create a new User
        const newUser = new User({
            fullName:fullName,
            username:username,
            email:email,
            password:hashedPassword
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id,res);  // Generate Token
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName: newUser.fullName,
                username:newUser.username,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                coverImg:newUser.coverImg,
            })
        }else{
            res.status(400).json({error : "Invalid user Data"});
        }

    }catch(error){
        console.log("Error in signup controller : ", error.message);
        res.status(400).json({error : "Internal Server error"});
    }
};

export const signin = async (req,res) => {
    // res.json({
    //     data:"You hit the signin end point"
    // })
    try{
        const {username,password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!user || !isPasswordCorrect){
            res.status(400).json({error : "Incorrect password"});
        }

        generateTokenAndSetCookie(user._id,res);

        res.status(201).json({
            _id:user._id,
            fullName: user.fullName,
            username:user.username,
            email:user.email,
            followers:user.followers,
            following:user.following,
            coverImg:user.coverImg,
        });

    }catch(error){
        console.log("Error in signup controller : ", error.message);
        res.status(500).json({error : "Internal Server error"});
    }
};

export const logout = async (req,res) => {
    // res.json({
    //     data:"You hit the logout end point"
    // })

    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
    }catch(error){
        console.log("Error in logout controller : ", error.message);
        res.status(500).json({error : "Internal Server error"});
    }
};

export const getMe = async (req,res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }catch(error){
        console.log("Error in the getMe controller", error.message);
        res.status(500).json({error:"Internal server error"});
    }
}