// backend/api/index.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключаем наши маршруты
// Обратите внимание на пути '../routes', так как мы находимся в api/index.js
const authRoutes = require('../routes/auth');
const catalogRoutes = require('../routes/catalog');

app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);

// Тестовый маршрут, чтобы проверить, работает ли API
app.get('/', (req, res) => {
    res.json({ message: 'PKK Service API is running on Vercel!' });
});

// Экспорт для Vercel
module.exports.handler = serverless(app);