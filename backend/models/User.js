const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'staff', 'volunteer'], 
    default: 'staff' 
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
  profileImage: { type: String, required: false }
}, { timestamps: true });

// Default permissions based on role
userSchema.pre('save', function() {
  if (this.isNew) {
    switch (this.role) {
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
        this.permissions = [
          'donations:read', 'donations:write',
          'expenses:read', 'expenses:write',
          'inventory:read', 'inventory:write',
          'reports:read'
        ];
        break;
      case 'volunteer':
        this.permissions = [
          'donations:read',
          'inventory:read'
        ];
        break;
    }
  }
});

module.exports = mongoose.model('User', userSchema);
