import mongoose from 'mongoose';

const InstructorAttendanceSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor', // Reference to Instructor model
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

export default mongoose.model('InstructorAttendance', InstructorAttendanceSchema);
