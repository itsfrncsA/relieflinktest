const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.blockchain' });

/**
 * Stage 2 Integration Test: Backend ↔ Blockchain
 * Verifies that your Node.js backend can connect to and interact with the blockchain
 */

async function runStage2Tests() {
  try {
    console.log('🧪 Stage 2: Application/Backend Integration Testing');
    console.log('===============================================\n');

    // Step 1: Connect to RPC Provider
    console.log('1️⃣  Connecting to blockchain RPC...');
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})\n`);

    // Step 2: Get block number
    console.log('2️⃣  Fetching current block number...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Current block: ${blockNumber}\n`);

    // Step 3: Use Ganache's default pre-funded account (index 0)
    console.log('3️⃣  Loading pre-funded signer wallet (Ganache default)...');
    const ganachePrivateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
    const wallet = new ethers.Wallet(ganachePrivateKey, provider);
    console.log(`✅ Wallet address: ${wallet.address}\n`);

    // Step 4: Check wallet balance
    console.log('4️⃣  Checking wallet balance...');
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`✅ Balance: ${balanceInEth} ETH\n`);

    // Step 5: Get gas price
    console.log('5️⃣  Fetching current gas price...');
    const gasPrice = await provider.getFeeData();
    console.log(`✅ Gas price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} Gwei\n`);

    // Step 6: Send a test transaction
    console.log('6️⃣  Sending test transaction...');
    const recipient = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const tx = await wallet.sendTransaction({
      to: recipient,
      value: ethers.parseEther('1.0'),
      gasLimit: 21000
    });
    console.log(`✅ Transaction submitted: ${tx.hash}`);

    // Step 7: Wait for confirmation
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}\n`);

    // Step 8: Verify recipient received funds
    console.log('8️⃣  Verifying recipient balance...');
    const recipientBalance = await provider.getBalance(recipient);
    console.log(`✅ Recipient balance: ${ethers.formatEther(recipientBalance)} ETH\n`);

    // Step 9: Get updated block number
    console.log('9️⃣  Fetching updated block number...');
    const newBlockNumber = await provider.getBlockNumber();
    console.log(`✅ New block: ${newBlockNumber} (Transaction mined!)\n`);

    console.log('✅✅✅ Stage 2 Complete! Backend ↔ Blockchain integration verified! ✅✅✅');
    console.log('\n💡 Next: Test full end-to-end flow with your donation contract.');
    console.log(`📊 Transaction details:\n   From: ${wallet.address}\n   To: ${recipient}\n   Amount: 1.0 ETH\n   Block: ${receipt.blockNumber}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runStage2Tests();
