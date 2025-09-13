const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'audio', 'location', 'crop_analysis', 'weather_info'],
    default: 'text'
  },
  metadata: {
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    modelUsed: { type: String, default: '' }, // GPT-4, BERT, Custom Model, etc.
    processingTime: { type: Number, default: 0 }, // in milliseconds
    intent: { type: String, default: '' }, // crop_disease, weather_query, farming_advice, etc.
    entities: [{
      entity: { type: String },
      value: { type: String },
      confidence: { type: Number, min: 0, max: 1 }
    }],
    relatedCropIssue: { type: Schema.Types.ObjectId, ref: 'CropIssue' },
    relatedCrop: { type: Schema.Types.ObjectId, ref: 'Crop' }
  },
  attachments: [{
    type: { type: String, enum: ['image', 'document', 'audio'], required: true },
    url: { type: String, required: true },
    filename: { type: String, default: '' },
    size: { type: Number, default: 0 }, // in bytes
    analysisResult: {
      cropDetected: { type: String, default: '' },
      issueDetected: { type: String, default: '' },
      confidence: { type: Number, min: 0, max: 1, default: 0 },
      recommendations: [{ type: String }]
    }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  edited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    originalMessage: { type: String },
    editedAt: { type: Date, default: Date.now }
  }]
});

const ChatSessionSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [MessageSchema],
  context: {
    currentCrop: { type: String, default: '' },
    currentIssue: { type: String, default: '' },
    userLocation: {
      state: { type: String, default: '' },
      district: { type: String, default: '' }
    },
    seasonContext: { type: String, default: '' },
    previousTopics: [{ type: String }],
    userPreferences: {
      language: { type: String, default: 'english' },
      responseStyle: { type: String, enum: ['detailed', 'brief', 'step_by_step'], default: 'detailed' }
    }
  },
  analytics: {
    totalMessages: { type: Number, default: 0 },
    userMessages: { type: Number, default: 0 },
    botMessages: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // in milliseconds
    satisfactionRating: { type: Number, min: 1, max: 5, default: 0 },
    issuesResolved: { type: Number, default: 0 },
    topicsDiscussed: [{ type: String }]
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'pending', 'archived'],
    default: 'active'
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' },
    helpful: { type: Boolean, default: true },
    suggestions: { type: String, default: '' }
  },
  tags: [{ type: String }], // for categorization and search
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }
});

// Update analytics before saving
ChatSessionSchema.pre('save', function(next) {
  this.lastActivity = Date.now();
  this.analytics.totalMessages = this.messages.length;
  this.analytics.userMessages = this.messages.filter(msg => msg.sender === 'user').length;
  this.analytics.botMessages = this.messages.filter(msg => msg.sender === 'bot').length;
  
  // Update topics discussed
  const topics = this.messages
    .filter(msg => msg.metadata.intent)
    .map(msg => msg.metadata.intent);
  this.analytics.topicsDiscussed = [...new Set(topics)];
  
  // Generate title if not set
  if (this.title === 'New Conversation' && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
      this.title = firstUserMessage.message.substring(0, 50) + (firstUserMessage.message.length > 50 ? '...' : '');
    }
  }
  
  next();
});

// Index for better performance
ChatSessionSchema.index({ user: 1, lastActivity: -1 });
ChatSessionSchema.index({ sessionId: 1 });
ChatSessionSchema.index({ status: 1 });
ChatSessionSchema.index({ 'messages.timestamp': -1 });

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);
module.exports = ChatSession;