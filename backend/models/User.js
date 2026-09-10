const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['superadmin', 'admin', 'staff', 'volunteer', 'user', 'donor', 'relief_worker'], 
    default: 'user' 
  },
  phone: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v) {
        if (!v || typeof v !== 'string' || v.trim() === '') return true; // Optional field
        const cleaned = v.replace(/[\s\-\(\)\.]/g, '');
        return /^[\+]?[0-9]{7,15}$/.test(cleaned);
      },
      message: 'Please provide a valid phone number'
    }
  },
  department: { 
    type: String, 
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
    default: 'active'
  },
  lastLogin: { type: Date, required: false },
  sectorGroup: { type: String, default: 'None' },
  sectorIdNumber: { type: String, required: false },
  lastAidReceivedDate: { type: Date, required: false },
  totalAidReceivedCount: { type: Number, default: 0 },
  reliefHistory: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, default: 0 },
    reliefType: { type: String, default: 'Relief Goods Pack' },
    notes: { type: String }
  }],
  scholarDetails: {
    school: { type: String },
    courseProgram: { type: String },
    yearLevel: { type: String },
    gwa: { type: Number },
    householdIncome: { type: Number },
    monthlyAllowance: { type: Number, default: 0 },
    applicationStatus: { type: String, default: 'Pending Review' },
    applicationNotes: { type: String },
    serviceStatus: { type: String, default: 'Pending' },
    lastServiceDate: { type: Date },
    requirements: {
      reportCard: { type: Boolean, default: false },
      indigencyCert: { type: Boolean, default: false },
      enrollmentForm: { type: Boolean, default: false },
      recommendationLetter: { type: Boolean, default: false }
    }
  },
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
  profileImage: { type: String, required: false }
}, { timestamps: true, strict: false });

// Default permissions based on role
userSchema.pre('save', function() {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'superadmin':
      case 'admin':
        this.permissions = [
          'donations:read', 'donations:write', 'donations:delete',
          'expenses:read', 'expenses:write', 'expenses:approve',
          'inventory:read', 'inventory:write', 'inventory:allocate',
          'users:read', 'users:write', 'users:delete',
          'reports:read', 'reports:generate'
        ];
        break;
      case 'staff':
      case 'relief_worker':
        this.permissions = [
          'donations:read', 'donations:write',
          'expenses:read', 'expenses:write',
          'inventory:read', 'inventory:write', 'inventory:allocate',
          'reports:read'
        ];
        break;
      case 'volunteer':
        this.permissions = [
          'donations:read',
          'inventory:read',
          'reports:read'
        ];
        break;
      case 'donor':
      case 'user':
      default:
        this.permissions = [
          'donations:read'
        ];
        break;
    }
  }
});

module.exports = mongoose.model('User', userSchema);
