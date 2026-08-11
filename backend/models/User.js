const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['superadmin', 'admin', 'user'], 
    default: 'user' 
  },
  phone: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[\+]?[0-9]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  department: { 
    type: String, 
    enum: ['operations', 'finance', 'programs', 'admin', 'volunteer'],
    required: false,
    set: (v) => {
      if (typeof v !== 'string') return v;
      const trimmed = v.trim();
      return trimmed === '' ? undefined : trimmed;
    }
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive', 'suspended'],
    default: 'pending'
  },
  lastLogin: { type: Date, required: false },
  permissions: [{
    type: String,
    enum: [
      'donations:read', 'donations:write', 'donations:delete',
      'expenses:read', 'expenses:write', 'expenses:approve',
      'inventory:read', 'inventory:write', 'inventory:allocate',
      'users:read', 'users:write', 'users:delete',
      'reports:read', 'reports:generate'
    ]
  }],
  profileImage: { type: String, required: false },
  sectorGroup: { 
    type: String, 
    enum: ['Seniors', 'PWD', 'Scholars', 'Prison Ministry', 'Solo Parents', 'Disaster Relief', 'General', 'None'],
    default: 'None'
  },
  sectorIdNumber: { type: String, required: false, default: null },
  scholarDetails: {
    school: { type: String, default: '' },
    courseProgram: { type: String, default: '' },
    yearLevel: { type: String, default: '' },
    gwa: { type: Number, default: 0 },
    householdIncome: { type: Number, default: 0 },
    monthlyAllowance: { type: Number, default: 0 },
    serviceStatus: { type: String, enum: ['Served', 'Pending', 'Exempt'], default: 'Pending' },
    applicationStatus: { 
      type: String, 
      enum: ['Pending Review', 'Interview Scheduled', 'Approved', 'Active', 'Completed', 'Rejected'], 
      default: 'Pending Review' 
    },
    requirements: {
      reportCard: { type: Boolean, default: false },
      indigencyCert: { type: Boolean, default: false },
      enrollmentForm: { type: Boolean, default: false },
      recommendationLetter: { type: Boolean, default: false }
    },
    applicationNotes: { type: String, default: '' },
    lastDisbursementDate: { type: Date, default: null }
  },
  resetPasswordOtp: { type: String, required: false },
  resetPasswordOtpExpiry: { type: Date, required: false }
}, { timestamps: true });

// Default permissions based on role
userSchema.pre('save', function() {
  if (this.isNew) {
    switch (this.role) {
      case 'superadmin':
        this.permissions = [
          'donations:read', 'donations:write', 'donations:delete',
          'expenses:read', 'expenses:write', 'expenses:approve',
          'inventory:read', 'inventory:write', 'inventory:allocate',
          'users:read', 'users:write', 'users:delete',
          'reports:read', 'reports:generate'
        ];
        break;
      case 'admin':
        this.permissions = [
          'donations:read', 'donations:write',
          'expenses:read', 'expenses:write',
          'inventory:read', 'inventory:write',
          'users:read', 'users:write',
          'reports:read'
        ];
        break;
      case 'user':
        this.permissions = [
          'donations:read'
        ];
        break;
    }
  }
});

module.exports = mongoose.model('User', userSchema);
