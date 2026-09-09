const express = require('express');
const router = express.Router();
const { getBlockchain, resetBlockchain } = require('../blockchain');

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
      : '❌ Blockchain invalid - tampering detected',
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
      : `❌ Issues found: ${report.tamperedBlocks.length} tampered, ${report.brokenLinks.length} broken links, ${report.missingBlocks.length} missing`
  });
});

// Advanced forensic analysis using audit log (detects deleted and tampered blocks)
router.get('/forensics-advanced', (req, res) => {
  try {
    const blockchain = getBlockchain();
    const result = blockchain.audit.getForensicReport(blockchain);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error performing advanced forensic analysis',
      error: err.message
    });
  }
});

// Get complete audit history
router.get('/audit-history', (req, res) => {
  try {
    const blockchain = getBlockchain();
    const history = blockchain.audit.getAuditHistory();
    res.json({
      success: true,
      ...history
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving audit history',
      error: err.message
    });
  }
});

// Forensic analysis: Check for orphaned blocks and missing DB records
router.get('/forensics', async (req, res) => {
  try {
    const blockchain = getBlockchain();
    const Donation = require('../models/Donations');
    const dbDonations = await Donation.find({ verificationStatus: 'approved' });
    
    const forensics = {
      success: true,
      orphanedBlocks: [],
      missingDonations: [],
      mismatchedBlocks: [],
      totalBlockchainBlocks: blockchain.getDonationBlocks().length,
      totalDbDonations: dbDonations.length
    };

    // Check for orphaned blocks (deleted from DB)
    for (const block of blockchain.getDonationBlocks()) {
      const dbRecord = dbDonations.find(d => d._id.toString() === block.donationData.donationId);
      if (!dbRecord) {
        forensics.orphanedBlocks.push({
          blockId: block.id,
          blockData: block.donationData,
          message: '❌ DELETED: Block exists in blockchain but donation record is missing from database'
        });
      } else if (block.donationData.amount !== dbRecord.amount) {
        forensics.mismatchedBlocks.push({
          blockId: block.id,
          blockAmount: block.donationData.amount,
          dbAmount: dbRecord.amount,
          message: '❌ TAMPERED: Block amount differs from database'
        });
      }
    }

    // Check for missing donations (in DB but not in blockchain)
    for (const dbDonation of dbDonations) {
      const blockExists = blockchain.getDonationById(dbDonation._id.toString());
      if (!blockExists) {
        forensics.missingDonations.push({
          donationId: dbDonation._id.toString(),
          donorName: dbDonation.donorName,
          amount: dbDonation.amount,
          message: '⚠️ OUT OF SYNC: Donation in DB but missing from blockchain'
        });
      }
    }

    forensics.summary = {
      totalIssues: forensics.orphanedBlocks.length + forensics.mismatchedBlocks.length + forensics.missingDonations.length
    };

    res.json(forensics);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error performing forensic analysis',
      error: err.message
    });
  }
});

// Recovery: Rebuild blockchain from database
router.post('/recover-from-database', async (req, res) => {
  try {
    const Donation = require('../models/Donations');
    
    // Reset blockchain to genesis
    const blockchain = resetBlockchain();
    
    // Get all approved donations from database in order
    const approvedDonations = await Donation.find({ verificationStatus: 'approved' }).sort({ createdAt: 1 });
    
    let recoveryReport = {
      success: true,
      blocksCreated: 0,
      message: 'Blockchain recovery completed'
    };

    for (const donation of approvedDonations) {
      const block = blockchain.addDonation({
        donationId: donation._id.toString(),
        donorName: donation.donorName,
        amount: donation.amount,
        paymentMethod: donation.paymentMethod,
        referenceNumber: donation.referenceNumber,
        destination: donation.destination,
        status: donation.verificationStatus
      });
      
      // Update donation record with blockchain block ID
      donation.blockId = block.id;
      await donation.save();
      
      recoveryReport.blocksCreated++;
    }

    recoveryReport.message = `✅ Blockchain recovered: ${recoveryReport.blocksCreated} blocks recreated from database`;
    
    res.json(recoveryReport);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error recovering blockchain',
      error: err.message
    });
  }
});

module.exports = router;
