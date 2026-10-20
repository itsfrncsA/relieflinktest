const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

require('dotenv').config({
  path: path.join(__dirname, '../.env.blockchain')
});
require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

let provider = null;
let signer = null;
let contract = null;
let deploymentData = null;

function initBesu() {
  try {
    const deploymentPath = path.join(
      __dirname,
      '../contracts/DonationTracker-deployment.json'
    );

    if (!fs.existsSync(deploymentPath)) {
      throw new Error('DonationTracker deployment file not found');
    }

    deploymentData = JSON.parse(
      fs.readFileSync(deploymentPath, 'utf8')
    );

    const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      throw new Error('PRIVATE_KEY is not configured');
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    signer = new ethers.Wallet(privateKey, provider);

    contract = new ethers.Contract(
      deploymentData.contractAddress,
      deploymentData.abi,
      signer
    );

    console.log('[Besu] Contract:', deploymentData.contractAddress);
    return contract;
  } catch (err) {
    console.error('[Besu Init Error]:', err.message);
    return null;
  }
}

async function recordDonationOnChain({ 
  donationId, 
  donorId, 
  donorAddress, 
  amount, 
  referenceNumber, 
  blockHash 
 }) {
  try {
    if (!contract && !initBesu()) {
      throw new Error('Contract initialization failed');
    }

    // Convert the MongoDB ObjectId into a uint256.
        const rawId = String(donationId || blockHash || '');

    if (!/^[a-fA-F0-9]{24}$/.test(rawId)) {
      throw new Error('Valid MongoDB donation ID required');
    }

    const chainDonationId = BigInt('0x' + rawId);

    const dDonor = donorAddress && ethers.isAddress(donorAddress)
      ? ethers.getAddress(donorAddress)
      : ethers.getAddress('0x' + ethers.id(String(donorId || 'anonymous')).slice(-40));

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid donation amount');
    }

    const cents = Math.round(numericAmount * 100);
    if (Math.abs(numericAmount * 100 - cents) > 0.000001) {
      throw new Error('Amount must have at most two decimal places');
    }

    const paymentReference = ethers.id(
      'RELIEFLINK-DONATION-' + String(referenceNumber || rawId).toLowerCase()
    );

    if (await contract.donationExists(chainDonationId)) {
      throw new Error('Donation already exists on-chain');
    }

    if (await contract.paymentReferenceUsed(paymentReference)) {
      throw new Error('Payment reference already used');
    }

    const tx = await contract.recordDonation(
      chainDonationId,
      dDonor,
      cents,
      paymentReference
    );

    const receipt = await tx.wait();

    if (!receipt || receipt.status !== 1) {
      throw new Error('Blockchain transaction was not successful');
    }

    console.log(
      `[Besu] Donation recorded: ${receipt.hash} | Block: ${receipt.blockNumber}`
    );

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (err) {
    console.error('[Besu Smart Contract Error]:', err.message);
    return null;
  }
}

module.exports = {
  recordDonationOnChain,
  initBesu
};
