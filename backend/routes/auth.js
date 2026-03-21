import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import {
  users,
  refreshTokens,
  authMiddleware,
  generateAccessToken,
  generateRefreshToken,
  REFRESH_SECRET
} from '../server.js';

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Проверка на существующего пользователя
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    passwordHash,
    role: 'user',
    isBlocked: false,
    createdAt: new Date()
  };
  
  users.push(user);
  
  res.status(201).json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role
  });
});

// Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (user.isBlocked) {
    return res.status(403).json({ error: 'Account is blocked' });
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  refreshTokens.add(refreshToken);
  
  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }
  });
});

// Обновление токенов
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }
  
  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    
    if (!user || user.isBlocked) {
      return res.status(401).json({ error: 'User not found or blocked' });
    }
    
    // Ротация токенов
    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// Получение информации о текущем пользователе
router.get('/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  
  if (!user || user.isBlocked) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role
  });
});

export default router;