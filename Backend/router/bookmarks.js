const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const BookmarkedArticle = require('../models/BookmarkedArticle');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// ROUTE 1: Get all bookmarked articles: GET "/api/bookmarks/all". Login required
router.get('/all', fetchuser, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const readStatus = req.query.readStatus;
        const sortBy = req.query.sortBy || 'bookmarkedAt';
        const sortOrder = req.query.sortOrder || 'desc';

        // Build query
        const query = { user: req.user.id };
        if (category && category !== 'all') {
            query.category = category;
        }
        if (readStatus && readStatus !== 'all') {
            query.readStatus = readStatus;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;

        const bookmarks = await BookmarkedArticle.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalBookmarks = await BookmarkedArticle.countDocuments(query);
        const totalPages = Math.ceil(totalBookmarks / limit);

        res.json({
            bookmarks,
            pagination: {
                currentPage: page,
                totalPages,
                totalBookmarks,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Add article to bookmarks: POST "/api/bookmarks/add". Login required
router.post('/add', fetchuser, [
    body('title', 'Title is required').notEmpty(),
    body('description', 'Description is required').notEmpty(),
    body('url', 'URL is required').isURL(),
    body('publishedAt', 'Published date is required').isISO8601()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            description,
            url,
            urlToImage,
            source,
            author,
            publishedAt,
            category,
            tags,
            notes,
            priority
        } = req.body;

        // Check if article is already bookmarked by this user
        const existingBookmark = await BookmarkedArticle.findOne({
            user: req.user.id,
            url: url
        });

        if (existingBookmark) {
            return res.status(400).json({ error: "Article already bookmarked" });
        }

        const bookmark = new BookmarkedArticle({
            user: req.user.id,
            title,
            description,
            url,
            urlToImage,
            source,
            author: author || 'Unknown',
            publishedAt,
            category: category || 'general',
            tags: tags || [],
            notes: notes || '',
            priority: priority || 'medium'
        });

        const savedBookmark = await bookmark.save();
        res.json(savedBookmark);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Article already bookmarked" });
        }
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Remove bookmark: DELETE "/api/bookmarks/remove/:id". Login required
router.delete('/remove/:id', fetchuser, async (req, res) => {
    try {
        const bookmark = await BookmarkedArticle.findById(req.params.id);
        
        if (!bookmark) {
            return res.status(404).json({ error: "Bookmark not found" });
        }

        // Check if user owns this bookmark
        if (bookmark.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Not authorized" });
        }

        await BookmarkedArticle.findByIdAndDelete(req.params.id);
        res.json({ message: "Bookmark removed successfully" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Update bookmark: PUT "/api/bookmarks/update/:id". Login required
router.put('/update/:id', fetchuser, async (req, res) => {
    try {
        const { notes, readStatus, priority, tags } = req.body;
        
        const bookmark = await BookmarkedArticle.findById(req.params.id);
        
        if (!bookmark) {
            return res.status(404).json({ error: "Bookmark not found" });
        }

        // Check if user owns this bookmark
        if (bookmark.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Not authorized" });
        }

        const updateData = {};
        if (notes !== undefined) updateData.notes = notes;
        if (readStatus !== undefined) updateData.readStatus = readStatus;
        if (priority !== undefined) updateData.priority = priority;
        if (tags !== undefined) updateData.tags = tags;
        updateData.lastAccessedAt = Date.now();

        const updatedBookmark = await BookmarkedArticle.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(updatedBookmark);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 5: Get bookmark statistics: GET "/api/bookmarks/stats". Login required
router.get('/stats', fetchuser, async (req, res) => {
    try {
        const totalBookmarks = await BookmarkedArticle.countDocuments({ user: req.user.id });
        
        const categoryStats = await BookmarkedArticle.aggregate([
            { $match: { user: req.user.id } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const readStatusStats = await BookmarkedArticle.aggregate([
            { $match: { user: req.user.id } },
            { $group: { _id: '$readStatus', count: { $sum: 1 } } }
        ]);

        const priorityStats = await BookmarkedArticle.aggregate([
            { $match: { user: req.user.id } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        const recentBookmarks = await BookmarkedArticle.find({ user: req.user.id })
            .sort({ bookmarkedAt: -1 })
            .limit(5)
            .select('title bookmarkedAt category');

        res.json({
            totalBookmarks,
            categoryStats,
            readStatusStats,
            priorityStats,
            recentBookmarks
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 6: Check if article is bookmarked: GET "/api/bookmarks/check". Login required
router.get('/check', fetchuser, async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: "URL parameter is required" });
        }

        const bookmark = await BookmarkedArticle.findOne({
            user: req.user.id,
            url: url
        });

        res.json({ 
            isBookmarked: !!bookmark,
            bookmarkId: bookmark ? bookmark._id : null
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 7: Update reading time: PUT "/api/bookmarks/reading-time/:id". Login required
router.put('/reading-time/:id', fetchuser, async (req, res) => {
    try {
        const { readingTime } = req.body;
        
        if (readingTime === undefined || readingTime < 0) {
            return res.status(400).json({ error: "Valid reading time is required" });
        }

        const bookmark = await BookmarkedArticle.findById(req.params.id);
        
        if (!bookmark) {
            return res.status(404).json({ error: "Bookmark not found" });
        }

        if (bookmark.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Not authorized" });
        }

        bookmark.readingTime += readingTime;
        bookmark.lastAccessedAt = Date.now();
        await bookmark.save();

        res.json({ readingTime: bookmark.readingTime });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
