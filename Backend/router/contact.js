const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { body, validationResult } = require('express-validator');

// POST /api/contact - Submit contact form
router.post('/', [
    body('phone')
        .optional()
        .isLength({ max: 20 })
        .withMessage('Phone number must not exceed 20 characters')
        .trim(),
    body('category')
        .optional()
        .isIn(['general', 'technical', 'farming', 'feedback', 'partnership'])
        .withMessage('Invalid category'),
    body('name')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .trim(),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('subject')
        .isLength({ min: 5, max: 100 })
        .withMessage('Subject must be between 5 and 100 characters')
        .trim(),
    body('message')
        .isLength({ min: 20, max: 1000 })
        .withMessage('Message must be between 20 and 1000 characters')
        .trim()
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, phone, subject, message, category } = req.body;

        // Check for spam (simple rate limiting)
        const recentMessages = await Contact.countDocuments({
            email: email,
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
        });

        if (recentMessages >= 3) {
            return res.status(429).json({
                success: false,
                message: 'Too many messages sent recently. Please try again later.'
            });
        }

        // Create new contact message
        const contactMessage = new Contact({
            name,
            email,
            phone: phone || null,
            subject,
            message,
            category: category || 'general'
        });

        await contactMessage.save();

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.',
            data: {
                id: contactMessage._id,
                createdAt: contactMessage.createdAt
            }
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// GET /api/contact/messages - Get all contact messages (admin only)
router.get('/messages', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (status && ['new', 'replied', 'closed'].includes(status)) {
            query.status = status;
        }

        const messages = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMessages = await Contact.countDocuments(query);
        const totalPages = Math.ceil(totalMessages / limit);

        // Get statistics
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalMessages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                stats
            }
        });

    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/contact/messages/:id/status - Update message status
router.put('/messages/:id/status', [
    body('status')
        .isIn(['new', 'replied', 'closed'])
        .withMessage('Status must be new, replied, or closed'),
    body('adminReply')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Reply must not exceed 1000 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { status, adminReply } = req.body;
        const updateData = { status };

        if (status === 'replied' && adminReply) {
            updateData.adminReply = adminReply;
            updateData.repliedAt = new Date();
        }

        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message status updated successfully',
            data: message
        });

    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// DELETE /api/contact/messages/:id - Delete message
router.delete('/messages/:id', async (req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
