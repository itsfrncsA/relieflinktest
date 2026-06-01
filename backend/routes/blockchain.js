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

// Validate blockchain integrity (checks for tampering)
router.get('/validate', (req, res) => {
  const blockchain = getBlockchain();
  const isValid = blockchain.isChainValid();
  
  res.json({
    success: true,
    isValid: isValid,
    message: isValid 
      ? '✅ Blockchain is valid - no tampering detected'
      : '❌ Tampering detected - blockchain integrity compromised',
    totalBlocks: blockchain.chain.length
  });
});

// Get detailed validation report
router.get('/validate-detailed', (req, res) => {
  const blockchain = getBlockchain();
  const report = blockchain.validateChainDetailed();
  
  res.json({
    success: true,
    ...report,
    message: report.isValid 
      ? '✅ All blocks are valid'
      : `❌ Issues found: ${report.tamperedBlocks.length} tampered blocks, ${report.brokenLinks.length} broken links`
  });
});

module.exports = router;