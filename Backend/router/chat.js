const express = require('express');
const { body, validationResult } = require('express-validator');
const ChatSession = require('../models/Chat');
const fetchuser = require('../middleware/fetchuser');
const { v4: uuidv4 } = require('uuid');
const EnhancedResponseGenerator = require('../utils/enhancedResponseGenerator');

const router = express.Router();

// Initialize Enhanced Response Generator
const enhancedGenerator = new EnhancedResponseGenerator();

// Create a new chat session
router.post('/session', fetchuser, async (req, res) => {
  try {
    const session = await ChatSession.create({
      user: req.user.id,
      sessionId: uuidv4(),
      context: {
        userPreferences: { language: 'english', responseStyle: 'detailed' }
      }
    });
    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// List user chat sessions
router.get('/sessions', fetchuser, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user.id })
      .sort({ lastActivity: -1 })
      .select('sessionId title status startedAt lastActivity');
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Get a chat session by sessionId
router.get('/session/:sessionId', fetchuser, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      user: req.user.id,
      sessionId: req.params.sessionId
    });
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Post a user message and get a bot reply (stubbed LLM/ML)
router.post('/message', [
  body('sessionId').isString().withMessage('sessionId is required'),
  body('message').isString().isLength({ min: 1 }).withMessage('message is required')
], fetchuser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { sessionId, message } = req.body;

    const session = await ChatSession.findOne({ user: req.user.id, sessionId });
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    // Save user message
    session.messages.push({ sender: 'user', message });

    // Very simple rule-based reply as a placeholder for ML/LLM
    const reply = generateFarmingReply(message);

    // Save bot reply
    session.messages.push({
      sender: 'bot',
      message: reply.text,
      metadata: {
        intent: reply.intent,
        confidence: reply.confidence,
        modelUsed: 'rule-based-stub'
      }
    });

    await session.save();

    res.json({ success: true, reply: reply.text });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

function generateFarmingReply(userText) {
  try {
    // Use enhanced response generator for comprehensive farming advice
    const enhancedResponse = enhancedGenerator.generateDetailedResponse(userText, [], 'en');
    
    // Extract intent and confidence from the response structure
    const intent = 'comprehensive_farming_advice';
    const confidence = enhancedResponse.confidence || 0.8;
    
    return {
      intent: intent,
      confidence: confidence,
      text: enhancedResponse.content
    };
  } catch (error) {
    console.error('Enhanced generator error:', error);
    
    // Fallback to simple response if enhanced generator fails
    const text = userText.toLowerCase();
    
    // Basic fallback responses
    if (/(wheat|gahum|gehu|gehun)/.test(text) && /(yellow|rust|leaf|spots|disease)/.test(text)) {
      return {
        intent: 'crop_disease',
        confidence: 0.6,
        text: 'It sounds like wheat (gahuṁ) may have yellow rust. Check for yellow/orange powdery pustules on leaves. Early treatment: spray propiconazole 25 EC @ 1 ml/litre or tebuconazole 25 EC @ 1 ml/litre. Prefer morning/evening spray, avoid hot hours. Maintain field sanitation and resistant varieties.'
      };
    }
    
    if (/irrigation|water|watering/.test(text) && /(wheat|gahum|gehu)/.test(text)) {
      return {
        intent: 'irrigation_advice',
        confidence: 0.5,
        text: 'For wheat, critical irrigations are at crown root initiation (20–25 days), late tillering (40–45 days), booting (60–65 days) and grain filling (80–85 days). Avoid waterlogging; maintain light, frequent irrigation depending on soil type.'
      };
    }
    
    if (/fertilizer|urea|dap|npk/.test(text) && /(wheat|gahum|gehu)/.test(text)) {
      return {
        intent: 'fertilizer_advice',
        confidence: 0.5,
        text: 'General wheat fertilizer plan (may vary by soil test): 120:60:40 N:P:K kg/ha. Apply full P and K at sowing; split N as 50% at sowing, 25% at CRI, 25% at tillering. Use soil test for precision.'
      };
    }
    
    // Default fallback
    return {
      intent: 'general_help',
      confidence: 0.3,
      text: 'Please describe your crop, stage and problem (e.g., wheat leaves yellow with brown spots). I will suggest probable causes and remedies.'
    };
  }
}

module.exports = router;
