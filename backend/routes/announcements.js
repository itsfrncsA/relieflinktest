const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Default initial announcements for Sto. Domingo Parish if DB is empty
const defaultAnnouncements = [
  {
    title: 'Typhoon Relief Operation & Donation Drive',
    content: 'Sto. Domingo Parish is mobilizing emergency relief goods (rice, canned goods, drinking water, and hygiene kits) for families affected by recent typhoons in vulnerable communities. You may contribute online via ReliefLink or drop off non-perishable goods at the Parish Social Action Center.',
    category: 'Relief Operation',
    location: 'Sto. Domingo Church Social Action Center',
    eventDate: 'Ongoing Daily (8:00 AM - 5:00 PM)',
    creatorName: 'Parish Social Action Committee',
    isPinned: true,
  },
  {
    title: 'Parish Educational Scholarship Fund 2026',
    content: 'Applications are now open for the Dominican Educational Assistance Program for underprivileged high school and college students within our parish jurisdiction. Donors interested in sponsoring scholars may designate their donations under the Education category.',
    category: 'Scholarship Notice',
    location: 'Dominican Ministry Office',
    eventDate: 'September 2026 Intake',
    creatorName: 'Parish Youth & Education Ministry',
    isPinned: true,
  },
  {
    title: 'Feast of Our Lady of the Holy Rosary (La Naval de Manila)',
    content: 'Join us in prayer and thanksgiving for the upcoming Festivities and Novena Masses in honor of Our Lady of the Most Holy Rosary, La Naval de Manila. Schedule of Novena Masses and solemn procession details are posted on the parish bulletin board.',
    category: 'Ministry Schedule',
    location: 'National Shrine of Our Lady of the Rosary of La Naval',
    eventDate: 'October 2026',
    creatorName: 'Dominican Fathers & Brothers',
    isPinned: false,
  },
  {
    title: 'Community Medical and Dental Mission',
    content: 'Free medical check-ups, dental extraction, basic pediatric care, and maintenance medicines will be distributed to accredited indigent families. Volunteer medical practitioners and youth coordinators are warmly welcome to assist.',
    category: 'General',
    location: 'Sto. Domingo Parish Gymnasium',
    eventDate: 'Saturday, 7:00 AM - 12:00 PM',
    creatorName: 'Health Apostolate',
    isPinned: false,
  },
];

// Optional Auth Helper to extract user if token is provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'relieflink_super_secret_key_2026_production';
      const decoded = jwt.verify(token, jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (e) {
    // Continue without req.user if token is invalid or expired
  }
  next();
};

// GET /api/announcements - Fetch all active announcements
router.get('/', async (req, res) => {
  try {
    let announcements = await Announcement.find({ status: { $ne: 'archived' } })
      .sort({ isPinned: -1, createdAt: -1 });

    // Auto-seed default announcements if collection is empty
    if (announcements.length === 0) {
      try {
        await Announcement.insertMany(defaultAnnouncements);
        announcements = await Announcement.find({ status: { $ne: 'archived' } })
          .sort({ isPinned: -1, createdAt: -1 });
      } catch (seedErr) {
        console.warn('Auto-seed announcements warning:', seedErr.message);
      }
    }

    res.json({
      success: true,
      data: announcements,
      count: announcements.length,
    });
  } catch (error) {
    console.error('Fetch announcements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve announcements',
    });
  }
});

// GET /api/announcements/:id - Fetch single announcement
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Fetch single announcement error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve announcement' });
  }
});

// POST /api/announcements - Create new announcement
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { title, content, category, location, eventDate, isPinned } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Announcement title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Announcement content is required' });
    }

    const creatorName = req.user?.name || req.body.creatorName || 'Sto. Domingo Parish Admin';
    const createdBy = req.user?._id || undefined;

    const newAnnouncement = new Announcement({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      location: location ? location.trim() : '',
      eventDate: eventDate || '',
      isPinned: Boolean(isPinned),
      createdBy,
      creatorName,
      status: 'active',
    });

    const savedAnnouncement = await newAnnouncement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: savedAnnouncement,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create announcement',
    });
  }
});

// PUT /api/announcements/:id - Update existing announcement
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, location, eventDate, isPinned, status } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    if (title !== undefined) announcement.title = title.trim();
    if (content !== undefined) announcement.content = content.trim();
    if (category !== undefined) announcement.category = category;
    if (location !== undefined) announcement.location = location.trim();
    if (eventDate !== undefined) announcement.eventDate = eventDate;
    if (isPinned !== undefined) announcement.isPinned = Boolean(isPinned);
    if (status !== undefined) announcement.status = status;

    const updated = await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update announcement',
    });
  }
});

// PATCH /api/announcements/:id - Partial update
router.patch('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (error) {
    console.error('Patch announcement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update announcement',
    });
  }
});

// DELETE /api/announcements/:id - Delete announcement
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
      data: { _id: id },
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete announcement',
    });
  }
});

module.exports = router;
