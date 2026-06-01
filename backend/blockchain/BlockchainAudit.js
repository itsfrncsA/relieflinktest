const fs = require('fs');
const path = require('path');

class BlockchainAudit {
  constructor(auditFilePath = path.join(__dirname, '../../blockchain-audit.json')) {
    this.auditFilePath = auditFilePath;
    this.auditLog = this.loadAuditLog();
  }

  // Load audit log from file
  loadAuditLog() {
    try {
      if (fs.existsSync(this.auditFilePath)) {
        const data = fs.readFileSync(this.auditFilePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('⚠️  Error loading blockchain audit log:', err.message);
    }
    return {
      createdAt: new Date().toISOString(),
      blocks: [],
      deletions: [],
      tamperings: []
    };
  }

  // Save audit log to file
  saveAuditLog() {
    try {
      fs.writeFileSync(this.auditFilePath, JSON.stringify(this.auditLog, null, 2));
    } catch (err) {
      console.error('❌ Error saving blockchain audit log:', err.message);
    }
  }

  // Record a new block creation
  logBlockCreation(block) {
    const blockRecord = {
      blockId: block.id,
      index: block.index,
      hash: block.hash,
      previousHash: block.previousHash,
      timestamp: block.timestamp,
      donationData: block.donationData,
      createdAt: new Date().toISOString()
    };

    this.auditLog.blocks.push(blockRecord);
    this.saveAuditLog();
    
    return blockRecord;
  }

  // Detect deleted blocks by comparing current blockchain with audit log
  detectDeletedBlocks(currentBlockchain) {
    const deleted = [];
    const currentBlockIds = new Set(currentBlockchain.chain.map(b => b.id));

    for (const auditBlock of this.auditLog.blocks) {
      if (!currentBlockIds.has(auditBlock.blockId)) {
        deleted.push({
          blockId: auditBlock.blockId,
          index: auditBlock.index,
          deletedAt: new Date().toISOString(),
          donationData: auditBlock.donationData,
          originalHash: auditBlock.hash,
          message: `❌ DELETED: Block ${auditBlock.blockId} was deleted from blockchain. Donation ID: ${auditBlock.donationData.donationId}`
        });
      }
    }

    // Record deletions
    for (const deletion of deleted) {
      if (!this.auditLog.deletions.some(d => d.blockId === deletion.blockId)) {
        this.auditLog.deletions.push(deletion);
      }
    }

    if (deleted.length > 0) {
      this.saveAuditLog();
    }

    return deleted;
  }

  // Detect tampered blocks
  detectTamperedBlocks(currentBlockchain) {
    const tampered = [];

    for (const currentBlock of currentBlockchain.chain) {
      const auditBlock = this.auditLog.blocks.find(b => b.blockId === currentBlock.id);
      
      if (auditBlock) {
        // Compare hashes
        if (auditBlock.hash !== currentBlock.hash) {
          tampered.push({
            blockId: currentBlock.id,
            index: currentBlock.index,
            originalHash: auditBlock.hash,
            currentHash: currentBlock.hash,
            message: `❌ TAMPERED: Block ${currentBlock.id} hash changed. Original data was modified.`
          });
        }

        // Compare amounts
        if (auditBlock.donationData.amount !== currentBlock.donationData.amount) {
          tampered.push({
            blockId: currentBlock.id,
            originalAmount: auditBlock.donationData.amount,
            currentAmount: currentBlock.donationData.amount,
            message: `❌ TAMPERED: Block ${currentBlock.id} amount changed from ${auditBlock.donationData.amount} to ${currentBlock.donationData.amount}`
          });
        }
      }
    }

    // Record tamperings
    for (const tamper of tampered) {
      if (!this.auditLog.tamperings.some(t => t.blockId === tamper.blockId)) {
        this.auditLog.tamperings.push(tamper);
      }
    }

    if (tampered.length > 0) {
      this.saveAuditLog();
    }

    return tampered;
  }

  // Get forensic report
  getForensicReport(currentBlockchain) {
    const deletedBlocks = this.detectDeletedBlocks(currentBlockchain);
    const tamperedBlocks = this.detectTamperedBlocks(currentBlockchain);

    return {
      success: true,
      report: {
        deletedBlocks: deletedBlocks,
        tamperedBlocks: tamperedBlocks,
        totalBlocksInAudit: this.auditLog.blocks.length,
        totalBlocksInChain: currentBlockchain.chain.length,
        historicalDeletions: this.auditLog.deletions.length,
        historicalTamperings: this.auditLog.tamperings.length,
        integrityStatus: deletedBlocks.length === 0 && tamperedBlocks.length === 0 ? '✅ CLEAN' : '❌ COMPROMISED',
        message: deletedBlocks.length === 0 && tamperedBlocks.length === 0 
          ? '✅ Blockchain is clean - no deletions or tamperings detected'
          : `❌ Security issues detected: ${deletedBlocks.length} deleted blocks, ${tamperedBlocks.length} tampered blocks`
      }
    };
  }

  // Get audit history
  getAuditHistory() {
    return {
      createdAt: this.auditLog.createdAt,
      totalBlocksCreated: this.auditLog.blocks.length,
      totalDeletions: this.auditLog.deletions.length,
      totalTamperings: this.auditLog.tamperings.length,
      deletions: this.auditLog.deletions,
      tamperings: this.auditLog.tamperings,
      allBlocks: this.auditLog.blocks
    };
  }

  // Clear audit log (admin only)
  clearAuditLog() {
    this.auditLog = {
      createdAt: new Date().toISOString(),
      blocks: [],
      deletions: [],
      tamperings: []
    };
    this.saveAuditLog();
    return { success: true, message: 'Audit log cleared' };
  }
}

module.exports = BlockchainAudit;
