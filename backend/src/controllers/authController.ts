import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(5)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const exists = await User.findOne({ email: data.email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ success: false, error: 'Email already in use' });
  }

  const user = await User.create({
    email: data.email.toLowerCase(),
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: 'rider'
  });

  const token = generateToken({
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

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const ok = await (user as any).comparePassword(data.password);
  if (!ok) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res
      .status(403)
      .json({ success: false, error: 'Account is deactivated. Please contact support.' });
  }

  const token = generateToken({
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

