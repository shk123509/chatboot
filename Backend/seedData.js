require('dotenv').config();
const mongoose = require('mongoose');
const connectToMongo = require('./db');
const Crop = require('./models/Crop');
const CropIssue = require('./models/CropIssue');

async function seedData() {
  try {
    await connectToMongo();
    console.log('Seeding data...');

    // Create Wheat (Gahum) crop
    const wheat = await Crop.findOneAndUpdate(
      { name: 'Wheat' },
      {
        name: 'Wheat',
        localNames: [
          { language: 'hindi', name: 'गेहूं (Gehun)' },
          { language: 'punjabi', name: 'ਕਣਕ (Kanak)' },
          { language: 'urdu', name: 'گندم (Gandum)' }
        ],
        scientificName: 'Triticum aestivum',
        category: 'cereal',
        season: ['rabi'],
        growingRegions: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan'],
        growingConditions: {
          climate: 'Cool and dry',
          soilType: ['loamy', 'clay loam'],
          temperature: { min: 10, max: 25 },
          rainfall: { min: 600, max: 1000 },
          ph: { min: 6.0, max: 7.5 }
        },
        cultivation: {
          seedRate: '100-125 kg/ha',
          spacing: '20-23 cm row spacing',
          fertilizer: 'NPK 120:60:40 kg/ha',
          irrigation: '4-6 irrigations',
          harvestTime: '120-140 days'
        },
        marketPrice: {
          currentPrice: 2125,
          unit: 'per quintal'
        }
      },
      { upsert: true, new: true }
    );

    // Create Yellow Rust issue for wheat
    await CropIssue.findOneAndUpdate(
      { name: 'Yellow Rust', crop: wheat._id },
      {
        name: 'Yellow Rust',
        type: 'disease',
        crop: wheat._id,
        severity: 'high',
        symptoms: [
          { description: 'Yellow/orange powdery pustules on leaves', stage: 'vegetative', location: 'leaves' },
          { description: 'Stripes of yellow rust running parallel to leaf veins', stage: 'flowering', location: 'leaves' }
        ],
        causes: ['Fungal pathogen Puccinia striiformis', 'Cool and humid weather', 'Susceptible varieties'],
        preventiveMeasures: [
          { measure: 'Use resistant varieties', timing: 'Before sowing' },
          { measure: 'Seed treatment with fungicides', timing: 'Before sowing' },
          { measure: 'Monitor fields regularly', timing: 'Throughout season' }
        ],
        treatment: {
          chemical: [{
            chemical: 'Propiconazole 25 EC',
            dosage: '1 ml/litre water',
            application: 'Foliar spray in morning or evening',
            precautions: ['Wear protective gear', 'Avoid during flowering'],
            effectiveness: 85
          }],
          organic: [{
            method: 'Neem oil spray',
            ingredients: ['Neem oil', 'Water', 'Soap solution'],
            application: '5ml neem oil per litre',
            effectiveness: 60
          }]
        },
        environmentalFactors: {
          temperature: '12-20°C favorable',
          humidity: 'High humidity >70%',
          season: 'rabi'
        },
        tags: ['wheat', 'fungal', 'yellow rust', 'leaf disease']
      },
      { upsert: true, new: true }
    );

    // Add reference to issue in crop
    await Crop.findByIdAndUpdate(wheat._id, {
      $addToSet: { commonIssues: (await CropIssue.findOne({ name: 'Yellow Rust' }))._id }
    });

    // Create Rice crop
    const rice = await Crop.findOneAndUpdate(
      { name: 'Rice' },
      {
        name: 'Rice',
        localNames: [
          { language: 'hindi', name: 'चावल (Chawal)' },
          { language: 'punjabi', name: 'ਚੌਲ (Chaul)' },
          { language: 'urdu', name: 'چاول (Chawal)' }
        ],
        scientificName: 'Oryza sativa',
        category: 'cereal',
        season: ['kharif'],
        growingRegions: ['West Bengal', 'Punjab', 'Uttar Pradesh', 'Andhra Pradesh', 'Bihar'],
        growingConditions: {
          climate: 'Hot and humid',
          soilType: ['clay', 'clay loam', 'silt loam'],
          temperature: { min: 20, max: 35 },
          rainfall: { min: 1000, max: 2000 },
          ph: { min: 5.5, max: 7.0 }
        },
        cultivation: {
          seedRate: '20-25 kg/ha (transplanted)',
          spacing: '20x15 cm',
          fertilizer: 'NPK 120:60:60 kg/ha',
          irrigation: 'Continuous flooding',
          harvestTime: '120-150 days'
        },
        marketPrice: {
          currentPrice: 2040,
          unit: 'per quintal'
        }
      },
      { upsert: true, new: true }
    );

    console.log('✅ Seed data created successfully!');
    console.log('Created crops: Wheat, Rice');
    console.log('Created issues: Yellow Rust (Wheat)');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();