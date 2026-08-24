// backend/config/db.js
const { Pool } = require('pg');

let globalPool;

function getPool() {
    // Если пул уже создан (функция "разогрета"), возвращаем его
    if (globalPool) {
        return globalPool;
    }

    const connectionString = process.env.DATABASE_URL;
    console.log('--- Инициализация пула соединений БД ---');

    globalPool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false // Обязательно для Supabase
        },
        max: 2, // Максимум 2 соединения на инстанс (безопасно для Vercel)
        idleTimeoutMillis: 10000, // Закрывать бездействие через 10 сек (было 2000, это было слишком агрессивно)
        connectionTimeoutMillis: 15000 // Даем 15 секунд на установление соединения при холодном старте
    });

    // Мы убрали тестовый запрос SELECT 1 отсюда.
    // Первое реальное обращение к базе данных (например, запрос городов) 
    // само установит соединение и покажет, работает оно или нет, без блокировки старта.

    return globalPool;
}

module.exports = getPool();