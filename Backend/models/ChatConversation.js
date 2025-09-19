const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['text', 'image', 'voice', 'voice_response', 'image_analysis'],
        default: 'text'
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
    },
    sources: [{
        problem_id: { type: Number },
        category: { type: String },
        crop: { type: String },
        similarity: { type: Number },
        problem: { type: String },
        solution: { type: String }
    }],
    // For voice messages
    audioUrl: {
        type: String
    },
    transcription: {
        type: mongoose.Schema.Types.Mixed  // Allow both string and object
    },
    // For image messages
    imageUrl: {
        type: String
    },
    imagePath: {
        type: String
    },
    // Additional metadata
    metadata: {
        ragUsed: { type: Boolean, default: false },
        enhanced: { type: Boolean, default: false },
        detectedProblems: [{ type: String }],
        recommendations: [{ type: String }],
        imageAnalysis: {
            type: mongoose.Schema.Types.Mixed
        }
    }
});

const ChatConversationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    language: {
        type: String,
        enum: ['en', 'hi', 'pa', 'ur'],
        default: 'en'
    },
    messages: [MessageSchema],
    lastMessage: {
        type: String,
        maxlength: 50000  // Increased limit for detailed agricultural responses (enhanced chatbot)
    },
    messagesCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Conversation metadata
    tags: [{ type: String }],
    category: {
        type: String,
        enum: ['crop_diseases', 'pest_control', 'soil_issues', 'weather_problems', 
               'irrigation_problems', 'livestock_issues', 'market_economic', 
               'seed_planting', 'general'],
        default: 'general'
    },
    // Analytics
    averageConfidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
    },
    totalResponseTime: {
        type: Number,
        default: 0
    },
    // Privacy and sharing
    isShared: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    }
});

// Indexes for better query performance
ChatConversationSchema.index({ userId: 1, updatedAt: -1 });
ChatConversationSchema.index({ userId: 1, category: 1 });
ChatConversationSchema.index({ userId: 1, language: 1 });
ChatConversationSchema.index({ createdAt: -1 });
ChatConversationSchema.index({ 'messages.timestamp': -1 });

// Virtual for messages count
ChatConversationSchema.virtual('messageCount').get(function() {
    return this.messages.length;
});

// Pre-save middleware to update metadata
ChatConversationSchema.pre('save', function(next) {
    // Update messages count
    this.messagesCount = this.messages.length;
    
    // Update last message
    if (this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1];
        this.lastMessage = lastMessage.content.length > 50000 
            ? lastMessage.content.substring(0, 49997) + '...' 
            : lastMessage.content;
    }
    
    // Calculate average confidence
    const assistantMessages = this.messages.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length > 0) {
        const totalConfidence = assistantMessages.reduce((sum, msg) => sum + (msg.confidence || 0.8), 0);
        this.averageConfidence = totalConfidence / assistantMessages.length;
    }
    
    // Auto-categorize based on message content
    if (this.category === 'general' && this.messages.length > 0) {
        this.category = categorizeProblem(this.messages[0].content);
    }
    
    // Update timestamp
    this.updatedAt = Date.now();
    
    next();
});

// Helper function to categorize problems
function categorizeProblem(message) {
    const categories = {
        'crop_diseases': ['disease', 'infection', 'fungal', 'bacterial', 'virus', 'rot', 'blight', 'wilt'],
        'pest_control': ['pest', 'insect', 'bug', 'aphid', 'caterpillar', 'worm', 'beetle'],
        'soil_issues': ['soil', 'fertility', 'ph', 'acidic', 'alkaline', 'nutrient', 'erosion'],
        'weather_problems': ['weather', 'rain', 'drought', 'flood', 'heat', 'cold', 'frost'],
        'irrigation_problems': ['water', 'irrigation', 'drought', 'watering', 'sprinkler', 'drip'],
        'livestock_issues': ['cattle', 'cow', 'buffalo', 'goat', 'chicken', 'poultry', 'animal'],
        'market_economic': ['price', 'market', 'sell', 'profit', 'cost', 'economic'],
        'seed_planting': ['seed', 'planting', 'germination', 'sowing', 'variety']
    };
    
    const messageLower = message.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => messageLower.includes(keyword))) {
            return category;
        }
    }
    
    return 'general';
}

// Static methods for analytics
ChatConversationSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalConversations: { $sum: 1 },
                totalMessages: { $sum: '$messagesCount' },
                averageConfidence: { $avg: '$averageConfidence' },
                categoryCounts: {
                    $push: '$category'
                },
                languageCounts: {
                    $push: '$language'
                }
            }
        }
    ]);
    
    return stats[0] || {
        totalConversations: 0,
        totalMessages: 0,
        averageConfidence: 0,
        categoryCounts: [],
        languageCounts: []
    };
};

ChatConversationSchema.statics.getRecentConversations = async function(userId, limit = 10) {
    return await this.find({ userId })
        .select('title lastMessage updatedAt category language messagesCount averageConfidence')
        .sort({ updatedAt: -1 })
        .limit(limit);
};

ChatConversationSchema.statics.searchConversations = async function(userId, query, options = {}) {
    const searchRegex = new RegExp(query, 'i');
    
    return await this.find({
        userId,
        $or: [
            { title: searchRegex },
            { lastMessage: searchRegex },
            { 'messages.content': searchRegex }
        ],
        ...options.filters
    })
    .select('title lastMessage updatedAt category language messagesCount')
    .sort({ updatedAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);