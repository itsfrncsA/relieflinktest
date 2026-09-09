const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.blockchain' });
require('dotenv').config({ path: '.env' });

async function getAllTransactions() {
  const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
  console.log(`📡 Connecting to RPC Provider: ${rpcUrl}`);
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const latestBlock = await provider.getBlockNumber();
    console.log(`📊 Total Blocks on Chain: ${latestBlock}\n`);

    let totalTxCount = 0;
    const batchSize = 50;

    for (let i = 0; i <= latestBlock; i += batchSize) {
      const end = Math.min(i + batchSize - 1, latestBlock);
      const promises = [];

      for (let blockNum = i; blockNum <= end; blockNum++) {
        promises.push(provider.getBlock(blockNum));
      }

      const blocks = await Promise.all(promises);

      for (const block of blocks) {
        if (block && block.transactions && block.transactions.length > 0) {
          totalTxCount += block.transactions.length;
          console.log(`\n⛓️  Block ${block.number} (${new Date(block.timestamp * 1000).toISOString()})`);
          console.log(`   Block Hash:   ${block.hash}`);
          console.log(`   Transactions: ${block.transactions.length}`);
          
          for (const txHash of block.transactions) {
            const tx = await provider.getTransaction(txHash);
            const receipt = await provider.getTransactionReceipt(txHash);
            
            console.log(`   📝 Tx Hash: ${txHash}`);
            if (tx) {
              console.log(`      From:     ${tx.from}`);
              console.log(`      To:       ${tx.to || 'Contract Creation'}`);
              console.log(`      Value:    ${ethers.formatEther(tx.value || 0n)} ETH`);
              console.log(`      Nonce:    ${tx.nonce}`);
            }
            if (receipt) {
              console.log(`      Gas Used: ${receipt.gasUsed?.toString()}`);
              console.log(`      Status:   ${receipt.status === 1 ? '✅ Success' : '❌ Failed'}`);
            }
          }
        }
      }
    }

    if (totalTxCount === 0) {
      console.log(`ℹ️  No transactions found in blocks 0..${latestBlock}.`);
    } else {
      console.log(`\n🎉 Finished inspecting ${totalTxCount} total transaction(s) across ${latestBlock + 1} blocks.`);
    }

  } catch (err) {
    console.error('❌ Error querying blockchain RPC:', err.message);
  }
}

getAllTransactions();
