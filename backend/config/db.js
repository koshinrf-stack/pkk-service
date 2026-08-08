const { Pool } = require('pg');

// Настройки подключения к базе данных
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'pkk_service',
    password: 'password123',
    port: 5432,
});

// Проверка подключения
pool.on('connect', () => {
    console.log('Подключение к базе данных установлено');
});

pool.on('error', (err) => {
    console.error('Ошибка подключения к базе данных:', err);
});

module.exports = pool;