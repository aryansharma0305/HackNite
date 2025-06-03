import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    category: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: "Pending" },
});

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
