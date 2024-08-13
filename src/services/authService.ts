// src/services/authService.ts

import jwt from 'jsonwebtoken';

import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const createUser = async (
  username: string,
  email: string,
  password: string,
): Promise<IUser> => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<string> => {
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  return jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const getUserProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
