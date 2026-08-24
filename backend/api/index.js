// backend/api/index.js
const express = require('express');
const this_is_a_test_error = ; // <--- НАМЕРЕННАЯ ОШИБКА
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('--- ЗАПУСК ФУНКЦИИ VERCEL ---');
console.log('DATABASE_URL определен:', !!process.env.DATABASE_URL);

try {
    const authRoutes = require('../routes/auth');
    const catalogRoutes = require('../routes/catalog');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/catalog', catalogRoutes);
    console.log('Маршруты успешно подключены');
} catch (error) {
    console.error('=== КРИТИЧЕСКАЯ ОШИБКА ПРИ ИМПОРТЕ МАРШРУТОВ ===');
    console.error(error.message);
    console.error(error.stack);
}

app.get('/', (req, res) => {
    res.json({ message: 'PKK Service API is running!' });
});

// Ловим все необработанные ошибки, чтобы они попали в логи Vercel
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

module.exports = serverless(app);