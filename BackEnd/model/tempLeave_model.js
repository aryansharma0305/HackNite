import mongoose from 'mongoose';
const tempLeaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  otp: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-delete after 10 min
});

// const Menu = mongoose.model('Menu', menuSchema);
// export default Menu;
const TempLeave = mongoose.model('TempLeave', tempLeaveSchema);
export default TempLeave;