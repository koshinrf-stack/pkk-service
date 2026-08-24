// backend/api/index.js
console.log('✅ ЗАГРУЖЕНА АКТУАЛЬНАЯ ВЕРСИЯ КОДА (С ЗАЩИТОЙ ОТ КЭША)');

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// 1. Глобальный логгер
app.use((req, res, next) => {
    console.log(`>>> ВХОДЯЩИЙ ЗАПРОС: ${req.method} ${req.url} | Time: ${Date.now()}`);
    next();
});

app.use(cors());
app.use(express.json());

// 2. ПРЯМОЙ МАРШРУТ С ЗАПРЕТОМ КЭШИРОВАНИЯ
app.get('/api/auth/cities', (req, res) => {
    console.log('!!! ПРЯМОЙ ОТВЕТ БЕЗ РОУТЕРА !!!');
    
    // Жестко запрещаем Vercel и браузеру кэшировать этот ответ
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.json({ 
        status: "SUCCESS", 
        cities: ["ПРЯМОЙ ОТВЕТ РАБОТАЕТ"],
        timestamp: new Date().toISOString(),
        random: Math.random() // Чтобы каждый ответ был уникальным
    });
});

console.log('--- Инициализация маршрутов ---');

try {
    const authRoutes = require('../routes/auth');
    const catalogRoutes = require('../routes/catalog');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/catalog', catalogRoutes);
    console.log('✅ Маршруты успешно подключены');
} catch (error) {
    console.error('❌ ОШИБКА ПОДКЛЮЧЕНИЯ МАРШРУТОВ:', error.message);
}

app.get('/', (req, res) => {
    console.log('>>> ЗАПРОС К КОРНЕВОМУ ПУТИ /');
    res.json({ message: 'PKK Service API is running!', timestamp: new Date().toISOString() });
});

module.exports = serverless(app);