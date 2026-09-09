const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.blockchain') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let provider = null;
let signer = null;
let contract = null;
let deploymentData = null;

function initBesu() {
  try {
    const deploymentPath = path.join(__dirname, '../contracts/DonationRegistry-deployment.json');
    if (!fs.existsSync(deploymentPath)) {
      return null;
    }

    deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
    const privateKey = process.env.PRIVATE_KEY || '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

    provider = new ethers.JsonRpcProvider(rpcUrl);
    signer = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(deploymentData.contractAddress, deploymentData.abi, signer);

    return contract;
  } catch (err) {
    console.warn('[Besu Service Warning] Could not initialize Besu contract client:', err.message);
    return null;
  }
}

/**
 * Record an approved donation on the Hyperledger Besu smart contract
 */
async function recordDonationOnChain({ donorAddress, donorName, amount, referenceNumber, blockHash }) {
  try {
    if (!contract) {
      initBesu();
    }

    if (!contract || !signer) {
      console.warn('[Besu] Contract not initialized, skipping on-chain smart contract write');
      return null;
    }

    const dDonor = donorAddress || signer.address;
    const dName = donorName || 'Anonymous Donor';
    const dAmount = ethers.parseEther((Number(amount) || 0).toString());
    const dRef = referenceNumber || `REF-${Date.now()}`;
    const dHash = blockHash || `HASH-${Date.now()}`;

    const tx = await contract.recordDonation(
      dDonor,
      dName,
      dAmount,
      dRef,
      dHash
    );

    const receipt = await tx.wait();
    console.log(`✅ [Hyperledger Besu Mined] Tx Hash: ${receipt.hash} | Block: ${receipt.blockNumber}`);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString()
    };
  } catch (err) {
    console.error('❌ [Besu Smart Contract Error]:', err.message);
    return null;
  }
}

module.exports = {
  recordDonationOnChain,
  initBesu
};
