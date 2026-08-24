const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
console.log('=== ИНИЦИАЛИЗАЦИЯ БД ===');
console.log('DATABASE_URL присутствует:', !!connectionString);

if (!connectionString) {
    console.error('КРИТИЧЕСКАЯ ОШИБКА: DATABASE_URL не определен!');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000, // Быстрый отказ, если нет связи
    idleTimeoutMillis: 30000
});

// Тестовый запрос при инициализации (необязательно, но полезно для логов)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('=== ОШИБКА ПОДКЛЮЧЕНИЯ К БД ===', err.message);
    } else {
        console.log('=== ПОДКЛЮЧЕНИЕ К БД УСПЕШНО ===', res.rows[0].now);
    }
});

module.exports = pool;