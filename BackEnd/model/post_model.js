import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  hashtags: [{
    type: String,
    required: true,
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // References the user model
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  isAdminPost: {
    type: Boolean,
    default: false,
  },
  imageURL: {
    type: String, // URL to the uploaded image
    required: false,
  },
});

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
export default CommunityPost;