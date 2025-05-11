import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Learner",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Credit Card", "Debit Card", "UPI", "Net Banking", "Cash"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, {
  timestamps: true // ✅ This adds `createdAt` and `updatedAt`
});

// ✅ Add index for faster sorting by newest first (LIFO)
PaymentSchema.index({ createdAt: -1 });

export default mongoose.model("Payment", PaymentSchema);
