import express from 'express';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/roles.js';
import { users } from '../server.js';

const router = express.Router();

// Получить всех пользователей (только админ)
router.get('/', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const safeUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt
  }));
  
  res.json(safeUsers);
});

// Получить пользователя по id (только админ)
router.get('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt
  });
});

// Обновить пользователя (только админ)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { first_name, last_name, role, password } = req.body;
  
  if (first_name) users[userIndex].first_name = first_name;
  if (last_name) users[userIndex].last_name = last_name;
  if (role && ['user', 'seller', 'admin'].includes(role)) {
    users[userIndex].role = role;
  }
  if (password) {
    users[userIndex].passwordHash = await bcrypt.hash(password, 10);
  }
  
  res.json({
    id: users[userIndex].id,
    email: users[userIndex].email,
    first_name: users[userIndex].first_name,
    last_name: users[userIndex].last_name,
    role: users[userIndex].role,
    isBlocked: users[userIndex].isBlocked
  });
});

// Заблокировать/разблокировать пользователя (только админ)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Нельзя заблокировать самого себя
  if (users[userIndex].id === req.user.sub) {
    return res.status(403).json({ error: 'Cannot block yourself' });
  }
  
  users[userIndex].isBlocked = true;
  
  res.json({ message: 'User blocked successfully' });
});

export default router;