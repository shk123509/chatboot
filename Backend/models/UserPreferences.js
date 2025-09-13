const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserPreferencesSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    preferredCategories: [{
        type: String,
        enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
        default: ['general']
    }],
    preferredCountry: {
        type: String,
        default: 'in',
        enum: ['us', 'in', 'gb', 'ca', 'au', 'fr', 'de', 'jp', 'cn', 'br']
    },
    preferredSources: [{
        name: String,
        url: String,
        enabled: {
            type: Boolean,
            default: true
        }
    }],
    notificationSettings: {
        breakingNews: {
            type: Boolean,
            default: true
        },
        dailyDigest: {
            type: Boolean,
            default: false
        },
        weeklySummary: {
            type: Boolean,
            default: false
        },
        categoryAlerts: [{
            category: String,
            enabled: Boolean
        }]
    },
    readingPreferences: {
        articlesPerPage: {
            type: Number,
            default: 10,
            min: 5,
            max: 50
        },
        autoRefresh: {
            type: Boolean,
            default: false
        },
        refreshInterval: {
            type: Number,
            default: 300, // 5 minutes in seconds
            min: 60,
            max: 3600
        },
        darkMode: {
            type: Boolean,
            default: false
        }
    },
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar']
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
UserPreferencesSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('UserPreferences', UserPreferencesSchema);
