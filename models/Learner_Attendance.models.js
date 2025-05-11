import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Learner',
      required: true,
    },
    courseType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    classType: {
      type: String,
      enum: ['Theory', 'Practical'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: { type: Date }, // Stores full DateTime
    checkOut: { type:Date }, // Stores full DateTime (nullable)
    descriptions:{ type: String},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Always reference the User model
      required: true,
    }
  },
  { timestamps: true }
);
//✅ Add index for faster sorting by newest first (LIFO)
// AttendanceSchema.index({ createdAt: -1 });
AttendanceSchema.index({ createdBy: 1, learner: 1, createdAt: -1 });

const LearnerAttendance = mongoose.model('LearnerAttendance', AttendanceSchema);

export default LearnerAttendance;
