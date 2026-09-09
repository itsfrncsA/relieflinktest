const express = require('express');
const router = express.Router();
const {
  getSectors,
  createSector,
  getSectorMembers,
  disburseFund,
  updateScholarService,
  updateScholarApplication
} = require('../controllers/sectorController');

router.get('/', getSectors);
router.post('/', createSector);
router.get('/:sectorName/members', getSectorMembers);
router.post('/disburse', disburseFund);
router.patch('/scholars/:userId/service', updateScholarService);
router.patch('/scholars/:userId/application', updateScholarApplication);

module.exports = router;
