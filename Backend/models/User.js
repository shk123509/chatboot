const mongoose = require('mongoose');
const { Schema } = mongoose;


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // Farming profile fields
  profile: {
    profilePicture: {
      type: String,
      default: ''
    },
    location: {
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      village: { type: String, default: '' }
    },
    farmingType: {
      type: [String],
      enum: ['crop_farming', 'livestock', 'mixed_farming', 'organic_farming', 'commercial_farming'],
      default: ['crop_farming']
    },
    primaryCrops: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'experienced', 'expert'],
      default: 'beginner'
    },
    farmSize: {
      type: Number, // in acres
      default: 0
    },
    phone: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxLength: 500,
      default: ''
    }
  },
  preferences: {
    language: {
      type: String,
      enum: ['english', 'hindi', 'punjabi', 'urdu'],
      default: 'english'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});
const User = mongoose.model('user', UserSchema);
module.exports =User
