const express = require('express');
const router = express.Router();

const defaultSectors = [
  { _id: 'sec-1', id: 'sec-1', name: 'Sector 1 - San Isidro Labrador', code: 'SEC-1', totalRaised: 125000, totalDisbursed: 85000, activeVolunteers: 18, coordinator: 'Bro. Ricardo Gomez' },
  { _id: 'sec-2', id: 'sec-2', name: 'Sector 2 - Sto. Niño de Praga', code: 'SEC-2', totalRaised: 98000, totalDisbursed: 64000, activeVolunteers: 14, coordinator: 'Sis. Elena Santos' },
  { _id: 'sec-3', id: 'sec-3', name: 'Sector 3 - Immaculate Conception', code: 'SEC-3', totalRaised: 145000, totalDisbursed: 110000, activeVolunteers: 22, coordinator: 'Bro. Dennis Ramos' },
  { _id: 'sec-4', id: 'sec-4', name: 'Sector 4 - San Lorenzo Ruiz', code: 'SEC-4', totalRaised: 82000, totalDisbursed: 53000, activeVolunteers: 12, coordinator: 'Sis. Carmela Cruz' },
  { _id: 'sec-5', id: 'sec-5', name: 'Sector 5 - San Pedro Calungsod', code: 'SEC-5', totalRaised: 115000, totalDisbursed: 79000, activeVolunteers: 16, coordinator: 'Bro. Marco Bautista' },
  { _id: 'sec-6', id: 'sec-6', name: 'Sector 6 - Our Lady of Peace', code: 'SEC-6', totalRaised: 92000, totalDisbursed: 61000, activeVolunteers: 15, coordinator: 'Sis. Teresa Villanueva' }
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: defaultSectors
  });
});

module.exports = router;
