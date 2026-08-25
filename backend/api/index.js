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

// Handle preflight requests for all routes
app.options('*', cors());

console.log('--- Инициализация маршрутов ---');
try {
    const authRoutes = require('../routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Маршруты auth подключены');
} catch (error) {
    console.error('❌ ОШИБКА auth:', error.message);
}

try {
    const catalogRoutes = require('../routes/catalog');
    app.use('/api/catalog', catalogRoutes);
    console.log('✅ Маршруты catalog подключены');
} catch (error) {
    console.error('❌ ОШИБКА catalog:', error.message);
}

app.get('/', (req, res) => {
    res.json({ message: 'Root works' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Root works' });
});

module.exports = serverless(app);