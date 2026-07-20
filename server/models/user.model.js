import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    firebaseUid:{
        type:String,
        unique:true,
        sparse:true
    },
    credits:{
        type:Number,
        default:100,
        min:0
    },
    isCreditAvailable:{
        type:Boolean,
        default:true
    },
    notes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Notes",
        default:[]
    },
    // Admin-facing flags (additive — defaults keep existing users working)
    status:{
        type:String,
        enum:["active","banned","deactivated"],
        default:"active"
    },
    bannedAt:{
        type:Date,
        default:null
    },
    banReason:{
        type:String,
        default:""
    },
    // Idempotent Stripe Checkout session ids (test + live)
    creditedStripeSessions:{
        type:[String],
        default:[]
    }
},{timestamps:true})

const UserModel = mongoose.model("UserModel" , userSchema)

export default UserModel
