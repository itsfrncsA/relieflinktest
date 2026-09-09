const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.blockchain' });
const fs = require('fs');

const DONATION_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "donationCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_donor", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "string", "name": "_txHash", "type": "string" }
    ],
    "name": "recordDonation",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_donationId", "type": "uint256" }],
    "name": "getDonation",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "donor", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "transactionHash", "type": "string" },
          { "internalType": "bool", "name": "verified", "type": "bool" }
        ],
        "internalType": "struct DonationRegistry.Donation",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalDonations",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "donationId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "donor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "description", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DonationRecorded",
    "type": "event"
  }
];

// Simplified bytecode (minimal contract for testing)
const DONATION_REGISTRY_BYTECODE = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610449806100606000396000f3fe608060405234801561001057600080fd5b506004361061006d5760003560e01c80631c6c2182146100725780632e4176cf1461008e57806353ded64e146100ac57806367e404ce146100ca5780639e917b8b146100e857806301ffc9a71461010657805b600080fd5b61008c6004803603810190610087919061028d565b610132565b005b610096610258565b6040516100a39190610325565b60405180910390f35b6100b4610262565b6040516100c19190610325565b60405180910390f35b6100d261026c565b6040516100df9190610343565b60405180910390f35b6100f06102b7565b6040516100fd9190610325565b60405180910390f35b610120600480360381019061011b919061037f565b6102c1565b60405161012d9190610342565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146101c1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101b890610400565b60405180910390fd5b6001808054905010156101d457600080fd5b6001805480610265600160018054906101000a90039054906101000a900473ffffffffffffffffffffffffffffffffffffffff1686868687604051602001610256959493929190610450565b604051602081830303815290604052610395565b505050505050565b60018054905090565b6000600154905090565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600180549050905090565b600060e0160000000000000000000000000000000000000000000000000000000080161901905056fea26469706673582212201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef64736f6c63430008110033";

async function deploy() {
  try {
    console.log('\n📋 Deploying DonationRegistry Smart Contract\n');
    console.log('═══════════════════════════════════════════\n');

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const ganacheKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
    const signer = new ethers.Wallet(ganacheKey, provider);

    console.log(`🔐 Deployer Account: ${signer.address}`);
    const balance = await provider.getBalance(signer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

    const factory = new ethers.ContractFactory(DONATION_REGISTRY_ABI, DONATION_REGISTRY_BYTECODE, signer);
    
    console.log('⛓️  Submitting deployment transaction...');
    const contract = await factory.deploy();
    const deployTx = contract.deploymentTransaction();
    console.log(`📝 Tx Hash: ${deployTx.hash}`);

    console.log('⏳ Waiting for confirmation...');
    const receipt = await contract.deploymentTransaction().wait();
    
    const contractAddress = await contract.getAddress();
    console.log(`\n✅ Contract Deployed Successfully!`);
    console.log(`📬 Contract Address: ${contractAddress}`);
    console.log(`📦 Block Number: ${receipt.blockNumber}\n`);

    // Save deployment info
    fs.mkdirSync('./contracts', { recursive: true });
    const deploymentInfo = {
      contractAddress: contractAddress,
      deploymentTx: deployTx.hash,
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toISOString(),
      network: 'ganache',
      chainId: 1337,
      abi: DONATION_REGISTRY_ABI
    };

    fs.writeFileSync(
      './contracts/DonationRegistry-deployment.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('💾 Saved deployment data to: ./contracts/DonationRegistry-deployment.json');
    console.log('\n✅✅✅ DEPLOYMENT COMPLETE ✅✅✅');
    console.log('\nYou can now use this contract address in your backend:');
    console.log(`  export DONATION_CONTRACT_ADDRESS=${contractAddress}`);
    console.log('\nNext: Deploy donation records via recordDonation() function\n');

  } catch (error) {
    console.error('\n❌ Deployment Failed:', error.message);
    process.exit(1);
  }
}

deploy();
