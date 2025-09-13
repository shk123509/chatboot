const mongoose = require('mongoose');

const FarmerCropSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    crop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    variety: {
        type: String,
        trim: true
    },
    fieldSize: {
        type: Number, // in acres
        min: 0.1,
        max: 10000
    },
    location: {
        type: String,
        trim: true
    },
    coordinates: {
        latitude: {
            type: Number,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180
        }
    },
    plantingDate: {
        type: Date,
        required: true
    },
    expectedHarvestDate: {
        type: Date
    },
    actualHarvestDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['planted', 'growing', 'flowering', 'mature', 'harvested'],
        default: 'planted'
    },
    health: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'diseased'],
        default: 'good'
    },
    soilType: {
        type: String,
        enum: ['clay', 'sandy', 'loam', 'silt', 'peat'],
        trim: true
    },
    irrigationType: {
        type: String,
        enum: ['drip', 'sprinkler', 'flood', 'manual', 'rainfed'],
        default: 'manual'
    },
    fertilizers: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['organic', 'chemical', 'bio-fertilizer']
        },
        quantity: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['kg', 'liters', 'bags', 'tons'],
            default: 'kg'
        },
        applicationDate: {
            type: Date,
            default: Date.now
        },
        cost: {
            type: Number,
            min: 0
        }
    }],
    pesticides: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['insecticide', 'herbicide', 'fungicide', 'organic']
        },
        quantity: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['ml', 'liters', 'kg', 'grams'],
            default: 'ml'
        },
        applicationDate: {
            type: Date,
            default: Date.now
        },
        cost: {
            type: Number,
            min: 0
        },
        targetPest: String
    }],
    expenses: [{
        category: {
            type: String,
            enum: ['seeds', 'fertilizers', 'pesticides', 'labor', 'equipment', 'irrigation', 'other'],
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        date: {
            type: Date,
            default: Date.now
        },
        receipt: {
            type: String // URL to receipt image
        }
    }],
    yield: {
        expectedQuantity: {
            type: Number,
            min: 0
        },
        actualQuantity: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['kg', 'tons', 'quintals', 'bags'],
            default: 'kg'
        },
        qualityGrade: {
            type: String,
            enum: ['A', 'B', 'C', 'D'],
            default: 'A'
        },
        marketPrice: {
            type: Number,
            min: 0
        },
        totalRevenue: {
            type: Number,
            min: 0
        }
    },
    weatherData: {
        temperature: {
            min: Number,
            max: Number,
            current: Number
        },
        humidity: Number,
        rainfall: Number,
        windSpeed: Number,
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: String,
        dateTaken: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['planting', 'growth', 'flowering', 'harvest', 'disease', 'general'],
            default: 'general'
        }
    }],
    notes: [{
        content: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['observation', 'action', 'reminder', 'problem'],
            default: 'observation'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
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

// Middleware to update the updatedAt field
FarmerCropSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate profit
FarmerCropSchema.virtual('profit').get(function() {
    const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const fertilizersExpenses = this.fertilizers.reduce((sum, fertilizer) => sum + (fertilizer.cost || 0), 0);
    const pesticidesExpenses = this.pesticides.reduce((sum, pesticide) => sum + (pesticide.cost || 0), 0);
    const totalCosts = totalExpenses + fertilizersExpenses + pesticidesExpenses;
    
    return (this.yield.totalRevenue || 0) - totalCosts;
});

// Calculate yield per acre
FarmerCropSchema.virtual('yieldPerAcre').get(function() {
    if (!this.fieldSize || this.fieldSize === 0) return 0;
    return (this.yield.actualQuantity || 0) / this.fieldSize;
});

// Calculate crop age in days
FarmerCropSchema.virtual('ageInDays').get(function() {
    const today = new Date();
    const plantingDate = new Date(this.plantingDate);
    const diffTime = Math.abs(today - plantingDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Create indexes for better query performance
FarmerCropSchema.index({ user: 1, createdAt: -1 });
FarmerCropSchema.index({ user: 1, status: 1 });
FarmerCropSchema.index({ user: 1, isActive: 1 });
FarmerCropSchema.index({ plantingDate: 1 });
FarmerCropSchema.index({ expectedHarvestDate: 1 });

module.exports = mongoose.model('FarmerCrop', FarmerCropSchema);