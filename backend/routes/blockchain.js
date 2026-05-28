const express = require('express');
const router = express.Router();
const { getBlockchain } = require('../blockchain');

// Get entire blockchain (public - for transparency)
router.get('/chain', (req, res) => {
  const blockchain = getBlockchain();
  res.json({
    success: true,
    chain: blockchain.chain,
    totalBlocks: blockchain.chain.length,
    totalDonations: blockchain.getDonationBlocks().length
  });
});

// Get donation blocks only
router.get('/donations', (req, res) => {
  const blockchain = getBlockchain();
  res.json({
    success: true,
    donations: blockchain.getDonationBlocks()
  });
});

module.exports = router;