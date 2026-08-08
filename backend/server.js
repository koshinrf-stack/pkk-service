const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

// Загружаем переменные окружения из файла .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Тестовый маршрут для проверки
app.get('/test', (req, res) => {
    res.json({ test: 'Маршруты работают!' });
});

// Middleware
app.use(cors());
app.use(express.json()); // Для обработки JSON данных

// Подключение маршрутов
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Подключение маршрутов каталога
const catalogRoutes = require('./routes/catalog');
app.use('/api/catalog', catalogRoutes);

// Простой тестовый маршрут
app.get('/', (req, res) => {
    res.json({ message: 'ПКК Сервис API работает!' });
});

// Проверка подключения к БД при запуске
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err);
    } else {
        console.log('База данных готова к работе!', res.rows[0]);
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});