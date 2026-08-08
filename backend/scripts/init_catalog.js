const pool = require('../config/db');

async function initCatalog() {
    try {
        console.log('Начинаем создание таблиц каталога...');

        // 1. Справочники (не имеют внешних ключей)
        
        // Категории продуктов
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                parent_id INTEGER REFERENCES product_categories(id),
                description TEXT
            )
        `);

        // Типы материалов
        await pool.query(`
            CREATE TABLE IF NOT EXISTS material_types (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                category VARCHAR(50) NOT NULL
            )
        `);

        // Покрытия
        await pool.query(`
            CREATE TABLE IF NOT EXISTS coatings (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                warranty_years INTEGER,
                description TEXT
            )
        `);

        // Цвета RAL
        await pool.query(`
            CREATE TABLE IF NOT EXISTS colors_ral (
                id SERIAL PRIMARY KEY,
                code VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                hex_code VARCHAR(7),
                is_standard BOOLEAN DEFAULT TRUE
            )
        `);

        // Толщины
        await pool.query(`
            CREATE TABLE IF NOT EXISTS thicknesses (
                id SERIAL PRIMARY KEY,
                value DECIMAL(4,2) UNIQUE NOT NULL,
                unit VARCHAR(10) DEFAULT 'мм'
            )
        `);

        // Производители
        await pool.query(`
            CREATE TABLE IF NOT EXISTS manufacturers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                city VARCHAR(50) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                CONSTRAINT unique_manufacturer_city UNIQUE (name, city)
            )
        `);

        console.log('Справочные таблицы созданы.');

        // 2. Основные таблицы (зависят от справочников)

        // Модели товаров
        await pool.query(`
            CREATE TABLE IF NOT EXISTS models (
                id SERIAL PRIMARY KEY,
                manufacturer_id INTEGER REFERENCES manufacturers(id),
                type_id INTEGER REFERENCES material_types(id),
                name VARCHAR(200) NOT NULL,
                description TEXT,
                image_url TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT uq_models_name_manufacturer UNIQUE (name, manufacturer_id)
            )
        `);

        console.log('Таблица моделей создана.');

        // 3. Зависимые таблицы (зависят от моделей и справочников)

        // Варианты товаров (цены, SKU)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_variants (
                id SERIAL PRIMARY KEY,
                model_id INTEGER REFERENCES models(id),
                coating_id INTEGER REFERENCES coatings(id),
                color_id INTEGER REFERENCES colors_ral(id),
                thickness_id INTEGER REFERENCES thicknesses(id),
                sku_full VARCHAR(100) UNIQUE,
                price DECIMAL(10,2) NOT NULL,
                unit_type VARCHAR(20) DEFAULT 'm2',
                stock_quantity INTEGER DEFAULT 0,
                is_available BOOLEAN DEFAULT TRUE
            )
        `);

        console.log('Таблица вариантов товаров создана.');
        console.log('Все таблицы каталога успешно созданы!');

    } catch (error) {
        console.error('Ошибка при создании таблиц каталога:', error);
    }
}

initCatalog();