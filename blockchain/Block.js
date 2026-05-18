
class Block {
  constructor(index, timestamp, donationData, previousBlockId) {
    this.id = `BLOCK-${index}`;           
    this.index = index;                   
    this.timestamp = timestamp;            
    this.donationData = donationData;      
    this.previousBlockId = previousBlockId; 
  }
}

module.exports = Block;