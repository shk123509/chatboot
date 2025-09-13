const mongoose = require('mongoose');
const { Schema } = mongoose;

const CropIssueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['disease', 'pest', 'nutrient_deficiency', 'weather_damage', 'soil_issue', 'irrigation_issue'],
    required: true
  },
  crop: {
    type: Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  symptoms: [{
    description: { type: String, required: true },
    stage: { type: String, default: '' }, // germination, vegetative, flowering, etc.
    location: { type: String, default: '' } // leaves, stems, roots, fruits
  }],
  causes: [{
    type: String
  }],
  preventiveMeasures: [{
    measure: { type: String, required: true },
    timing: { type: String, default: '' },
    cost: { type: String, default: '' }
  }],
  treatment: {
    organic: [{
      method: { type: String, required: true },
      ingredients: [{ type: String }],
      application: { type: String, default: '' },
      effectiveness: { type: Number, min: 0, max: 100, default: 70 }
    }],
    chemical: [{
      chemical: { type: String, required: true },
      dosage: { type: String, required: true },
      application: { type: String, default: '' },
      precautions: [{ type: String }],
      effectiveness: { type: Number, min: 0, max: 100, default: 85 }
    }],
    biological: [{
      method: { type: String, required: true },
      agent: { type: String, default: '' },
      application: { type: String, default: '' },
      effectiveness: { type: Number, min: 0, max: 100, default: 75 }
    }]
  },
  environmentalFactors: {
    temperature: { type: String, default: '' },
    humidity: { type: String, default: '' },
    rainfall: { type: String, default: '' },
    season: { type: String, default: '' }
  },
  economicImpact: {
    yieldLoss: { type: String, default: '' }, // percentage or description
    costOfTreatment: { type: String, default: '' },
    marketImpact: { type: String, default: '' }
  },
  images: [{
    url: { type: String, required: true },
    description: { type: String, default: '' },
    stage: { type: String, default: '' }
  }],
  resources: [{
    title: { type: String, required: true },
    url: { type: String, default: '' },
    type: { type: String, enum: ['video', 'article', 'research_paper', 'government_advisory'], default: 'article' }
  }],
  regionalInfo: [{
    region: { type: String, required: true },
    prevalence: { type: String, enum: ['rare', 'occasional', 'common', 'very_common'], default: 'common' },
    seasonality: { type: String, default: '' },
    localRemedies: [{ type: String }]
  }],
  expertVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    expertName: { type: String, default: '' },
    qualification: { type: String, default: '' },
    verifiedDate: { type: Date }
  },
  userReports: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    location: { type: String, default: '' },
    reportDate: { type: Date, default: Date.now },
    effectivenessFeedback: { type: Number, min: 1, max: 5, default: 3 },
    additionalNotes: { type: String, default: '' }
  }],
  tags: [{ type: String }], // for better searchability
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
CropIssueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better search performance
CropIssueSchema.index({ name: 'text', 'symptoms.description': 'text', tags: 'text' });
CropIssueSchema.index({ crop: 1, type: 1 });

const CropIssue = mongoose.model('CropIssue', CropIssueSchema);
module.exports = CropIssue;