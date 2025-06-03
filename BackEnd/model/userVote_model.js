// models/UserVote.js
import mongoose from 'mongoose';

const userVoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true,
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true,
  },
}, { timestamps: true });

userVoteSchema.index({ userId: 1, postId: 1 }, { unique: true });

const UserVote = mongoose.model('UserVote', userVoteSchema);
export default UserVote;
