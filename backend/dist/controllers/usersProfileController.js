"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const User_1 = require("../models/User");
// GET /api/users/profile
async function getProfile(req, res) {
    const userId = req.user?.userId;
    const user = await User_1.User.findById(userId).select('-password').lean();
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, data: user });
}
// PUT /api/users/profile
async function updateProfile(req, res) {
    const userId = req.user?.userId;
    const { firstName, lastName, phone } = req.body || {};
    const user = await User_1.User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (firstName)
        user.firstName = firstName;
    if (lastName)
        user.lastName = lastName;
    if (phone !== undefined)
        user.phone = phone;
    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;
    return res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
    });
}
