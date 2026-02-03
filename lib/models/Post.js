// lib/models/post.js - COMPLETELY CLEAN VERSION
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['certificate', 'project'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    default: 'Untitled'
  },
  media: [{
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    filename: String,
    size: Number,
    mimeType: String,
  }],
  tags: [String],
  techStack: [String],
  issuedBy: String,
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// NO pre-save hooks! NO middleware!

// Only indexes
PostSchema.index({ owner: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ type: 1 });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);