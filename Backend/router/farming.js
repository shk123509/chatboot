const express = require('express');
const Crop = require('../models/Crop');
const CropIssue = require('../models/CropIssue');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();

// ROUTE 1: Get all crops with pagination and search
router.get('/crops', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ min: 1 }).withMessage('Search query must not be empty'),
    query('category').optional().isIn(['cereal', 'vegetable', 'fruit', 'pulse', 'oilseed', 'spice', 'cash_crop']).withMessage('Invalid category'),
    query('season').optional().isIn(['kharif', 'rabi', 'zaid', 'perennial']).withMessage('Invalid season')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const category = req.query.category;
        const season = req.query.season;

        // Build query
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'localNames.name': { $regex: search, $options: 'i' } },
                { scientificName: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) query.category = category;
        if (season) query.season = season;

        const crops = await Crop.find(query)
            .populate('commonIssues', 'name type severity')
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Crop.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            crops,
            pagination: {
                currentPage: page,
                totalPages,
                totalCrops: total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// ROUTE 2: Get single crop details
router.get('/crops/:id', async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id)
            .populate({
                path: 'commonIssues',
                select: 'name type severity symptoms preventiveMeasures',
                options: { sort: { severity: -1 } }
            });

        if (!crop) {
            return res.status(404).json({ success: false, error: 'Crop not found' });
        }

        res.json({ success: true, crop });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// ROUTE 3: Search crop issues
router.get('/issues', [
    query('crop').optional().isMongoId().withMessage('Invalid crop ID'),
    query('type').optional().isIn(['disease', 'pest', 'nutrient_deficiency', 'weather_damage', 'soil_issue', 'irrigation_issue']).withMessage('Invalid issue type'),
    query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
    query('search').optional().isLength({ min: 1 }).withMessage('Search query must not be empty'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        if (req.query.crop) query.crop = req.query.crop;
        if (req.query.type) query.type = req.query.type;
        if (req.query.severity) query.severity = req.query.severity;
        
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        const issues = await CropIssue.find(query)
            .populate('crop', 'name localNames category')
            .select('name type severity symptoms preventiveMeasures treatment.organic treatment.chemical images tags')
            .sort(req.query.search ? { score: { $meta: 'textScore' } } : { severity: -1, updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await CropIssue.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            issues,
            pagination: {
                currentPage: page,
                totalPages,
                totalIssues: total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// ROUTE 4: Get single issue details
router.get('/issues/:id', async (req, res) => {
    try {
        const issue = await CropIssue.findById(req.params.id)
            .populate('crop', 'name localNames category scientificName')
            .populate('userReports.user', 'name profile.location');

        if (!issue) {
            return res.status(404).json({ success: false, error: 'Issue not found' });
        }

        res.json({ success: true, issue });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// ROUTE 5: Report issue effectiveness (requires authentication)
router.post('/issues/:id/report', fetchuser, [
    body('effectivenessFeedback').isInt({ min: 1, max: 5 }).withMessage('Effectiveness feedback must be between 1 and 5'),
    body('location').optional().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
    body('additionalNotes').optional().isLength({ max: 500 }).withMessage('Additional notes must be less than 500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const issue = await CropIssue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, error: 'Issue not found' });
        }

        // Check if user already reported on this issue
        const existingReport = issue.userReports.find(report => 
            report.user.toString() === req.user.id
        );

        if (existingReport) {
            return res.status(400).json({ success: false, error: 'You have already reported on this issue' });
        }

        // Add new report
        const newReport = {
            user: req.user.id,
            location: req.body.location || '',
            effectivenessFeedback: req.body.effectivenessFeedback,
            additionalNotes: req.body.additionalNotes || ''
        };

        issue.userReports.push(newReport);
        await issue.save();

        res.json({ success: true, message: 'Report submitted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// ROUTE 6: Get farming advice based on location and season
router.get('/advice', [
    query('state').optional().isLength({ min: 2 }).withMessage('State must be at least 2 characters'),
    query('district').optional().isLength({ min: 2 }).withMessage('District must be at least 2 characters'),
    query('season').optional().isIn(['kharif', 'rabi', 'zaid']).withMessage('Invalid season')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { state, district, season } = req.query;
        
        // Get current season if not provided
        const currentMonth = new Date().getMonth() + 1;
        let currentSeason = season;
        if (!currentSeason) {
            if (currentMonth >= 6 && currentMonth <= 11) currentSeason = 'kharif';
            else if (currentMonth >= 11 || currentMonth <= 4) currentSeason = 'rabi';
            else currentSeason = 'zaid';
        }

        // Build location-based query
        let cropQuery = { season: currentSeason };
        if (state) {
            cropQuery.growingRegions = { $regex: state, $options: 'i' };
        }

        // Get recommended crops for the season and location
        const recommendedCrops = await Crop.find(cropQuery)
            .select('name localNames category cultivation marketPrice')
            .sort({ 'marketPrice.currentPrice': -1 })
            .limit(10);

        // Get common issues for this season
        const seasonalIssues = await CropIssue.find({
            'environmentalFactors.season': { $regex: currentSeason, $options: 'i' }
        })
            .populate('crop', 'name localNames')
            .select('name type severity preventiveMeasures')
            .sort({ severity: -1 })
            .limit(5);

        // Generate seasonal advice
        const seasonalAdvice = {
            currentSeason,
            recommendedCrops,
            commonIssues: seasonalIssues,
            generalTips: getSeasonalTips(currentSeason),
            weatherConsiderations: getWeatherConsiderations(currentSeason)
        };

        res.json({ success: true, advice: seasonalAdvice });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Helper functions
function getSeasonalTips(season) {
    const tips = {
        kharif: [
            'Prepare fields before monsoon arrival',
            'Check drainage systems to prevent waterlogging',
            'Store quality seeds in advance',
            'Plan for pest management during humid conditions'
        ],
        rabi: [
            'Ensure proper irrigation arrangements',
            'Apply balanced fertilizers for winter crops',
            'Protect crops from frost damage',
            'Monitor for aphid and other winter pests'
        ],
        zaid: [
            'Arrange for adequate water supply',
            'Use mulching to conserve moisture',
            'Plant early to avoid extreme heat',
            'Consider heat-resistant crop varieties'
        ]
    };
    return tips[season] || [];
}

function getWeatherConsiderations(season) {
    const considerations = {
        kharif: 'Monitor monsoon patterns and prepare for both excess and deficit rainfall scenarios',
        rabi: 'Watch for frost warnings and ensure cold protection measures are in place',
        zaid: 'Plan irrigation schedule carefully due to high temperatures and water scarcity'
    };
    return considerations[season] || '';
}

module.exports = router;