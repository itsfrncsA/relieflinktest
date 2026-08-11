const Sector = require('../models/Sector');
const User = require('../models/User');
const Donation = require('../models/Donations');
const bcrypt = require('bcryptjs');

// Default sector seeds without emojis
const DEFAULT_SECTORS = [
  { name: 'Senior Citizens', code: 'SENIORS', description: 'Elderly community members requiring financial & medical assistance', icon: '', targetBeneficiaries: 120, totalDisbursed: 15000 },
  { name: 'Persons with Disabilities (PWD)', code: 'PWD', description: 'Individuals with physical or mental impairments needing specialized support', icon: '', targetBeneficiaries: 85, totalDisbursed: 8000 },
  { name: 'Scholars', code: 'SCHOLARS', description: 'Educational scholars serving in parish ministries', icon: '', targetBeneficiaries: 45, totalDisbursed: 24000 },
  { name: 'Prison Ministry', code: 'PRISON', description: 'Support programs and rehabilitation for incarcerated individuals & families', icon: '', targetBeneficiaries: 30, totalDisbursed: 5000 },
  { name: 'Solo Parents', code: 'SOLO_PARENT', description: 'Single mothers and fathers requiring sustenance support', icon: '', targetBeneficiaries: 60, totalDisbursed: 10000 },
  { name: 'Disaster Relief', code: 'DISASTER', description: 'Emergency calamity response and relief packs', icon: '', targetBeneficiaries: 200, totalDisbursed: 30000 }
];

// Seed dummy beneficiaries and restricted donations
const seedSectorsIfNeeded = async () => {
  const count = await Sector.countDocuments();
  if (count === 0) {
    await Sector.insertMany(DEFAULT_SECTORS);
  }

  // Check if dummy beneficiaries need seeding
  const beneficiaryCount = await User.countDocuments({ sectorGroup: { $ne: 'None' } });
  if (beneficiaryCount === 0) {
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

      await User.insertMany(dummyBeneficiaries);
    }

    // Seed dummy restricted donations
    const restrictedDonationCount = await Donation.countDocuments({ isRestricted: true });
    if (restrictedDonationCount === 0) {
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

      await Donation.insertMany(dummyDonations);
    }
};

// @desc    Get all sector groups with calculated fund totals and member counts
// @route   GET /api/sectors
exports.getSectors = async (req, res) => {
  try {
    await seedSectorsIfNeeded();
    const sectors = await Sector.find().sort({ createdAt: 1 });

    // Aggregate donations per sector
    const sectorStats = await Promise.all(sectors.map(async (sector) => {
      const donations = await Donation.find({
        $or: [
          { sectorCategory: sector.name },
          { sectorCategory: sector.code }
        ],
        status: { $in: ['approved', 'completed'] }
      });
      
      const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

      const memberCount = await User.countDocuments({
        $or: [
          { sectorGroup: sector.name },
          { sectorGroup: { $regex: new RegExp(`^${sector.name}`, 'i') } }
        ]
      });

      return {
        ...sector.toObject(),
        totalRaised,
        remainingBudget: Math.max(0, totalRaised - sector.totalDisbursed),
        memberCount
      };
    }));

    res.json(sectorStats);
  } catch (error) {
    console.error('Error fetching sectors:', error);
    res.status(500).json({ message: 'Failed to fetch sectors', error: error.message });
  }
};

// @desc    Create a new sector group
// @route   POST /api/sectors
exports.createSector = async (req, res) => {
  try {
    const { name, code, description, icon, targetBeneficiaries } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Name and Code are required' });
    }

    const existing = await Sector.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (existing) {
      return res.status(400).json({ message: 'Sector with this name or code already exists' });
    }

    const sector = new Sector({
      name,
      code: code.toUpperCase(),
      description,
      icon: icon || '',
      targetBeneficiaries: targetBeneficiaries || 0
    });

    await sector.save();
    res.status(201).json(sector);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sector', error: error.message });
  }
};

// @desc    Get members of a specific sector
// @route   GET /api/sectors/:sectorName/members
exports.getSectorMembers = async (req, res) => {
  try {
    const { sectorName } = req.params;
    const members = await User.find({
      $or: [
        { sectorGroup: sectorName },
        { sectorGroup: { $regex: new RegExp(`^${sectorName}`, 'i') } }
      ]
    }).select('-password');

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sector members', error: error.message });
  }
};

// @desc    Disburse monthly allowance or financial aid to a sector member
// @route   POST /api/sectors/disburse
exports.disburseFund = async (req, res) => {
  try {
    const { userId, sectorId, amount } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Beneficiary user not found' });
    }

    const sector = await Sector.findById(sectorId);
    if (!sector) {
      return res.status(404).json({ message: 'Sector not found' });
    }

    sector.totalDisbursed += Number(amount);
    await sector.save();

    if (!user.scholarDetails) {
      user.scholarDetails = {};
    }
    user.scholarDetails.lastDisbursementDate = new Date();
    user.scholarDetails.serviceStatus = 'Pending';
    await user.save();

    res.json({
      message: `Disbursed PHP ${Number(amount).toLocaleString()} to ${user.name}`,
      sector,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error disbursing fund', error: error.message });
  }
};

// @desc    Update scholar parish service status
// @route   PATCH /api/sectors/scholars/:userId/service
exports.updateScholarService = async (req, res) => {
  try {
    const { userId } = req.params;
    const { serviceStatus } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Scholar user not found' });
    }

    if (!user.scholarDetails) {
      user.scholarDetails = {};
    }

    user.scholarDetails.serviceStatus = serviceStatus;
    await user.save();

    res.json({ message: 'Scholar service status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating scholar service status', error: error.message });
  }
};

// @desc    Update full scholar application & paperless details (Parish employee action)
// @route   PATCH /api/sectors/scholars/:userId/application
exports.updateScholarApplication = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      school, 
      courseProgram, 
      yearLevel, 
      gwa, 
      householdIncome, 
      monthlyAllowance, 
      serviceStatus, 
      applicationStatus, 
      requirements, 
      applicationNotes 
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Scholar user not found' });
    }

    if (!user.scholarDetails) {
      user.scholarDetails = {};
    }

    if (school !== undefined) user.scholarDetails.school = school;
    if (courseProgram !== undefined) user.scholarDetails.courseProgram = courseProgram;
    if (yearLevel !== undefined) user.scholarDetails.yearLevel = yearLevel;
    if (gwa !== undefined) user.scholarDetails.gwa = Number(gwa);
    if (householdIncome !== undefined) user.scholarDetails.householdIncome = Number(householdIncome);
    if (monthlyAllowance !== undefined) user.scholarDetails.monthlyAllowance = Number(monthlyAllowance);
    if (serviceStatus !== undefined) user.scholarDetails.serviceStatus = serviceStatus;
    if (applicationStatus !== undefined) user.scholarDetails.applicationStatus = applicationStatus;
    if (applicationNotes !== undefined) user.scholarDetails.applicationNotes = applicationNotes;
    
    if (requirements) {
      user.scholarDetails.requirements = {
        ...user.scholarDetails.requirements,
        ...requirements
      };
    }

    // Auto assign user to Scholars sector group if application approved/active
    if (['Approved', 'Active'].includes(applicationStatus) && user.sectorGroup !== 'Scholars') {
      user.sectorGroup = 'Scholars';
    }

    await user.save();
    res.json({ message: 'Scholarship application updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating scholarship application', error: error.message });
  }
};
