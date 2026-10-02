const express = require('express');
const router = express.Router();

const defaultSectors = [
  { _id: 'sec-1', id: 'sec-1', name: 'Scholars / Education', code: 'SEC-SCHOLAR', totalRaised: 185000, totalDisbursed: 125000, activeVolunteers: 24, coordinator: 'Bro. Ricardo Gomez' },
  { _id: 'sec-2', id: 'sec-2', name: 'Solo Parents Ministry', code: 'SEC-SOLO', totalRaised: 110000, totalDisbursed: 74000, activeVolunteers: 16, coordinator: 'Sis. Elena Santos' },
  { _id: 'sec-3', id: 'sec-3', name: 'Senior Citizens Care', code: 'SEC-SENIOR', totalRaised: 145000, totalDisbursed: 105000, activeVolunteers: 20, coordinator: 'Bro. Dennis Ramos' },
  { _id: 'sec-4', id: 'sec-4', name: 'Persons with Disabilities (PWD)', code: 'SEC-PWD', totalRaised: 95000, totalDisbursed: 62000, activeVolunteers: 14, coordinator: 'Sis. Carmela Cruz' },
  { _id: 'sec-5', id: 'sec-5', name: 'Prison Ministry', code: 'SEC-PRISON', totalRaised: 72000, totalDisbursed: 48000, activeVolunteers: 10, coordinator: 'Bro. Marco Bautista' },
  { _id: 'sec-6', id: 'sec-6', name: 'Indigent Families & Calamity Relief', code: 'SEC-RELIEF', totalRaised: 160000, totalDisbursed: 110000, activeVolunteers: 28, coordinator: 'Sis. Teresa Villanueva' }
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: defaultSectors
  });
});

module.exports = router;
