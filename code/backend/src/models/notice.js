import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  validTill: { type: Date },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Additional indexes for query performance
schema.index({ societyId: 1, validTill: 1 });
schema.index({ societyId: 1, createdAt: -1 });
schema.index({ publishedBy: 1 });

export default mongoose.model('Notice', schema);
