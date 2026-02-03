import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Student identifier
  registerNumber: {
    type: String,
    unique: true,
    sparse: true,
    required: function() {
      return this.role === 'student';
    },
    validate: {
      validator: function(v) {
        // Students must have 12-digit register number
        if (this.role === 'student') {
          return /^\d{12}$/.test(v);
        }
        return true; // Staff/admin can have null
      },
      message: 'Student register number must be 12 digits'
    }
  },
  
  // Staff identifier
  staffId: {
    type: String,
    unique: true,
    sparse: true,
    required: function() {
      return this.role === 'staff';
    }
  },
  
  name: {
    type: String,
    required: true,
  },
  
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    required: true,
    default: 'student',
  },
  
  department: {
    type: String,
    required: true,
  },
  
  password: {
    type: String,
    required: true,
  },
  
  // Student specific
  batchYear: {
    type: Number,
    required: function() {
      return this.role === 'student';
    },
  },
  
  dob: {
    type: Date,
    required: function() {
      return this.role === 'student';
    },
  },
  
  profile: {
    profilePic: {
      type: String,
      default: '/placeholder.png',
    },
    bio: {
      type: String,
      default: '',
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to clean up identifiers
UserSchema.pre('save', function(next) {
  // Clean up identifiers based on role
  if (this.role === 'student') {
    // Students should NOT have staffId
    this.staffId = null;
  } else if (this.role === 'staff') {
    // Staff should NOT have registerNumber
    this.registerNumber = null;
  }
  
  // Convert "undefined" string to actual null
  if (this.registerNumber === 'undefined' || this.registerNumber === 'null') {
    this.registerNumber = null;
  }
  
  if (this.staffId === 'undefined' || this.staffId === 'null') {
    this.staffId = null;
  }
  
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);