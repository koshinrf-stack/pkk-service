// backend/config/db.js
const { Pool } = require('pg');

let globalPool;

function getPool() {
    if (globalPool) {
        return globalPool;
    }

    const connectionString = process.env.DATABASE_URL;
    console.log('--- Создание нового пула соединений БД ---');

    globalPool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false // Обязательно для Supabase
        },
        max: 1, // КРИТИЧНО для Vercel: только 1 соединение на инстанс
        idleTimeoutMillis: 2000, // Быстро освобождаем соединение
        connectionTimeoutMillis: 5000 // Не ждем дольше 5 секунд
    });

    // Тихий тест подключения при создании
    globalPool.query('SELECT 1')
        .then(() => console.log('✅ БД успешно подключена и готова!'))
        .catch(err => console.error('❌ Ошибка начального подключения к БД:', err.message));

    return globalPool;
}

module.exports = getPool();