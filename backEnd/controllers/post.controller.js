import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from 'cloudinary';

export const createPost = async(req,res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();
        console.log(req.body);

        const user = await User.findById(userId);

        if(!user) return res.status(404).json({message : "User not found"});

        if(!text && !img){
            return res.status(400).json({error:"Post must have text or image"});
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user:userId,
            text:text,
            img:img
        });
        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the Create post controller ", error);
    }
}

export const deletePost = async(req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({error:"Post not found"});
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error:"You are not authorized to delete the post"});
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({error:"POST deleted successfully"});

    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the Delete post controller ", error);
    }
};

export const commentOnPost = async(req,res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({error: "Text field is required"});
        }
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }
        const comment = {user:userId,type:text};

        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the Delete post controller ", error);
    }
};

export const likeUnlikePost = async(req,res) => {
    try {
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId);
        // const user = await Post.findById(userId);
        if(!post){
            return res.status(404).json({error:"Post not found"});
        }
        const userLikedPost = post.likes.includes(userId);

        if(userLikedPost){
            // Unlike Post
            await Post.updateOne({_id:postId},{$pull:{likes:userId}});
            await User.updateOne({id:userId},{$pull:{userLikedPost:postId}});

            res.status(200).json({message:"Post unliked successfully"});
        }else{
            // Like Post
            post.likes.push(userId);
            // user.likedPosts.push(postId);
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}});

            await post.save();

            // res.status(200).json({message:"Post liked successfully"});

            // await user.save();

            const notification = new Notification({
                from:userId,
                to:post.user,
                type:"like"
            });
            await notification.save();

            res.status(200).json({message:"Post notification sent successfully"});
        }
    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the like Unlike post controller ", error);
    }
};

export const getAllPosts = async(req,res) => {
    try {
        // const posts = await Post.find().sort({createdAt:-1}).populate("user").select("-password");
        const posts = await Post.find().sort({createdAt:-1}).populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        });
        if(posts.length === 0){
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the Get All post controller ", error);
    }
};

export const getLikedPosts = async(req,res) => {
     const userId = req.params.id;
     try {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error:"User not found"});

        const likedPosts = await Post.find({_id:{$in:user.likedPosts}})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        });

        res.status(200).json(likedPosts);


     } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the Get Liked posts controller ", error);
     }
};

export const getFollowingPosts = async(req,res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error:"User not found"});

        const following = user.following;

        const feedPosts = await Post.find({user:{$in:following}})
        .sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"user",
            select:"-password"
        });

        res.status(200).json(feedPosts);

    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the Feed posts controller ", error);
    }
};

export const getUserPosts = async(req,res) => {
    try {
        const {username} = req.params;

        const user = await User.findOne({username});
        if(!user) return res.status(404).json({error:"User not found"});

        const posts = await Post.find({user: user._id}).sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"user",
            select:"-password"
        });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the Feed posts controller ", error);
    }
}
