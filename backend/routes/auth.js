const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/auth/cities - Получение списка городов
router.get('/cities', async (req, res) => {
    try {
        const result = await pool.query('SELECT name FROM cities WHERE is_active = true ORDER BY name');
        // Возвращаем простой массив строк: ["Иркутск", "Новосибирск"]
        res.json({ cities: result.rows.map(row => row.name) });
    } catch (error) {
        console.error('Ошибка получения городов:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// GET /api/auth/roles - Получение списка ролей
router.get('/roles', async (req, res) => {
    try {
        const result = await pool.query('SELECT code, name FROM roles ORDER BY id');
        // Возвращаем объект: { "retail": "Розничный покупатель", ... }
        const rolesObj = {};
        result.rows.forEach(row => {
            rolesObj[row.code] = row.name;
        });
        res.json({ roles: rolesObj });
    } catch (error) {
        console.error('Ошибка получения ролей:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', async (req, res) => {
    try {
        const { phone_number, name, city, role } = req.body;

        if (!phone_number || !name || !city || !role) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        // Проверка существования города и роли в БД
        const cityCheck = await pool.query('SELECT id FROM cities WHERE name = $1', [city]);
        const roleCheck = await pool.query('SELECT id FROM roles WHERE code = $1', [role]);

        if (cityCheck.rows.length === 0 || roleCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Выбран неверный город или роль' });
        }

        // Проверка, нет ли уже такого пользователя
        const existingUser = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким номером уже зарегистрирован' });
        }

        // СОХРАНЕНИЕ В ТАБЛИЦУ USERS
        const newUser = await pool.query(
            `INSERT INTO users (phone_number, name, city, role, bonuses) 
             VALUES ($1, $2, $3, $4, 0) 
             RETURNING id, phone_number, name, city, role, bonuses`,
            [phone_number, name, city, role]
        );

        res.status(201).json({
            message: 'Успешная регистрация',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// GET /api/auth/user/:phone - Проверка пользователя
router.get('/user/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Ошибка поиска пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;