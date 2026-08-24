console.log('✅ ЗАГРУЖЕНА АКТУАЛЬНАЯ ВЕРСИЯ (ТЕСТ НОВОГО ПУТИ)');

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

app.use((req, res, next) => {
    console.log(`>>> ВХОДЯЩИЙ ЗАПРОС: ${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());

// 1. Тестируем СОВЕРШЕННО НОВЫЙ путь
app.get('/api/test-hello', (req, res) => {
    console.log('!!! ОТВЕТ ИЗ /api/test-hello !!!');
    res.json({ message: "ЭТОТ ПУТЬ РАБОТАЕТ!", time: Date.now() });
});

// 2. Старый путь (для сравнения)
app.get('/api/auth/cities', (req, res) => {
    console.log('!!! ОТВЕТ ИЗ /api/auth/cities !!!');
    res.json({ cities: ["Тест"] });
});

console.log('--- Инициализация маршрутов ---');
try {
    const authRoutes = require('../routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Маршруты подключены');
} catch (error) {
    console.error('❌ ОШИБКА:', error.message);
}

app.get('/', (req, res) => {
    res.json({ message: 'Root works' });
});

module.exports = serverless(app);