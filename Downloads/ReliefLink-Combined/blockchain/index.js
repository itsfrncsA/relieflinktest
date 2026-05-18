const Blockchain = require('./Blockchain');

let blockchainInstance = null;

function getBlockchain() {
  if (!blockchainInstance) {
    blockchainInstance = new Blockchain();
    console.log('📒 Blockchain initialized for cash donations');
    console.log(`Genesis block: ${blockchainInstance.chain[0].id}`);
  }
  return blockchainInstance;
}

function resetBlockchain() {
  blockchainInstance = new Blockchain();
  console.log('🔄 Blockchain reset');
  return blockchainInstance;
}

module.exports = { getBlockchain, resetBlockchain };