"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const usersProfileController_1 = require("../controllers/usersProfileController");
exports.userRoutes = (0, express_1.Router)();
exports.userRoutes.get('/users/profile', auth_1.requireAuth, usersProfileController_1.getProfile);
exports.userRoutes.put('/users/profile', auth_1.requireAuth, usersProfileController_1.updateProfile);
