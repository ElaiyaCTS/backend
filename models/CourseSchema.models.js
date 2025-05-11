import mongoose from 'mongoose';

const CourseEnrollmentSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  practicalDays: {
    type: Number,
    required: true
  },
  theoryDays: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Course', CourseEnrollmentSchema);
