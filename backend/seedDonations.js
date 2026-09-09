const mongoose = require('mongoose');
const Donation = require('./models/Donations');
require('dotenv').config();

const seedDonations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/relieflink');

    const donations = [
      {
        donorName: 'Dono1',
        amount: 5000,
        verificationStatus: 'approved',
        verified: true,
        verifiedBy: 'admin',
        verificationNotes: 'Verified via receipt'
      },
      {
        donorName: 'Dono2',
        amount: 2500,
        verificationStatus: 'approved',
        verified: true,
        verifiedBy: 'admin',
        verificationNotes: 'Verified via receipt'
      },
      {
        donorName: 'Dono3',
        amount: 10000,
        verificationStatus: 'approved',
        verified: true,
        verifiedBy: 'admin',
        verificationNotes: 'Verified via receipt'
      },
      {
        donorName: 'Dono4',
        amount: 7500,
        verificationStatus: 'approved',
        verified: true,
        verifiedBy: 'admin',
        verificationNotes: 'Verified via receipt'
      },
      {
        donorName: 'Dono5',
        amount: 3000,
        verificationStatus: 'approved',
        verified: true,
        verifiedBy: 'admin',
        verificationNotes: 'Verified via receipt'
      }
    ];

    await Donation.insertMany(donations);
    console.log('Sample donations seeded successfully!');
  } catch (error) {
    console.error('Error seeding donations:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDonations();