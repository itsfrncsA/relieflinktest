const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  eventDate: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  creatorName: {
    type: String,
    default: 'Sto. Domingo Parish Admin',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'draft'],
    default: 'active',
  },
}, { timestamps: true });

// Index for efficient sorting by pinned status and creation date
announcementSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
