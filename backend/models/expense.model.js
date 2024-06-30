// expenseSchema.js
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  necessityPercentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  description: {
    type: String,
    default: null
  }
});

export default mongoose.model('Expense', expenseSchema);
