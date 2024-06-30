
import mongoose from 'mongoose';

const monthlySavingsSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  }
});


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  country: {
    type: String,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  profession: {
    type: String,
    enum: ['Job', 'Student'],
    required: true
  },
  income: {
    type: Number,
    default: null
  },
  virtualCurrency: {
    type: Number,
    default: 0
  },
  financialLiteracy: {
    type: Number,
    default: 0
  },
  badge: {
    type: [String],
    default: []
  },
  phoneNumber: {
    type: String,
    default: null
  },
  profilePictureUrl: {
    type: String,
    default: null
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  financialGoals: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  educationLevel: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: null
  },
  monthlySavings: {
    type: [monthlySavingsSchema],
    default: []
  }
});

export default mongoose.model('User', userSchema);
