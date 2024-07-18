import Notification from "../models/notification.model.js";

export const getNotifications = async(req,res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({to:userId}).populate({
            path:"from",
            select:"username profileImg"
        });

        await Notification.updateMany({to:userId},{read:true});
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in Get Notification controller ", error);
    }
};

export const deleteNotifications = async(req,res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({to:userId});

        res.status(200).json({message: "Notification deleted successfully"});
    } catch (error) {
        res.status(500).json({error : "Internal servet error"});
        console.log("error in the delete Notificationss controller ", error);
    }
};  

// export const deleteNotification = async(req,res) => {
//     try {
//         const notificationId = req.params.id;
//         const userId = req.user._id;
//         const notification = await Notification.findById(notificationId);

//         if(!notification){
//             return res.status(404).json({error:"Notification not found"});
//         }

//         if(notification.to.toString() !== userId.toString()){
//             return res.status(403).json({error: " You are not allowed to delete this notification"});
//         }

//         await Notification.findByIdAndDelete(notificationId);

//     } catch (error) {
            
//         res.status(500).json({error : "Internal servet error"});
//         console.log("error in the delete Notification controller ", error);
//     }
// }