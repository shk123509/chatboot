const mongoose = require('mongoose');

const FarmingProblemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmerCrop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmerCrop'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['pest', 'disease', 'nutrient_deficiency', 'weather_damage', 'soil_issue', 'irrigation', 'equipment', 'other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    affectedArea: {
        type: Number, // in percentage or area
        min: 0,
        max: 100
    },
    symptoms: [{
        type: String,
        trim: true
    }],
    causes: [{
        type: String,
        trim: true
    }],
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: String,
        dateTaken: {
            type: Date,
            default: Date.now
        }
    }],
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
    weatherConditions: {
        temperature: Number,
        humidity: Number,
        rainfall: Number,
        windSpeed: Number,
        dateRecorded: {
            type: Date,
            default: Date.now
        }
    },
    solutions: [{
        method: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['chemical', 'organic', 'biological', 'cultural', 'mechanical'],
            required: true
        },
        materials: [{
            name: String,
            quantity: String,
            cost: Number
        }],
        steps: [{
            step: Number,
            instruction: String,
            estimatedTime: String
        }],
        effectiveness: {
            type: Number,
            min: 1,
            max: 5 // 1-5 star rating
        },
        appliedDate: Date,
        results: String,
        sideEffects: String,
        cost: {
            type: Number,
            min: 0
        },
        providedBy: {
            type: String,
            enum: ['ai', 'expert', 'community', 'self'],
            default: 'ai'
        }
    }],
    expertAdvice: [{
        expert: {
            name: String,
            title: String,
            organization: String,
            contact: String
        },
        advice: {
            type: String,
            required: true,
            trim: true
        },
        dateProvided: {
            type: Date,
            default: Date.now
        },
        followUpRequired: {
            type: Boolean,
            default: false
        },
        followUpDate: Date
    }],
    communityResponses: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        response: {
            type: String,
            required: true,
            trim: true
        },
        helpful: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            vote: {
                type: String,
                enum: ['up', 'down']
            }
        }],
        datePosted: {
            type: Date,
            default: Date.now
        }
    }],
    relatedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmingProblem'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    estimatedLoss: {
        type: Number,
        min: 0 // monetary value
    },
    actualLoss: {
        type: Number,
        min: 0
    },
    preventionMeasures: [{
        type: String,
        trim: true
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
            enum: ['observation', 'action_taken', 'result', 'follow_up'],
            default: 'observation'
        }
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    reportedDate: {
        type: Date,
        default: Date.now
    },
    resolvedDate: Date,
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
FarmingProblemSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Set resolved date when status changes to resolved
    if (this.isModified('status') && this.status === 'resolved' && !this.resolvedDate) {
        this.resolvedDate = new Date();
    }
    
    next();
});

// Virtual for days since reported
FarmingProblemSchema.virtual('daysOpen').get(function() {
    const today = new Date();
    const reportedDate = new Date(this.reportedDate);
    const diffTime = Math.abs(today - reportedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time
FarmingProblemSchema.virtual('resolutionTime').get(function() {
    if (!this.resolvedDate) return null;
    
    const reportedDate = new Date(this.reportedDate);
    const resolvedDate = new Date(this.resolvedDate);
    const diffTime = Math.abs(resolvedDate - reportedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for community engagement score
FarmingProblemSchema.virtual('engagementScore').get(function() {
    const responses = this.communityResponses.length;
    const totalVotes = this.communityResponses.reduce((total, response) => {
        return total + response.helpful.length;
    }, 0);
    
    return responses + (totalVotes * 0.5);
});

// Create indexes for better query performance
FarmingProblemSchema.index({ user: 1, createdAt: -1 });
FarmingProblemSchema.index({ user: 1, status: 1 });
FarmingProblemSchema.index({ category: 1 });
FarmingProblemSchema.index({ severity: 1 });
FarmingProblemSchema.index({ status: 1 });
FarmingProblemSchema.index({ tags: 1 });
FarmingProblemSchema.index({ isPublic: 1 });
FarmingProblemSchema.index({ reportedDate: -1 });

module.exports = mongoose.model('FarmingProblem', FarmingProblemSchema);