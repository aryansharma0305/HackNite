import { Router } from "express";
import user from "../model/users_model.js";
import Complaint from "../model/complaints_model.js";
import { verifyCookie } from "../service/auth.js";
import LeaveRequest from "../model/leave_model.js";
import TempLeaveRequest from "../model/tempLeave_model.js";
import Rating from "../model/rating_model.js";
import Menu from "../model/menu_model.js";
import sendMail from "../service/email.js";
import UserVote from "../model/userVote_model.js";

import CommunityPost from "../model/post_model.js";


const studentRouter = Router();

studentRouter.get("/info", async (req, res) => {
    try {
        const cookie = req.cookies.jwt;
        if (!cookie) {
            return res.status(401).json({ message: "No token provided" });
        }

        const userData = await verifyCookie(cookie);
        if (!userData) {
            return res.status(401).json({ message: "Token verification failed" });
        }

        const student = await user.findOne({ email: userData.email });
        
        if (student) {
            res.json({ student });
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ message: "Server error" });
    }
});





studentRouter.put("/update", async (req, res) => {
    try {
        const cookie = req.cookies.jwt;
        if (!cookie) {
            return res.status(401).json({ message: "No token provided" });
        }

        const userData = await verifyCookie(cookie);
        if (!userData) {
            return res.status(401).json({ message: "Token verification failed" });
        }

        const updates = {
            name: req.body.name,
            phone: req.body.phoneNo,
            batch: req.body.branch,
            email: req.body.emailId,
            roomNumber: req.body.roomNo,
            parentEmail: req.body.parentsEmailId,
            parentPhone: req.body.parentsPhoneNo,
            avatarURL: req.body.avatarURL,
        };

        const updatedStudent = await user.findOneAndUpdate(
            { email: userData.email },
            updates,
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student updated successfully", student: updatedStudent });
    } catch (error) {
        console.error("Error updating student data:", error);
        res.status(500).json({ message: "Server error" });
    }
});












// POST a new complaint
studentRouter.post("/complaints/new", async (req, res) => {
    const cookie = req.cookies.jwt;
    const { category, text } = req.body;

    try {
        const userData = await verifyCookie(cookie);
        const student = await user.findOne({ email: userData.email });

        if (!student) {
            return res.status(401).json({ message: "User not found" });
        }

        const newComplaint = new Complaint({
            userEmail: student.email,
            category,
            text,
            date: new Date().toLocaleDateString(),
            status: "Pending",
        });

        await newComplaint.save();

        res.status(200).json({ message: "Complaint submitted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET all complaints of a user
studentRouter.get("/complaints/show", async (req, res) => {
    
    const cookie = req.cookies.jwt;
    

    try {
        const userData = await verifyCookie(cookie);
        const student = await user.findOne({ email: userData.email });
       
        if (!student) {
            return res.status(401).json({ message: "User not found" });
        }
        const complaints = await Complaint.find({ userEmail: student.email }).sort({ date: -1 });
        
        res.status(200).json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});






studentRouter.post('/complaints/delete', async (req, res) => {
  const cookie = req.cookies.jwt;
  const { complaintId } = req.body;
  console.log("Complaint ID:", complaintId);
  try {
    const userData = await verifyCookie(cookie);
    const student = await user.findOne({ email: userData.email });

    if (!student) return res.status(401).json({ message: "User not found" });

    const complaint = await Complaint.findOne({ _id: complaintId});

    console.log(complaint);

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    await Complaint.deleteOne({ _id: complaintId});

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Error deleting complaint:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


















studentRouter.post("/menu/rate", async (req, res) => {
    const cookie = req.cookies.jwt;
    const userData = await verifyCookie(cookie);
  
    if (!userData) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const { day, ratings } = req.body;
  
    if (!day || !ratings || typeof ratings !== 'object') {
      return res.status(400).json({ message: "Invalid input data" });
    }
  
    try {
      const student = await user.findOne({ email: userData.email }); // Changed from User to user
      if (!student) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Transform flat ratings to nested structure
      const nestedRatings = {
        breakfast: ratings.breakfast?.map(item => ({ foodItem: item.foodItem, rating: item.rating || 0 })) || [],
        lunch: ratings.lunch?.map(item => ({ foodItem: item.foodItem, rating: item.rating || 0 })) || [],
        snacks: ratings.snacks?.map(item => ({ foodItem: item.foodItem, rating: item.rating || 0 })) || [],
        dinner: ratings.dinner?.map(item => ({ foodItem: item.foodItem, rating: item.rating || 0 })) || [],
      };
  
      const update = {
        userId: student._id,
        day,
        ...nestedRatings,
      };
  
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const rating = await Rating.findOneAndUpdate(
        { userId: student._id, day },
        update,
        options
      );
  
      res.status(201).json({ message: "Ratings submitted successfully", ratingId: rating._id });
    } catch (error) {
      console.error("Error submitting ratings:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  









  studentRouter.get("/menu/rate/:day", async (req, res) => {
    const cookie = req.cookies.jwt;
    const userData = await verifyCookie(cookie);
  
    if (!userData) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const { day } = req.params;
  
    try {
      const student = await user.findOne({ email: userData.email }); // Changed from User to user
      if (!student) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const rating = await Rating.findOne({ userId: student._id, day });
      if (!rating) {
        return res.status(404).json({ message: "No ratings found for this day" });
      }
  
      res.json({ message: "Ratings retrieved successfully", ratings: rating });
    } catch (error) {
      console.error("Error retrieving ratings:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
















  
  studentRouter.get("/menu", async (req, res) => {
    const cookie = req.cookies.jwt;
    const userData = await verifyCookie(cookie);
  
    if (!userData) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
      const menu = await Menu.find();
      if (!menu || menu.length === 0) {
        return res.status(404).json({ message: "No menu data found" });
      }
      res.json({ message: "Menu retrieved successfully", menu });
    } catch (error) {
      console.error("Error retrieving menu:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  
  
  
  
  
  
  
  

studentRouter.get('/leave/show', async (req, res) => {
  const cookie = req.cookies.jwt;
  const userData = await verifyCookie(cookie);

  if (!userData) return res.status(401).json({ message: "Unauthorized" });

  try {
    const student = await user.findOne({ email: userData.email });
    if (!student) return res.status(404).json({ message: "User not found" });

    const leaveRequests = await LeaveRequest.find({ userId: student._id }).sort({ startDate: -1 });

    res.status(200).json(leaveRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});




studentRouter.post('/leave/new', async (req, res) => {
  const cookie = req.cookies.jwt;
  const { leaveType,reason, startDate, endDate } = req.body;

  try {
    const userData = await verifyCookie(cookie);
    const student = await user.findOne({ email: userData.email });

    if (!student) return res.status(401).json({ message: "User not found" });

    const newTempLeave = new TempLeaveRequest({
      userId: student._id,
      reason,
      startDate,
      endDate,
      leaveType,
      otp: Math.floor(100000 + Math.random() * 900000),
    });

    await newTempLeave.save();

    //send mail

    const subject = "Leave Request OTP";
    const body = ` <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
      <h2 style="color: #2c3e50;">Hostel Leave Request</h2>
      <p>Dear Parent/Guardian,</p>
      <p>
        I hope this email finds you well. This is an automated message requesting your permission for 
        <strong>${student.name}</strong> to take leave as per the details below:
      </p>

      <h3 style="color: #0056b3;">Student Information:</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px;"><strong>Name:</strong></td>
          <td style="padding: 8px;">${student.name}</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 8px;"><strong>Batch:</strong></td>
          <td style="padding: 8px;">${student.batch}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Leave Duration:</strong></td>
          <td style="padding: 8px;">From ${startDate} to ${endDate}</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 8px;"><strong>Reason:</strong></td>
          <td style="padding: 8px;">${reason}</td>
        </tr>
      </table>

      <p>
        To proceed with the leave request, please confirm your approval by sharing the following OTP only with your ward:
        <br />
        <span style="font-size: 24px; font-weight: bold; color: #d9534f;">${ newTempLeave.otp }</span>
      </p>

      <p>If you do not approve this request, kindly disregard this email.</p>

      <p>Should you have any concerns or require further information, feel free to reach out.</p>

      <p>We appreciate your cooperation.</p>

      <br />
      <p>Warm regards,<br /><em>Hostel Management System</em></p>
    </div>.`;

    await sendMail(student.parentEmail,subject,body);

    res.status(200).json({ message: "OTP sent.", leaveId: newTempLeave._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});




studentRouter.post('/leave/verify', async (req, res) => {
  const cookie = req.cookies.jwt;
  const { otp, leaveId } = req.body;

  try {
    const userData = await verifyCookie(cookie);
    const student = await user.findOne({ email: userData.email });

    if (!student) return res.status(401).json({ message: "User not found" });

    const tempLeave = await TempLeaveRequest.findOne({ _id: leaveId, userId: student._id });

    if (!tempLeave) return res.status(404).json({ message: "Leave request not found or expired" });

    if (parseInt(otp) === tempLeave.otp) {
      const newLeave = new LeaveRequest({
        leaveType: tempLeave.leaveType,
        userId: tempLeave.userId,
        reason: tempLeave.reason,
        startDate: tempLeave.startDate,
        endDate: tempLeave.endDate,
      });

      await newLeave.save();
      await TempLeaveRequest.deleteOne({ _id: leaveId });

      res.status(200).json({ message: "Leave verified and approved" });
    } else {
      res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



studentRouter.post('/leave/delete', async (req, res) => {
  console.log("Delete leave request endpoint hit");
  const cookie = req.cookies.jwt;
  const { id } = req.body;
  console.log("Leave ID:", id);
  try {
    const userData = await verifyCookie(cookie);
    const student = await user.findOne({ email: userData.email });

    if (!student) {
      return res.status(401).json({ message: "User not found" });
    }

    const leave = await LeaveRequest.findOne({ _id: id, userId: student._id });

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    await LeaveRequest.deleteOne({ _id: id, userId: student._id });

    res.status(200).json({ message: "Leave request deleted successfully" });
  } catch (err) {
    console.error("Error deleting leave request:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});









// POST a new community post (frontend provides imageURL)
studentRouter.post("/community-posts", async (req, res) => {
  const cookie = req.cookies.jwt;
  const userData = await verifyCookie(cookie);

  if (!userData) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { content, hashtags, imageURL } = req.body;

  if (!content || !hashtags || !Array.isArray(hashtags)) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    const student = await user.findOne({ email: userData.email });
    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashtagArray = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    const isAdminPost = hashtagArray.some(tag => tag.toLowerCase() === '#admin');

    const newPost = new CommunityPost({
      content,
      hashtags: hashtagArray,
      author: student._id,
      isAdminPost,
      imageURL, // Store the URL provided by the frontend
    });

    await newPost.save();

    const populatedPost = await CommunityPost.findById(newPost._id).populate('author', 'name avatarURL');

    res.status(201).json({ message: "Post created successfully", post: populatedPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});







studentRouter.get("/community-posts", async (req, res) => {
  const cookie = req.cookies.jwt;
  const userData = await verifyCookie(cookie);

  if (!userData) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const student = await user.findOne({ email: userData.email });
    const posts = await CommunityPost.find()
      .populate('author', 'name avatarURL')
      .sort({ timestamp: -1 });

    const userVotes = await UserVote.find({ userId: student._id });
    const voteMap = {};
    userVotes.forEach(vote => {
      voteMap[vote.postId] = vote.voteType;
    });

    const postsWithVote = posts.map(post => ({
      ...post.toObject(),
      userVote: voteMap[post._id] || null,
    }));

    res.status(200).json(postsWithVote);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




studentRouter.delete('/community-posts/:postId', async (req, res) => {
  const cookie = req.cookies.jwt;
  const userData = await verifyCookie(cookie);

  if (!userData) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const student = await user.findOne({ email: userData.email });
    const postId = req.params.postId;

    const post = await CommunityPost.findById(postId).populate('author', 'name avatarURL');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Optional: Only allow author or admin to delete
    if (!post.author._id.equals(student._id)) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    await CommunityPost.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


studentRouter.get("/community-posts/my", async (req, res) => {
  const cookie = req.cookies.jwt;
  const userData = await verifyCookie(cookie);

  if (!userData) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const student = await user.findOne({ email: userData.email });
    const posts = await CommunityPost.find({author: student._id})
      .populate('author', 'name avatarURL')
      .sort({ timestamp: -1 });

    const userVotes = await UserVote.find({ userId: student._id });
    const voteMap = {};
    userVotes.forEach(vote => {
      voteMap[vote.postId] = vote.voteType;
    });

    const postsWithVote = posts.map(post => ({
      ...post.toObject(),
      userVote: voteMap[post._id] || null,
    }));

    res.status(200).json(postsWithVote);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});












studentRouter.post("/community-posts/:id/vote", async (req, res) => {
  const cookie = req.cookies.jwt;
  const userData = await verifyCookie(cookie);

  if (!userData) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id: postId } = req.params;
  const { voteType } = req.body; // 'upvote', 'downvote', or null for unvote

  if (![null, 'upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ message: "Invalid vote type" });
  }

  try {
    const student = await user.findOne({ email: userData.email });
    if (!student) return res.status(404).json({ message: "User not found" });

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingVote = await UserVote.findOne({ userId: student._id, postId });

    // If user is unvoting
    if (voteType === null && existingVote) {
      if (existingVote.voteType === 'upvote') post.upvotes -= 1;
      else if (existingVote.voteType === 'downvote') post.downvotes -= 1;

      await existingVote.deleteOne();
    }

    // If user is casting a new vote
    else if (!existingVote) {
      await UserVote.create({ userId: student._id, postId, voteType });
      if (voteType === 'upvote') post.upvotes += 1;
      else if (voteType === 'downvote') post.downvotes += 1;
    }

    // If user is changing their vote
    else if (existingVote.voteType !== voteType) {
      if (existingVote.voteType === 'upvote') post.upvotes -= 1;
      else if (existingVote.voteType === 'downvote') post.downvotes -= 1;

      if (voteType === 'upvote') post.upvotes += 1;
      else if (voteType === 'downvote') post.downvotes += 1;

      existingVote.voteType = voteType;
      await existingVote.save();
    }

    await post.save();

    res.status(200).json({
      message: "Vote updated successfully",
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

  } catch (error) {
    console.error("Error voting on post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ... (rest of

// your routes)


export default studentRouter;