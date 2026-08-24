// backend/api/index.js
console.log('✅ ЗАГРУЖЕНА АКТУАЛЬНАЯ ВЕРСИЯ КОДА (ПРЯМОЙ ТЕСТ)');

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// 1. Глобальный логгер (чтобы видеть каждый запрос)
app.use((req, res, next) => {
    console.log(`>>> ВХОДЯЩИЙ ЗАПРОС: ${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());

// 2. ПРЯМОЙ МАРШРУТ ДЛЯ ТЕСТА (в обход роутеров)
app.get('/api/auth/cities', (req, res) => {
    console.log('!!! ПРЯМОЙ ОТВЕТ БЕЗ РОУТЕРА !!!');
    res.json({ 
        status: "SUCCESS", 
        cities: ["ПРЯМОЙ ОТВЕТ РАБОТАЕТ"],
        timestamp: new Date().toISOString()
    });
});

console.log('--- Инициализация маршрутов ---');

try {
    // Подключаем остальные маршруты
    const authRoutes = require('../routes/auth');
    const catalogRoutes = require('../routes/catalog');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/catalog', catalogRoutes);
    console.log('✅ Маршруты успешно подключены');
} catch (error) {
    console.error('❌ ОШИБКА ПОДКЛЮЧЕНИЯ МАРШРУТОВ:', error.message);
}

// Корневой маршрут
app.get('/', (req, res) => {
    console.log('>>> ЗАПРОС К КОРНЕВОМУ ПУТИ /');
    res.json({ message: 'PKK Service API is running!', timestamp: new Date().toISOString() });
});

// Обработка 404
app.use((req, res) => {
    console.log(`>>> 404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not found' });
});

module.exports = serverless(app);