import express from 'express';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/roles.js';
import { products } from '../server.js';

const router = express.Router();

// Создать товар (продавец и админ)
router.post('/', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { title, category, description, price } = req.body;
  
  if (!title || !category || !description || !price) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const product = {
    id: nanoid(),
    title,
    category,
    description,
    price: Number(price),
    createdAt: new Date()
  };
  
  products.push(product);
  
  res.status(201).json(product);
});

// Получить список товаров (пользователь)
router.get('/', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  res.json(products);
});

// Получить товар по id (пользователь)
router.get('/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Обновить товар (продавец и админ)
router.put('/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const { title, category, description, price } = req.body;
  
  if (title) products[productIndex].title = title;
  if (category) products[productIndex].category = category;
  if (description) products[productIndex].description = description;
  if (price) products[productIndex].price = Number(price);
  
  res.json(products[productIndex]);
});

// Удалить товар (только админ)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  
  res.json({ message: 'Product deleted successfully' });
});

export default router;