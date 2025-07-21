import mongoose, { Document, Schema } from "mongoose";

export interface DocumentCid extends Document {
    userId: string;
    cid: string;
    type: string;
    approvedBy: string | null;
    rejectedBy: string | null;
}

const DocumentCidSchema = new Schema<DocumentCid>(
    {
        userId: { type: String, required: true },
        cid: { type: String, required: true },
        type: { type: String, required: true },
        approvedBy: { type: String, default: null },
        rejectedBy: { type: String, default: null },
    },
    { timestamps: true }
)

const DocumentCidModel = mongoose.model<DocumentCid>("DocumentCid", DocumentCidSchema)
export default DocumentCidModel
