"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
exports.authRoutes = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(5),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
// POST /api/auth/register
exports.authRoutes.post('/auth/register', async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const exists = await User_1.User.findOne({ email: data.email.toLowerCase() });
        if (exists) {
            return res.status(409).json({ success: false, error: 'Email already in use' });
        }
        const user = await User_1.User.create({
            email: data.email.toLowerCase(),
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: 'rider',
        });
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        return res.status(201).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors[0]?.message || 'Validation error' });
        }
        console.error('Register error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Registration failed' });
    }
});
// POST /api/auth/login
exports.authRoutes.post('/auth/login', async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await User_1.User.findOne({ email: data.email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        const ok = await user.comparePassword(data.password);
        if (!ok) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, error: 'Account is deactivated. Please contact support.' });
        }
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        return res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors[0]?.message || 'Validation error' });
        }
        console.error('Login error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Login failed' });
    }
});
// POST /api/auth/google
exports.authRoutes.post('/auth/google', async (req, res) => {
    try {
        const { idToken, email, name, picture } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, error: 'ID token is required' });
        }
        // Verify token with Google
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + idToken);
        const tokenInfo = await googleResponse.json();
        if (!tokenInfo.email) {
            return res.status(401).json({ success: false, error: 'Invalid Google token' });
        }
        let user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            const [firstName, ...lastNameParts] = name.split(' ');
            const lastName = lastNameParts.join(' ') || '';
            user = await User_1.User.create({
                firstName,
                lastName,
                email: email.toLowerCase(),
                password: Math.random().toString(36).slice(-15),
                role: 'rider',
                isActive: true,
                profilePicture: picture,
                oauthProvider: 'google',
                oauthId: tokenInfo.sub,
            });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, error: 'Account is deactivated. Please contact support.' });
        }
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        return res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error('Google login error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Google login failed' });
    }
});
// POST /api/auth/logout
exports.authRoutes.post('/auth/logout', (_req, res) => {
    return res.json({ success: true, message: 'Logged out successfully' });
});
// POST /api/auth/refresh
exports.authRoutes.post('/auth/refresh', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, error: 'Token is required' });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }
        const newToken = (0, jwt_1.generateToken)({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        });
        return res.json({ success: true, data: { token: newToken } });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        return res.status(500).json({ success: false, error: 'Failed to refresh token' });
    }
});
// POST /api/auth/forgot-password
exports.authRoutes.post('/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive password reset instructions.',
            });
        }
        const resetToken = (0, jwt_1.generateResetToken)(user._id.toString());
        const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        console.log(`Password reset link for ${email}: ${resetUrl}`);
        return res.json({
            success: true,
            message: 'If an account exists with this email, you will receive password reset instructions.',
            devResetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ success: false, error: 'Failed to process request' });
    }
});
// POST /api/auth/reset-password
exports.authRoutes.post('/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, error: 'Token and new password are required' });
        }
        const decoded = (0, jwt_1.verifyResetToken)(token);
        if (!decoded) {
            return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
        }
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        user.password = newPassword;
        await user.save();
        return res.json({ success: true, message: 'Password has been reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
});
