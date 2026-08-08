const pool = require('../config/db');

async function initDatabase() {
    try {
        // Таблица пользователей
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                phone_number VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                city VARCHAR(50) NOT NULL,
                role VARCHAR(50) NOT NULL, -- 'retail', 'professional', 'dealer'
                bonuses INTEGER DEFAULT 0,
                active_calculations INTEGER DEFAULT 0,
                language VARCHAR(20) DEFAULT 'ru',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Таблица users успешно создана или уже существует');

        // Здесь в будущем будут другие таблицы (города, товары, заказы и т.д.)
        
    } catch (error) {
        console.error('Ошибка при создании таблиц:', error);
    } finally {
        // Не закрываем pool, так как он используется сервером
    }
}

// Запускаем функцию
initDatabase();