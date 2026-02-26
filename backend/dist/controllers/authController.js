"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const zod_1 = require("zod");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(5)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
async function register(req, res) {
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
        role: 'rider'
    });
    const token = (0, jwt_1.generateToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
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
                role: user.role
            },
            token
        }
    });
}
async function login(req, res) {
    const data = loginSchema.parse(req.body);
    const user = await User_1.User.findOne({ email: data.email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const ok = await user.comparePassword(data.password);
    if (!ok) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (!user.isActive) {
        return res
            .status(403)
            .json({ success: false, error: 'Account is deactivated. Please contact support.' });
    }
    const token = (0, jwt_1.generateToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
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
                role: user.role
            },
            token
        }
    });
}
