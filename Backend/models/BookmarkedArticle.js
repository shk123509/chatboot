const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookmarkedArticleSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    urlToImage: {
        type: String
    },
    source: {
        name: String,
        id: String
    },
    author: {
        type: String,
        default: 'Unknown'
    },
    publishedAt: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
        default: 'general'
    },
    tags: [{
        type: String
    }],
    notes: {
        type: String,
        default: ''
    },
    readStatus: {
        type: String,
        enum: ['unread', 'reading', 'completed'],
        default: 'unread'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    bookmarkedAt: {
        type: Date,
        default: Date.now
    },
    readingTime: {
        type: Number, // in seconds
        default: 0
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index for user and url to prevent duplicate bookmarks
BookmarkedArticleSchema.index({ user: 1, url: 1 }, { unique: true });

// Create index for efficient querying
BookmarkedArticleSchema.index({ user: 1, bookmarkedAt: -1 });
BookmarkedArticleSchema.index({ user: 1, category: 1 });
BookmarkedArticleSchema.index({ user: 1, readStatus: 1 });

module.exports = mongoose.model('BookmarkedArticle', BookmarkedArticleSchema);
