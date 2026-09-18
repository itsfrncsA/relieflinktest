const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await mongoose.connection.collection('users').find({}).toArray();
    let updatedCount = 0;

    for (const u of users) {
      if (u.role === 'beneficiary') {
        await mongoose.connection.collection('users').updateOne(
          { _id: u._id },
          { $set: { role: 'user' } }
        );
        console.log(`Updated user ${u.name} (${u.email}) from role 'beneficiary' to 'user'`);
        updatedCount++;
      }
    }

    console.log(`Total users updated: ${updatedCount}`);
    const summary = await mongoose.connection.collection('users').find({}, { projection: { name: 1, email: 1, role: 1, sectorGroup: 1 } }).toArray();
    console.log('All users now:', JSON.stringify(summary, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
