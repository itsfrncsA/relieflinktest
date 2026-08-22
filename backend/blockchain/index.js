const Blockchain = require('./Blockchain');

let blockchainInstance = null;

function getBlockchain() {
  if (!blockchainInstance) {
    blockchainInstance = new Blockchain();
  }
  return blockchainInstance;
}

function resetBlockchain() {
  blockchainInstance = new Blockchain();
  console.log('🔄 Blockchain reset');
  return blockchainInstance;
}

module.exports = { getBlockchain, resetBlockchain };