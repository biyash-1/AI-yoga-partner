import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    clerkId:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true
    }
    ,createdAt:{
        type:Date,
        default:Date.now
    }
})
export default mongoose.model("User",userSchema);