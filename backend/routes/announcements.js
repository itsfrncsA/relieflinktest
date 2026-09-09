const express = require('express');
const router = express.Router();

// Curated active announcements for ReliefLink / Sto. Domingo Parish
const sampleAnnouncements = [
  {
    _id: 'ann_001',
    title: 'Typhoon Relief Operation & Donation Drive',
    content: 'Sto. Domingo Parish is mobilizing emergency relief goods (rice, canned goods, drinking water, and hygiene kits) for families affected by recent typhoons in vulnerable communities. You may contribute online via ReliefLink or drop off non-perishable goods at the Parish Social Action Center.',
    category: 'Relief Operation',
    location: 'Sto. Domingo Church Social Action Center',
    eventDate: 'Ongoing Daily (8:00 AM - 5:00 PM)',
    createdBy: 'Parish Social Action Committee',
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    _id: 'ann_002',
    title: 'Parish Educational Scholarship Fund 2026',
    content: 'Applications are now open for the Dominican Educational Assistance Program for underprivileged high school and college students within our parish jurisdiction. Donors interested in sponsoring scholars may designate their donations under the Education category.',
    category: 'Scholarship',
    location: 'Dominican Ministry Office',
    eventDate: 'September 2026 Intake',
    createdBy: 'Parish Youth & Education Ministry',
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    _id: 'ann_003',
    title: 'Feast of Our Lady of the Holy Rosary (La Naval de Manila)',
    content: 'Join us in prayer and thanksgiving for the upcoming Festivities and Novena Masses in honor of Our Lady of the Most Holy Rosary, La Naval de Manila. Schedule of Novena Masses and solemn procession details are posted on the parish bulletin board.',
    category: 'Event',
    location: 'National Shrine of Our Lady of the Rosary of La Naval',
    eventDate: 'October 2026',
    createdBy: 'Dominican Fathers & Brothers',
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    _id: 'ann_004',
    title: 'Community Medical and Dental Mission',
    content: 'Free medical check-ups, dental extraction, basic pediatric care, and maintenance medicines will be distributed to accredited indigent families. Volunteer medical practitioners and youth coordinators are warmly welcome to assist.',
    category: 'Parish Update',
    location: 'Sto. Domingo Parish Gymnasium',
    eventDate: 'Saturday, 7:00 AM - 12:00 PM',
    createdBy: 'Health Apostolate',
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

// GET /api/announcements
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: sampleAnnouncements,
      count: sampleAnnouncements.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve announcements',
    });
  }
});

module.exports = router;
