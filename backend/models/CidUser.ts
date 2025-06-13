import mongoose, { Document, Schema } from "mongoose";

export interface CIDUser extends Document {
   userId:string;
    cid:string;
}   

const CidUserSchema = new Schema<CIDUser>(
    {
        userId:{type:String,required:true},
        cid:{type:String,required:true},
    },
    {timestamps:true}
)

const CidUserModel = mongoose.model<CIDUser>("CidUser",CidUserSchema)
export default CidUserModel
