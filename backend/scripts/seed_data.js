const pool = require('../config/db');

async function seedData() {
    console.log('Начинаем наполнение базы данных...');

    try {
        // 1. ОЧИСТКА ТАБЛИЦ (Строго в обратном порядке зависимостей!)
        // Сначала удаляем варианты товаров (самые зависимые)
        await pool.query('DELETE FROM product_variants');
        // Потом сами товары (модели)
        await pool.query('DELETE FROM models');
        // Потом справочники, на которые ссылаются товары
        await pool.query('DELETE FROM manufacturers');
        await pool.query('DELETE FROM material_types');
        await pool.query('DELETE FROM product_categories'); // Новая таблица
        await pool.query('DELETE FROM coatings');           // Новая таблица
        await pool.query('DELETE FROM colors_ral');         // Новая таблица
        await pool.query('DELETE FROM thicknesses');        // Новая таблица
        
        // Сбрасываем счетчики ID, чтобы они начинались с 1
        await pool.query('ALTER SEQUENCE product_variants_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE models_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE manufacturers_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE material_types_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE product_categories_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE coatings_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE colors_ral_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE thicknesses_id_seq RESTART WITH 1');

        console.log('Таблицы очищены.');

        // 2. Добавляем категории продуктов (для связи с товарами)
        const categories = [
            'Кровельные материалы',
            'Фасадные материалы',
            'Водосточные системы',
            'Ограждения и заборы'
        ];

        const categoryIds = {};
        for (const catName of categories) {
            const res = await pool.query(
                `INSERT INTO product_categories (name) VALUES ($1) RETURNING id`,
                [catName]
            );
            categoryIds[catName] = res.rows[0].id;
        }
        console.log('Категории созданы:', categoryIds);

        // 3. Добавляем типы материалов (для справочника)
        const types = [
            ['Металлочерепица', 'roof'],
            ['Профнастил', 'roof'],
            ['Фальцевая кровля', 'roof'],
            ['Сайдинг', 'facade'],
            ['Софиты', 'facade']
        ];
        
        const typeIds = {};
        for (const [name, category] of types) {
            const res = await pool.query(
                'INSERT INTO material_types (name, category) VALUES ($1, $2) RETURNING id',
                [name, category]
            );
            typeIds[name] = res.rows[0].id;
        }
        console.log('Типы материалов добавлены.');

        // 4. Добавляем производителя "Металл Профиль" для Иркутска
        const manufacturerRes = await pool.query(
            "INSERT INTO manufacturers (name, city) VALUES ('Металл Профиль', 'Иркутск') RETURNING id"
        );
        const manufacturerId = manufacturerRes.rows[0].id;
        console.log(`Производитель добавлен. ID: ${manufacturerId}`);

        // 5. Добавляем покрытия
        const coatings = [
            ['PURMAN 50 мкм', 50],
            ['VikingMP E 45 мкм', 40],
            ['NormanMP 25 мкм', 20],
            ['Полиэстер 25 мкм', 5],
            ['Оцинковка', 1]
        ];
        const coatingIds = {};
        for (const [name, warranty] of coatings) {
            const res = await pool.query(
                'INSERT INTO coatings (name, warranty_years) VALUES ($1, $2) RETURNING id',
                [name, warranty]
            );
            coatingIds[name] = res.rows[0].id;
        }
        console.log('Покрытия добавлены.');

        // 6. Добавляем цвета (основные RAL из прайса)
        const colors = [
            ['3005', 'Красное вино'],
            ['6005', 'Зеленый мох'],
            ['7024', 'Графитовый серый'],
            ['8017', 'Шоколадно-коричневый'],
            ['9005', 'Черный янтарь'],
            ['RR32', 'Темно-коричневый']
        ];
        const colorIds = {};
        for (const [code, name] of colors) {
            const res = await pool.query(
                'INSERT INTO colors_ral (code, name) VALUES ($1, $2) RETURNING id',
                [code, name]
            );
            colorIds[code] = res.rows[0].id;
        }
        console.log('Цвета добавлены.');

        // 7. Добавляем толщины
        const thicknesses = [0.40, 0.45, 0.50];
        const thicknessIds = {};
        for (const th of thicknesses) {
            const res = await pool.query(
                'INSERT INTO thicknesses (value) VALUES ($1) RETURNING id',
                [th]
            );
            thicknessIds[th] = res.rows[0].id;
        }
        console.log('Толщины добавлены.');

        // 8. Создаем модели (Товары) и их варианты
        // Пример для Металлочерепицы (из Прайс-листа №1.1)
        // Используем categoryIds['Кровельные материалы']
        const roofModels = [
            { name: 'МП Ламонтерра-Х', typeId: typeIds['Металлочерепица'], basePrice: 1205 }, 
            { name: 'МП Монтерроса', typeId: typeIds['Металлочерепица'], basePrice: 1240 },
            { name: 'МП Трамонтана', typeId: typeIds['Металлочерепица'], basePrice: 1275 }
        ];

        for (const model of roofModels) {
            // Создаем карточку товара
            const prodRes = await pool.query(
                `INSERT INTO models (manufacturer_id, type_id, name, description) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [manufacturerId, model.typeId, model.name, 'Классическая форма волны']
            );
            const modelId = prodRes.rows[0].id;

            // Вариант 1: PURMAN 0.5мм, цвет 3005
            await createVariant(modelId, coatingIds['PURMAN 50 мкм'], colorIds['3005'], thicknessIds[0.50], model.basePrice);
            
            // Вариант 2: Полиэстер 0.5мм, цвет 7024 (цена ниже, например ~865 руб для Ламонтерры)
            let polyPrice = Math.round(model.basePrice * 0.7); 
            await createVariant(modelId, coatingIds['Полиэстер 25 мкм'], colorIds['7024'], thicknessIds[0.50], polyPrice);
        }

        // Пример для Профнастила (из Прайс-листа №1.2)
        const profileModels = [
            { name: 'Профнастил С-8', typeId: typeIds['Профнастил'], basePrice: 1105 },
            { name: 'Профнастил МП-20', typeId: typeIds['Профнастил'], basePrice: 1160 },
            { name: 'Профнастил С-21', typeId: typeIds['Профнастил'], basePrice: 1250 }
        ];

        for (const model of profileModels) {
            const prodRes = await pool.query(
                `INSERT INTO models (manufacturer_id, type_id, name, description) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [manufacturerId, model.typeId, model.name, 'Стеновой профнастил']
            );
            const modelId = prodRes.rows[0].id;

            // Варианты для профнастила
            await createVariant(modelId, coatingIds['PURMAN 50 мкм'], colorIds['3005'], thicknessIds[0.50], model.basePrice);
            await createVariant(modelId, coatingIds['Полиэстер 25 мкм'], colorIds['7024'], thicknessIds[0.50], Math.round(model.basePrice * 0.8));
            await createVariant(modelId, coatingIds['Оцинковка'], null, thicknessIds[0.50], Math.round(model.basePrice * 0.5)); // Для оцинковки цвет не важен (null)
        }

        console.log('Наполнение базы данных успешно завершено!');

    } catch (error) {
        console.error('Ошибка при наполнении БД:', error);
    }
}

// Вспомогательная функция для создания вариантов
async function createVariant(modelId, coatingId, colorId, thicknessId, price) {
    // Генерируем SKU
    const sku = `MP-${modelId}-${coatingId}-${colorId || 'ZINC'}-${thicknessId}`;
    
    await pool.query(
        `INSERT INTO product_variants (model_id, coating_id, color_id, thickness_id, sku_full, price, unit_type)
         VALUES ($1, $2, $3, $4, $5, $6, 'm2')`,
        [modelId, coatingId, colorId, thicknessId, sku, price]
    );
}

seedData();