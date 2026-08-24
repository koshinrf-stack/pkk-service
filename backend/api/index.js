// backend/api/index.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключаем маршруты
try {
    const authRoutes = require('../routes/auth');
    const catalogRoutes = require('../routes/catalog');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/catalog', catalogRoutes);
} catch (error) {
    console.error('Ошибка подключения маршрутов:', error);
}

// Тестовый маршрут
app.get('/', (req, res) => {
    res.json({ message: 'PKK Service API is running on Vercel!' });
});

// Создаем handler
const handler = serverless(app);

// Экспортируем handler так, чтобы Vercel его точно увидел
module.exports = handler;