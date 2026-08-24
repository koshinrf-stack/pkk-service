const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/cities', async (req, res) => {
    console.log('!!! ДОШЛИ ДО ЗАПРОСА ГОРОДОВ !!!'); // ЭТА СТРОКА ОБЯЗАТЕЛЬНА
    try {
        console.log('Делаем запрос к БД...');
        const result = await pool.query('SELECT name FROM cities WHERE is_active = true ORDER BY name');
        console.log('БД ответила:', result.rows.length, 'строк');
        res.json({ cities: result.rows.map(r => r.name) });
    } catch (err) {
        console.error('!!! ОШИБКА БД !!!', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/roles - Получение списка ролей
router.get('/roles', async (req, res) => {
    console.log('--- ЗАПРОС /api/auth/roles НАЧАЛСЯ ---');
    try {
        const result = await pool.query('SELECT code, name FROM roles ORDER BY id');
        const rolesObj = {};
        result.rows.forEach(row => {
            rolesObj[row.code] = row.name;
        });
        res.json({ roles: rolesObj });
    } catch (error) {
        console.error('=== ОШИБКА В ЗАПРОСЕ РОЛЕЙ ===');
        console.error('Сообщение:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера при получении ролей' });
    }
});

// POST /api/auth/register - Регистрация
router.post('/register', async (req, res) => {
    console.log('--- ЗАПРОС /api/auth/register НАЧАЛСЯ ---');
    try {
        const { phone_number, name, city, role } = req.body;
        console.log('Данные для регистрации:', { phone_number, name, city, role });

        if (!phone_number || !name || !city || !role) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        const cityCheck = await pool.query('SELECT id FROM cities WHERE name = $1', [city]);
        const roleCheck = await pool.query('SELECT id FROM roles WHERE code = $1', [role]);

        if (cityCheck.rows.length === 0 || roleCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Выбран неверный город или роль' });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }

        const newUser = await pool.query(
            `INSERT INTO users (phone_number, name, city, role, bonuses) 
             VALUES ($1, $2, $3, $4, 0) 
             RETURNING id, phone_number, name, city, role, bonuses`,
            [phone_number, name, city, role]
        );

        res.status(201).json({ message: 'Успешная регистрация', user: newUser.rows[0] });
    } catch (error) {
        console.error('=== ОШИБКА ПРИ РЕГИСТРАЦИИ ===');
        console.error('Сообщение:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// GET /api/auth/user/:phone
router.get('/user/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('=== ОШИБКА ПОИСКА ПОЛЬЗОВАТЕЛЯ ===');
        console.error('Сообщение:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;