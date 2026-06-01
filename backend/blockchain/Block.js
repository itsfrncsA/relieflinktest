
const crypto = require('crypto');

class Block {
  constructor(index, timestamp, donationData, previousHash = null) {
    this.id = `BLOCK-${index}`;           
    this.index = index;                   
    this.timestamp = timestamp;            
    this.donationData = donationData;      
    this.previousHash = previousHash; // Hash of the previous block
    this.hash = this.calculateHash(); // Hash of this block
  }

  // Calculate SHA-256 hash of this block's data
  calculateHash() {
    const blockData = {
      id: this.id,
      index: this.index,
      timestamp: this.timestamp,
      donationData: this.donationData,
      previousHash: this.previousHash
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(blockData))
      .digest('hex');
  }

  // Verify if this block's hash is valid (detects tampering)
  isValid() {
    return this.hash === this.calculateHash();
  }
}

module.exports = Block;