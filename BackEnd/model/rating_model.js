import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  breakfast: [{
    foodItem: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 0 },
  }],
  lunch: [{
    foodItem: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 0 },
  }],
  snacks: [{
    foodItem: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 0 },
  }],
  dinner: [{
    foodItem: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 0 },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;