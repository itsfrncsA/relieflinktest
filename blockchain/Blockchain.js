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
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      donationData,
      this.getLatestBlock().id
    );
    
    this.chain.push(newBlock);
    console.log(`✅ Donation recorded as ${newBlock.id}`);
    return newBlock;
  }

  // Get all donation blocks (for transparency module)
  getAllDonations() {
    return this.chain.filter(block => 
      block.donationData.type !== 'GENESIS'
    );
  }

  // Get a specific donation by reference number
  getDonationByReference(referenceNumber) {
    return this.chain.find(block => 
      block.donationData.referenceNumber === referenceNumber
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

  // Verify chain integrity (checks if blocks are linked correctly)
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if the link to previous block is correct
      if (currentBlock.previousBlockId !== previousBlock.id) {
        console.log(`❌ Chain broken at block ${i}`);
        return false;
      }
    }
    return true;
  }
}

module.exports = Blockchain;