const mongoose = require('mongoose');
const { Schema } = mongoose;

const CropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  localNames: [{
    language: { type: String, required: true },
    name: { type: String, required: true }
  }],
  scientificName: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['cereal', 'vegetable', 'fruit', 'pulse', 'oilseed', 'spice', 'cash_crop'],
    required: true
  },
  season: {
    type: [String],
    enum: ['kharif', 'rabi', 'zaid', 'perennial'],
    required: true
  },
  growingRegions: [{
    type: String
  }],
  growingConditions: {
    climate: { type: String, default: '' },
    soilType: { type: [String], default: [] },
    temperature: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 50 }
    },
    rainfall: {
      min: { type: Number, default: 0 }, // in mm
      max: { type: Number, default: 2000 }
    },
    ph: {
      min: { type: Number, default: 6.0 },
      max: { type: Number, default: 8.0 }
    }
  },
  commonIssues: [{
    type: Schema.Types.ObjectId,
    ref: 'CropIssue'
  }],
  nutritionalValue: {
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    vitamins: [{ type: String }],
    minerals: [{ type: String }]
  },
  economicImportance: {
    type: String,
    default: ''
  },
  cultivation: {
    seedRate: { type: String, default: '' },
    spacing: { type: String, default: '' },
    fertilizer: { type: String, default: '' },
    irrigation: { type: String, default: '' },
    harvestTime: { type: String, default: '' }
  },
  marketPrice: {
    currentPrice: { type: Number, default: 0 },
    unit: { type: String, default: 'per quintal' },
    lastUpdated: { type: Date, default: Date.now }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CropSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Crop = mongoose.model('Crop', CropSchema);
module.exports = Crop;