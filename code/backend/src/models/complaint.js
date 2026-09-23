import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
  flatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  status: { type: String, enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Additional indexes for query performance
schema.index({ flatId: 1, status: 1 });
schema.index({ userId: 1, status: 1 });
schema.index({ societyId: 1, status: 1 });
schema.index({ assignedTo: 1, status: 1 });
schema.index({ category: 1 });

export default mongoose.model('Complaint', schema);
