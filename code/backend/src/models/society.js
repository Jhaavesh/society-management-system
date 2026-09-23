import mongoose from 'mongoose';

const societySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  logoUrl: { type: String, trim: true },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
societySchema.index({ createdBy: 1 });
societySchema.index({ active: 1 });
societySchema.index({ name: 'text', address: 'text', city: 'text' });

export default mongoose.model('Society', societySchema);
