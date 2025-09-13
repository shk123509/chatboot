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

// ROUTE 7: Request password reset using: POST "/api/auth/forgot-password". No login required
router.post('/forgot-password', [
    body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, message: 'Please enter a valid email address', errors: errors.array() });
    }
    
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success, message: 'No account found with this email address' });
        }
        
        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store verification code temporarily (in production, use Redis or database)
        // For now, we'll store it in memory (not recommended for production)
        global.resetCodes = global.resetCodes || {};
        global.resetCodes[email] = {
            code: verificationCode,
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            userId: user.id
        };
        
        // In production, send email with verification code
        // For development, we'll log it to console
        console.log(`🔑 Password reset code for ${email}: ${verificationCode}`);
        
        success = true;
        res.json({ 
            success, 
            message: 'Password reset code sent to your email',
            // In development, include the code for testing
            devCode: verificationCode // Always show for testing
        });
        
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ success: false, message: 'Server error occurred. Please try again later.' });
    }
});

// ROUTE 8: Verify reset code using: POST "/api/auth/verify-reset-code". No login required
router.post('/verify-reset-code', [
    body('email', 'Enter a valid email').isEmail(),
    body('code', 'Enter verification code').isLength({ min: 6, max: 6 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, message: 'Invalid input', errors: errors.array() });
    }
    
    try {
        const { email, code } = req.body;
        
        // Check if reset code exists and is valid
        global.resetCodes = global.resetCodes || {};
        const resetData = global.resetCodes[email];
        
        if (!resetData) {
            return res.status(400).json({ success, message: 'No reset request found for this email' });
        }
        
        if (resetData.expires < Date.now()) {
            delete global.resetCodes[email];
            return res.status(400).json({ success, message: 'Verification code has expired. Please request a new one.' });
        }
        
        if (resetData.code !== code) {
            return res.status(400).json({ success, message: 'Invalid verification code' });
        }
        
        success = true;
        res.json({ success, message: 'Verification code confirmed' });
        
    } catch (error) {
        console.error('Verify reset code error:', error.message);
        res.status(500).json({ success: false, message: 'Server error occurred. Please try again later.' });
    }
});

// ROUTE 9: Reset password using: POST "/api/auth/reset-password". No login required
router.post('/reset-password', [
    body('email', 'Enter a valid email').isEmail(),
    body('code', 'Enter verification code').isLength({ min: 6, max: 6 }),
    body('newPassword', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, message: 'Invalid input', errors: errors.array() });
    }
    
    try {
        const { email, code, newPassword } = req.body;
        
        // Verify reset code again
        global.resetCodes = global.resetCodes || {};
        const resetData = global.resetCodes[email];
        
        if (!resetData || resetData.code !== code || resetData.expires < Date.now()) {
            return res.status(400).json({ success, message: 'Invalid or expired verification code' });
        }
        
        // Find user and update password
        const user = await User.findById(resetData.userId);
        if (!user) {
            return res.status(404).json({ success, message: 'User not found' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update user's password
        await User.findByIdAndUpdate(user.id, {
            password: hashedPassword,
            lastActive: Date.now()
        });
        
        // Clear the reset code
        delete global.resetCodes[email];
        
        success = true;
        res.json({ success, message: 'Password has been reset successfully' });
        
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ success: false, message: 'Server error occurred. Please try again later.' });
    }
});

module.exports = router;
