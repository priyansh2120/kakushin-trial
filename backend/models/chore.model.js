import mongoose from 'mongoose';

const choreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  addedByParent: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  dateCompleted: {
    type: Date
  }
});

export default mongoose.model('Chore', choreSchema);