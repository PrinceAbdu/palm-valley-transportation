import type { Request, Response } from 'express';
import { User } from '../models/User';

// GET /api/users/profile
export async function getProfile(req: Request, res: Response) {
  const userId = req.user?.userId;

  const user = await User.findById(userId).select('-password').lean();
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.json({ success: true, data: user });
}

// PUT /api/users/profile
export async function updateProfile(req: Request, res: Response) {
  const userId = req.user?.userId;
  const { firstName, lastName, phone } = req.body || {};

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  const updatedUser: any = user.toObject();
  delete updatedUser.password;

  return res.json({
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully'
  });
}

