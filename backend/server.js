import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Конфигурация токенов
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access_secret_key_2025';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_key_2025';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Хранилища данных (имитация БД)
let users = [];
let products = [];
let refreshTokens = new Set();

// Инициализация тестовых данных
async function initTestData() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  users.push({
    id: nanoid(),
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    passwordHash: hashedPassword,
    role: 'admin',
    isBlocked: false,
    createdAt: new Date()
  });
  
  users.push({
    id: nanoid(),
    email: 'seller@example.com',
    first_name: 'Seller',
    last_name: 'User',
    passwordHash: await bcrypt.hash('seller123', 10),
    role: 'seller',
    isBlocked: false,
    createdAt: new Date()
  });
  
  users.push({
    id: nanoid(),
    email: 'user@example.com',
    first_name: 'Regular',
    last_name: 'User',
    passwordHash: await bcrypt.hash('user123', 10),
    role: 'user',
    isBlocked: false,
    createdAt: new Date()
  });
  
  // Добавляем тестовые товары
  products.push(
    {
      id: nanoid(),
      title: 'Ноутбук Apple MacBook Pro',
      category: 'Электроника',
      description: 'Мощный ноутбук для работы и творчества',
      price: 129990,
      createdAt: new Date()
    },
    {
      id: nanoid(),
      title: 'Смартфон Samsung Galaxy S24',
      category: 'Электроника',
      description: 'Флагманский смартфон с AI функциями',
      price: 89990,
      createdAt: new Date()
    },
    {
      id: nanoid(),
      title: 'Беспроводные наушники Sony WH-1000XM5',
      category: 'Аудио',
      description: 'Лучшие наушники с шумоподавлением',
      price: 34990,
      createdAt: new Date()
    }
  );
}

// Генерация токенов
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// Middleware аутентификации
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Импорт маршрутов
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';

// Использование маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Экспорт для использования в маршрутах
export {
  users,
  products,
  refreshTokens,
  authMiddleware,
  generateAccessToken,
  generateRefreshToken,
  ACCESS_SECRET,
  REFRESH_SECRET
};

// Запуск сервера
initTestData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📝 Тестовые пользователи:`);
    console.log(`   Админ: admin@example.com / admin123`);
    console.log(`   Продавец: seller@example.com / seller123`);
    console.log(`   Пользователь: user@example.com / user123`);
  });
});