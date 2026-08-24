// backend/config/db.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

console.log('=== ИНИЦИАЛИЗАЦИЯ БД (Session Mode) ===');

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    max: 1, // Ограничиваем пул одним соединением для Serverless
    idleTimeoutMillis: 1000, // Быстро закрываем бездействие
    connectionTimeoutMillis: 5000 // Ждем подключения не более 5 сек
});

// Проверка при старте
pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error('Ошибка старта БД:', err.message);
    else console.log('БД готова к работе!');
});

module.exports = pool;