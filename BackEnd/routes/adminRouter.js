
// admin router
import { Router } from "express";
import LeaveRequest from "../model/leave_model.js";
import user_model from "../model/users_model.js";
import Complaint from "../model/complaints_model.js";

const adminRouter = Router();



// Route to fetch all complaints with user details (email-based join)
adminRouter.get('/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ date: -1 });

        const complaintsWithUserDetails = await Promise.all(
            complaints.map(async (complaint) => {
                const user = await user_model.findOne({ email: complaint.userEmail }).select('email name roomNumber phone');
                return {
                    ...complaint.toObject(),
                    user: user || {}  // Attach user details or empty object if user not found
                };
            })
        );

        res.status(200).json(complaintsWithUserDetails);
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ message: 'Failed to fetch complaints' });
    }
});

// Route to discard a complaint (set status to "Discarded")
adminRouter.post('/complaints/discard', async (req, res) => {
    const { complaintId } = req.body;

    try {
        const complaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { status: 'Discarded' },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.status(200).json(complaint);
    } catch (err) {
        console.error('Error discarding complaint:', err);
        res.status(500).json({ message: 'Failed to discard complaint' });
    }
});

// Route to mark a complaint as completed (set status to "Completed")
adminRouter.post('/complaints/completed', async (req, res) => {
    const { complaintId } = req.body;

    try {
        const complaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { status: 'Completed' },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.status(200).json(complaint);
    } catch (err) {
        console.error('Error marking complaint as completed:', err);
        res.status(500).json({ message: 'Failed to mark complaint as completed' });
    }
});


















adminRouter.get("/leave", async (req, res) => {
    try {
      // Fetch all leave requests and populate user details
      const leaves = await LeaveRequest.find()
        .sort({ startDate: 1})
        .populate('userId', 'name email phone roomNumber gender batch'); // Populate userId field with selected fields
  
      // Send the leave requests with populated user details
      res.status(200).json(leaves);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      res.status(500).json({ message: 'Failed to fetch leave requests' });
    }
  });
  
  // Route to reject a leave request
  adminRouter.post("/leave/reject", async (req, res) => {
    const { id } = req.body;
    try {
      const leaveRequest = await LeaveRequest.findByIdAndUpdate(id, { status: 'Rejected' }, { new: true });
  
      if (!leaveRequest) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
  
      res.status(200).json({ message: 'Leave request rejected', leaveRequest });
    } catch (err) {
      console.error('Error rejecting leave request:', err);
      res.status(500).json({ message: 'Failed to reject leave request' });
    }
  });
  
  // Route to accept (approve) a leave request
  adminRouter.post("/leave/accept", async (req, res) => {
    const { id } = req.body;
    try {
      const leaveRequest = await LeaveRequest.findByIdAndUpdate(id, { status: 'Approved' }, { new: true });
  
      if (!leaveRequest) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
  
      res.status(200).json({ message: 'Leave request approved', leaveRequest });
    } catch (err) {
      console.error('Error approving leave request:', err);
      res.status(500).json({ message: 'Failed to approve leave request' });
    }
  });




export default adminRouter;