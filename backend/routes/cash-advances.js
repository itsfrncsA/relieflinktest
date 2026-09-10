const express = require('express');
const router = express.Router();

// Cash advances endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

module.exports = router;
