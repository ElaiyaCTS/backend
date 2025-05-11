import mongoose from 'mongoose';

const staffAttendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'staff', // Reference to staff model
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  checkIn: { type: Date }, // Stores full DateTime
  checkOut: { type: Date}, // Stores full DateTime (nullable)
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('staffAttendance', staffAttendanceSchema);
