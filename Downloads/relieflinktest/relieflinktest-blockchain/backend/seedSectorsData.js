const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Sector = require('./models/Sector');
const User = require('./models/User');
const Donation = require('./models/Donations');

const DEFAULT_SECTORS = [
  { name: 'Senior Citizens', code: 'SENIORS', description: 'Elderly community members requiring financial & medical assistance', icon: '', targetBeneficiaries: 120, totalDisbursed: 15000 },
  { name: 'Persons with Disabilities (PWD)', code: 'PWD', description: 'Individuals with physical or mental impairments needing specialized support', icon: '', targetBeneficiaries: 85, totalDisbursed: 8000 },
  { name: 'Scholars', code: 'SCHOLARS', description: 'Educational scholars serving in parish ministries', icon: '', targetBeneficiaries: 45, totalDisbursed: 24000 },
  { name: 'Prison Ministry', code: 'PRISON', description: 'Support programs and rehabilitation for incarcerated individuals & families', icon: '', targetBeneficiaries: 30, totalDisbursed: 5000 },
  { name: 'Solo Parents', code: 'SOLO_PARENT', description: 'Single mothers and fathers requiring sustenance support', icon: '', targetBeneficiaries: 60, totalDisbursed: 10000 },
  { name: 'Disaster Relief', code: 'DISASTER', description: 'Emergency calamity response and relief packs', icon: '', targetBeneficiaries: 200, totalDisbursed: 30000 }
];

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/relieflink';
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB for seeding Sector data...');

    // Seed/Upsert Sectors
    for (const sec of DEFAULT_SECTORS) {
      await Sector.findOneAndUpdate({ code: sec.code }, sec, { upsert: true, new: true });
    }
    console.log('Sectors seeded successfully.');

    // Seed Dummy Beneficiaries
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const dummyBeneficiaries = [
      {
        name: 'Lourdes Santos',
        email: 'lourdes.santos@gmail.com',
        password: hashedPassword,
        role: 'user',
        phone: '09171234567',
        status: 'active',
        sectorGroup: 'Senior Citizens',
        sectorIdNumber: 'OSCA-2024-0012',
        scholarDetails: { lastDisbursementDate: new Date('2024-07-15') }
      },
      {
        name: 'Jose Ramos',
        email: 'jose.ramos@gmail.com',
        password: hashedPassword,
        role: 'user',
        phone: '09182345678',
        status: 'active',
        sectorGroup: 'Persons with Disabilities (PWD)',
        sectorIdNumber: 'PWD-2024-0891',
        scholarDetails: { lastDisbursementDate: new Date('2024-07-20') }
      },
      {
        name: 'Maria Clara Cruz',
        email: 'maria.cruz@scholar.edu.ph',
        password: hashedPassword,
        role: 'user',
        phone: '09193456789',
        status: 'active',
        sectorGroup: 'Scholars',
        sectorIdNumber: 'SCH-2024-0104',
        scholarDetails: {
          school: 'Polytechnic University of the Philippines',
          yearLevel: '3rd Year BS Information Technology',
          monthlyAllowance: 3000,
          serviceStatus: 'Served',
          lastDisbursementDate: new Date('2024-08-01')
        }
      },
      {
        name: 'Juan Dela Cruz Jr.',
        email: 'juan.delacruz@scholar.edu.ph',
        password: hashedPassword,
        role: 'user',
        phone: '09204567890',
        status: 'active',
        sectorGroup: 'Scholars',
        sectorIdNumber: 'SCH-2024-0105',
        scholarDetails: {
          school: 'Eulogio Amang Rodriguez Institute of Technology',
          yearLevel: '2nd Year BS Computer Science',
          monthlyAllowance: 2500,
          serviceStatus: 'Pending',
          lastDisbursementDate: new Date('2024-07-05')
        }
      },
      {
        name: 'Eduardo Dela Rosa',
        email: 'eduardo.delarosa@gmail.com',
        password: hashedPassword,
        role: 'user',
        phone: '09215678901',
        status: 'active',
        sectorGroup: 'Prison Ministry',
        sectorIdNumber: 'PM-2024-0045',
        scholarDetails: { lastDisbursementDate: new Date('2024-06-30') }
      },
      {
        name: 'Elena Gutierrez',
        email: 'elena.gutierrez@gmail.com',
        password: hashedPassword,
        role: 'user',
        phone: '09226789012',
        status: 'active',
        sectorGroup: 'Solo Parents',
        sectorIdNumber: 'SP-2024-0312',
        scholarDetails: { lastDisbursementDate: new Date('2024-07-10') }
      }
    ];

    for (const b of dummyBeneficiaries) {
      await User.findOneAndUpdate({ email: b.email }, b, { upsert: true, new: true });
    }
    console.log('Dummy sector beneficiaries seeded successfully.');

    // Seed Dummy Restricted Donations
    const adminUser = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    const adminId = adminUser ? adminUser._id : null;

    const dummyDonations = [
      {
        donorId: adminId,
        donorName: 'Anonymous Donor',
        amount: 50000,
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'REF-BANK-9921',
        notes: 'Restricted fund for parish student scholarship allowances',
        destination: 'Scholars Educational Fund',
        sectorCategory: 'Scholars',
        isRestricted: true,
        isAnonymous: true,
        acknowledgementNo: 'ACK-881231-104',
        verificationStatus: 'approved',
        status: 'approved'
      },
      {
        donorId: adminId,
        donorName: 'Don Ramon Foundation',
        amount: 40000,
        paymentMethod: 'GCash',
        referenceNumber: 'REF-GCASH-4401',
        notes: 'Restricted allocation for senior citizen medicine & food packs',
        destination: 'Senior Citizens Assistance',
        sectorCategory: 'Senior Citizens',
        isRestricted: true,
        isAnonymous: false,
        acknowledgementNo: 'ACK-881231-105',
        verificationStatus: 'approved',
        status: 'approved'
      },
      {
        donorId: adminId,
        donorName: 'Anonymous Donor',
        amount: 25000,
        paymentMethod: 'Cash',
        referenceNumber: 'REF-CASH-1002',
        notes: 'Support for PWD mobility aids and wheelchair maintenance',
        destination: 'PWD Support Fund',
        sectorCategory: 'Persons with Disabilities (PWD)',
        isRestricted: true,
        isAnonymous: true,
        acknowledgementNo: 'ACK-881231-106',
        verificationStatus: 'approved',
        status: 'approved'
      },
      {
        donorId: adminId,
        donorName: 'Parish Youth Guild',
        amount: 15000,
        paymentMethod: 'Maya',
        referenceNumber: 'REF-MAYA-3329',
        notes: 'Care packages for incarcerated brethren in prison ministry',
        destination: 'Prison Ministry',
        sectorCategory: 'Prison Ministry',
        isRestricted: true,
        isAnonymous: false,
        acknowledgementNo: 'ACK-881231-107',
        verificationStatus: 'approved',
        status: 'approved'
      }
    ];

    for (const d of dummyDonations) {
      await Donation.findOneAndUpdate({ acknowledgementNo: d.acknowledgementNo }, d, { upsert: true, new: true });
    }
    console.log('Dummy restricted donations seeded successfully.');

    mongoose.disconnect();
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
