// backend/api/index.js
console.log('✅ ЗАГРУЖЕНА АКТУАЛЬНАЯ ВЕРСИЯ КОДА (ИСПРАВЛЕННАЯ)');

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// ГЛОБАЛЬНЫЙ ЛОГГЕР - ДОЛЖЕН БЫТЬ ПЕРВЫМ!
app.use((req, res, next) => {
    console.log(`>>> ВХОДЯЩИЙ ЗАПРОС: ${req.method} ${req.url}`);
    console.log(`>>> HEADERS:`, JSON.stringify(req.headers));
    next();
});

app.use(cors());
app.use(express.json());

console.log('--- Инициализация маршрутов ---');

try {
    const authRoutes = require('../routes/auth');
    const catalogRoutes = require('../routes/catalog');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/catalog', catalogRoutes);
    console.log('✅ Маршруты успешно подключены');
} catch (error) {
    console.error('❌ ОШИБКА ПОДКЛЮЧЕНИЯ МАРШРУТОВ:', error.message);
    console.error(error.stack);
}

app.get('/', (req, res) => {
    console.log('>>> ЗАПРОС К КОРНЕВОМУ ПУТИ /');
    res.json({ message: 'PKK Service API is running!', timestamp: new Date().toISOString() });
});

// Обработка 404
app.use((req, res) => {
    console.log(`>>> 404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not found', path: req.url });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('>>> НЕОБРАБОТАННАЯ ОШИБКА:', err.message);
    res.status(500).json({ error: err.message });
});

module.exports = serverless(app);