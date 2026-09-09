const solc = require('solc');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.blockchain' });
require('dotenv').config({ path: '.env' });

async function compileAndDeploy() {
  console.log('🔨 Compiling DonationRegistry.sol...');
  
  const contractPath = path.join(__dirname, 'contracts/DonationRegistry.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'DonationRegistry.sol': {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    for (const error of output.errors) {
      console.log(error.formattedMessage);
      if (error.severity === 'error') process.exit(1);
    }
  }

  const contractFile = output.contracts['DonationRegistry.sol']['DonationRegistry'];
  const abi = contractFile.abi;
  const bytecode = contractFile.evm.bytecode.object;

  console.log('✅ Compilation successful!');
  console.log('📡 Connecting to Hyperledger Besu at:', process.env.RPC_URL || 'http://localhost:8545');

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
  const privateKey = process.env.PRIVATE_KEY || '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('🔐 Deployer address:', wallet.address);
  
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log('⛓️  Deploying contract to Besu...');
  
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log(`\n🎉 Contract Deployed Successfully to Besu!`);
  console.log(`📬 Contract Address: ${address}`);
  console.log(`📝 Tx Hash: ${deployTx?.hash}`);

  const deploymentData = {
    contractAddress: address,
    deploymentTx: deployTx?.hash,
    network: 'besu',
    chainId: 1337,
    timestamp: new Date().toISOString(),
    abi: abi
  };

  fs.writeFileSync(
    path.join(__dirname, 'contracts/DonationRegistry-deployment.json'),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log('💾 Saved to contracts/DonationRegistry-deployment.json\n');
}

compileAndDeploy().catch(err => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
