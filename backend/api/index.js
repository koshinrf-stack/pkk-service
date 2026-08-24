// backend/api/index.js
console.log('!!! ЭТО ВЕРСИЯ КОДА ОТ 24 АВГУСТА 2026 ГОДА !!!'); // <--- МАЯК

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('--- ЗАПУСК ФУНКЦИИ VERCEL (ЧИСТАЯ ВЕРСИЯ) ---');
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
}

app.get('/', (req, res) => {
    res.json({ message: 'PKK Service API is running!' });
});

module.exports = serverless(app);