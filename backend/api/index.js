// backend/api/index.js
console.log('✅ ЗАГРУЖЕНА АКТУАЛЬНАЯ ВЕРСИЯ КОДА (ИСПРАВЛЕННАЯ)');

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
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
}

app.get('/', (req, res) => {
    res.json({ message: 'PKK Service API is running!' });
});

module.exports = serverless(app);