// Импорт Express
const express = require('express');
const app = express();
const port = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// База данных товаров (в памяти сервера)
let products = [
    { id: 1, name: 'Смартфон X100', price: 29999 },
    { id: 2, name: 'Ноутбук Pro', price: 54999 },
    { id: 3, name: 'Наушники Air', price: 4999 }
];

// ============= CRUD ОПЕРАЦИИ =============

// CREATE (создание товара) - POST /products
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    // Проверка наличия обязательных полей
    if (!name || !price) {
        return res.status(400).json({ 
            error: 'Не указаны название или цена товара' 
        });
    }
    
    // Создание нового товара с уникальным ID (на основе времени)
    const newProduct = {
        id: Date.now(),
        name: name,
        price: price
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// READ (получение всех товаров) - GET /products
app.get('/products', (req, res) => {
    res.json(products);
});

// READ (получение товара по ID) - GET /products/:id
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ 
            error: 'Товар не найден' 
        });
    }
    
    res.json(product);
});

// UPDATE (обновление товара) - PUT /products/:id
app.put('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ 
            error: 'Товар не найден' 
        });
    }
    
    const { name, price } = req.body;
    
    // Обновление только переданных полей
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    
    res.json(product);
});

// DELETE (удаление товара) - DELETE /products/:id
app.delete('/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id == req.params.id);
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            error: 'Товар не найден' 
        });
    }
    
    products.splice(productIndex, 1);
    res.json({ 
        message: 'Товар успешно удалён' 
    });
});

// ============= ДОПОЛНИТЕЛЬНЫЕ МАРШРУТЫ =============

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <h1>API управления товарами</h1>
        <p>Доступные endpoints:</p>
        <ul>
            <li><b>GET /products</b> - получить все товары</li>
            <li><b>GET /products/:id</b> - получить товар по ID</li>
            <li><b>POST /products</b> - создать товар (JSON: {"name": "...", "price": ...})</li>
            <li><b>PUT /products/:id</b> - обновить товар</li>
            <li><b>DELETE /products/:id</b> - удалить товар</li>
        </ul>
    `);
});

// Middleware для обработки несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Маршрут не найден' 
    });
});

// ============= ЗАПУСК СЕРВЕРА =============

app.listen(port, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});