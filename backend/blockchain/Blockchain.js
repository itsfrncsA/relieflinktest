const Block = require('./Block');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    // First block - marks the start of the blockchain
    return new Block(0, Date.now(), {
      type: 'GENESIS',
      message: 'ReliefLink Cash Donation Blockchain Started',
      note: 'All cash donations are recorded here for transparency'
    }, null);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Add an approved donation to the blockchain
  addDonation(donationData) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      donationData,
      previousBlock.hash // Link to previous block's hash (not just ID)
    );
    
    this.chain.push(newBlock);
    console.log(`✅ Donation recorded as ${newBlock.id} with hash: ${newBlock.hash.substring(0, 16)}...`);
    return newBlock;
  }

  // Get all donation blocks (for transparency module)
  getAllDonations() {
    return this.chain.filter(block => 
      block.donationData && block.donationData.type !== 'GENESIS'
    );
  }

  getDonationBlocks() {
    return this.getAllDonations();
  }

  // Get a specific donation by reference number
  getDonationByReference(referenceNumber) {
    return this.chain.find(block => 
      block.donationData && block.donationData.referenceNumber === referenceNumber
    );
  }

  // Get a specific donation by its database ID
  getDonationById(donationId) {
    return this.chain.find(block => 
      block.donationData && block.donationData.donationId === donationId
    );
  }

  // Get blockchain summary for dashboard
  getSummary() {
    const donations = this.getAllDonations();
    const totalAmount = donations.reduce((sum, block) => 
      sum + (block.donationData.amount || 0), 0
    );

    return {
      totalBlocks: this.chain.length,
      totalDonations: donations.length,
      totalAmount: totalAmount,
      genesisBlock: this.chain[0],
      latestBlock: this.getLatestBlock()
    };
  }

  // Verify chain integrity (checks hashes and links)
  isChainValid() {
    for (let i = 0; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];

      // Check if current block's hash is valid (detects data tampering)
      if (!currentBlock.isValid()) {
        console.log(`❌ TAMPERING DETECTED at block ${i}: Data has been modified!`);
        console.log(`   Expected hash: ${currentBlock.calculateHash()}`);
        console.log(`   Stored hash:   ${currentBlock.hash}`);
        return false;
      }

      // Check if the link to previous block is correct (for blocks after genesis)
      if (i > 0) {
        const previousBlock = this.chain[i - 1];
        if (currentBlock.previousHash !== previousBlock.hash) {
          console.log(`❌ Chain broken at block ${i}: Link to previous block is invalid!`);
          return false;
        }
      }
    }
    return true;
  }

  // Get detailed validation report
  validateChainDetailed() {
    const report = {
      isValid: true,
      tamperedBlocks: [],
      brokenLinks: [],
      totalBlocks: this.chain.length
    };

    for (let i = 0; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];

      // Check for data tampering
      if (!currentBlock.isValid()) {
        report.isValid = false;
        report.tamperedBlocks.push({
          blockId: currentBlock.id,
          index: i,
          expectedHash: currentBlock.calculateHash(),
          storedHash: currentBlock.hash
        });
      }

      // Check for broken chain links
      if (i > 0) {
        const previousBlock = this.chain[i - 1];
        if (currentBlock.previousHash !== previousBlock.hash) {
          report.isValid = false;
          report.brokenLinks.push({
            blockId: currentBlock.id,
            index: i,
            expectedPreviousHash: previousBlock.hash,
            storedPreviousHash: currentBlock.previousHash
          });
        }
      }
    }

    return report;
  }
}

module.exports = Blockchain;