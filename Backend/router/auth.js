const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "ShakibisagoodboY@";
const router = express.Router();

// ROUTE 1: Create a user using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, message: 'Validation failed', errors: errors.array() });
    }
    try {
        // Check whether the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ 
                success, 
                message: "An account with this email already exists. Please try logging in or use a different email." 
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user with default profile
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            profile: {
                profilePicture: '',
                location: { state: '', district: '', village: '' },
                farmingType: ['crop_farming'],
                primaryCrops: [],
                experienceLevel: 'beginner',
                farmSize: 0,
                phone: '',
                bio: ''
            },
            preferences: {
                language: 'english',
                notifications: { email: true, sms: false }
            }
        });
        
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        
        res.status(201).json({ 
            success, 
            authtoken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile,
                preferences: user.preferences
            },
            message: "Account created successfully! Welcome to FarmAssist."
        });

    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error occurred while creating account. Please try again later." 
        });
    }
});

// ROUTE 2: Authenticate a user using: POST "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success, 
                message: "Invalid email or password. Please check your credentials." 
            });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ 
                success, 
                message: "Invalid email or password. Please check your credentials." 
            });
        }

        // Update last active timestamp
        await User.findByIdAndUpdate(user.id, { lastActive: Date.now() });

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        
        res.json({ 
            success, 
            authtoken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile,
                preferences: user.preferences
            },
            message: "Login successful! Welcome back."
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error occurred. Please try again later." 
        });
    }
});

// ROUTE 3: Get logged in user Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Update user profile using: PUT "/api/auth/updateprofile". Login required
router.put('/updateprofile', fetchuser, [
    body('name').optional().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('profile.location.state').optional().isLength({ min: 2 }).withMessage('State must be at least 2 characters'),
    body('profile.farmSize').optional().isNumeric().withMessage('Farm size must be a number'),
    body('profile.phone').optional().isMobilePhone().withMessage('Invalid phone number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const userId = req.user.id;
        const updates = {};
        
        // Handle basic fields
        if (req.body.name) updates.name = req.body.name;
        
        // Handle profile fields
        if (req.body.profile) {
            Object.keys(req.body.profile).forEach(key => {
                updates[`profile.${key}`] = req.body.profile[key];
            });
        }
        
        // Handle preferences
        if (req.body.preferences) {
            Object.keys(req.body.preferences).forEach(key => {
                updates[`preferences.${key}`] = req.body.preferences[key];
            });
        }
        
        updates.lastActive = Date.now();
        
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// ROUTE 5: Get user profile details using: GET "/api/auth/profile". Login required
router.get('/profile', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, profile: user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// ROUTE 6: Change password using: PUT "/api/auth/changepassword". Login required
router.put('/changepassword', fetchuser, [
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword', 'New password must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ success: false, error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        await User.findByIdAndUpdate(userId, { 
            password: hashedNewPassword,
            lastActive: Date.now()
        });
        
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
