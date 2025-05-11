import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Learner",
    required: true
  },
  testType: {
    type: String,
    enum: ["Mock Test", "Theory Test", "Practical Test"],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  result: {
    type: String,
    enum: ["Pass", "Scheduled", "Fail"],
    default: "Scheduled"
  }
}, { timestamps: true });

export default mongoose.model("Test", TestSchema);
