import mongoose, { Document, Schema } from "mongoose";

export interface  DocumentCid extends Document {
    userId:string;
    cid:string;
    type:string;
    walletAddress:string;
}   

const DocumentCidSchema = new Schema<DocumentCid>(
    {
        userId:{type:String,required:true},
        cid:{type:String,required:true},
        type:{type:String,required:true},
        walletAddress:{type:String,required:true},
    },
    {timestamps:true}
)

const DocumentCidModel = mongoose.model<DocumentCid>("DocumentCid",DocumentCidSchema)
export default DocumentCidModel
