const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const UserPreferences = require('../models/UserPreferences');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// ROUTE 1: Get user preferences: GET "/api/preferences/get". Login required
router.get('/get', fetchuser, async (req, res) => {
    try {
        let preferences = await UserPreferences.findOne({ user: req.user.id });
        
        // If no preferences exist, create default preferences
        if (!preferences) {
            preferences = new UserPreferences({
                user: req.user.id,
                preferredCategories: ['general'],
                preferredCountry: 'in'
            });
            await preferences.save();
        }
        
        res.json(preferences);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Update user preferences: PUT "/api/preferences/update". Login required
router.put('/update', fetchuser, [
    body('preferredCategories').optional().isArray(),
    body('preferredCountry').optional().isIn(['us', 'in', 'gb', 'ca', 'au', 'fr', 'de', 'jp', 'cn', 'br']),
    body('language').optional().isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            preferredCategories,
            preferredCountry,
            preferredSources,
            notificationSettings,
            readingPreferences,
            language
        } = req.body;

        // Build update object
        const updateData = {};
        if (preferredCategories !== undefined) updateData.preferredCategories = preferredCategories;
        if (preferredCountry !== undefined) updateData.preferredCountry = preferredCountry;
        if (preferredSources !== undefined) updateData.preferredSources = preferredSources;
        if (notificationSettings !== undefined) updateData.notificationSettings = notificationSettings;
        if (readingPreferences !== undefined) updateData.readingPreferences = readingPreferences;
        if (language !== undefined) updateData.language = language;
        
        updateData.updatedAt = Date.now();

        let preferences = await UserPreferences.findOneAndUpdate(
            { user: req.user.id },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.json(preferences);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Reset preferences to default: POST "/api/preferences/reset". Login required
router.post('/reset', fetchuser, async (req, res) => {
    try {
        const defaultPreferences = {
            user: req.user.id,
            preferredCategories: ['general'],
            preferredCountry: 'in',
            preferredSources: [],
            notificationSettings: {
                breakingNews: true,
                dailyDigest: false,
                weeklySummary: false,
                categoryAlerts: []
            },
            readingPreferences: {
                articlesPerPage: 10,
                autoRefresh: false,
                refreshInterval: 300,
                darkMode: false
            },
            language: 'en',
            updatedAt: Date.now()
        };

        const preferences = await UserPreferences.findOneAndUpdate(
            { user: req.user.id },
            { $set: defaultPreferences },
            { new: true, upsert: true }
        );

        res.json(preferences);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Update notification settings: PUT "/api/preferences/notifications". Login required
router.put('/notifications', fetchuser, async (req, res) => {
    try {
        const { notificationSettings } = req.body;

        if (!notificationSettings) {
            return res.status(400).json({ error: "Notification settings are required" });
        }

        const preferences = await UserPreferences.findOneAndUpdate(
            { user: req.user.id },
            { 
                $set: { 
                    notificationSettings: notificationSettings,
                    updatedAt: Date.now()
                }
            },
            { new: true, upsert: true }
        );

        res.json({ notificationSettings: preferences.notificationSettings });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 5: Update reading preferences: PUT "/api/preferences/reading". Login required
router.put('/reading', fetchuser, async (req, res) => {
    try {
        const { readingPreferences } = req.body;

        if (!readingPreferences) {
            return res.status(400).json({ error: "Reading preferences are required" });
        }

        const preferences = await UserPreferences.findOneAndUpdate(
            { user: req.user.id },
            { 
                $set: { 
                    readingPreferences: readingPreferences,
                    updatedAt: Date.now()
                }
            },
            { new: true, upsert: true }
        );

        res.json({ readingPreferences: preferences.readingPreferences });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
