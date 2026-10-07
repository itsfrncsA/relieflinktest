const express = require('express');
const router = express.Router();

const defaultSectors = [
  { _id: 'sec-1', id: 'sec-1', name: 'LGBTQ', code: 'SEC-LGBTQ', totalRaised: 95000, totalDisbursed: 60000, activeVolunteers: 12, coordinator: 'Sis. Alex Cruz' },
  { _id: 'sec-2', id: 'sec-2', name: 'Elderly', code: 'SEC-ELDERLY', totalRaised: 145000, totalDisbursed: 105000, activeVolunteers: 20, coordinator: 'Bro. Dennis Ramos' },
  { _id: 'sec-3', id: 'sec-3', name: 'PDL', code: 'SEC-PDL', totalRaised: 72000, totalDisbursed: 48000, activeVolunteers: 10, coordinator: 'Bro. Marco Bautista' },
  { _id: 'sec-4', id: 'sec-4', name: 'Urban Poor', code: 'SEC-URBAN', totalRaised: 160000, totalDisbursed: 110000, activeVolunteers: 28, coordinator: 'Sis. Teresa Villanueva' },
  { _id: 'sec-5', id: 'sec-5', name: 'Migrant', code: 'SEC-MIGRANT', totalRaised: 85000, totalDisbursed: 55000, activeVolunteers: 15, coordinator: 'Sis. Elena Santos' },
  { _id: 'sec-6', id: 'sec-6', name: 'Student Scholarships', code: 'SEC-SCHOLAR', totalRaised: 185000, totalDisbursed: 125000, activeVolunteers: 24, coordinator: 'Bro. Ricardo Gomez' },
  { _id: 'sec-7', id: 'sec-7', name: 'Drug rehabilitation.', code: 'SEC-DRUGREHAB', totalRaised: 90000, totalDisbursed: 50000, activeVolunteers: 16, coordinator: 'Bro. Juan Rivera' }
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: defaultSectors
  });
});

module.exports = router;
