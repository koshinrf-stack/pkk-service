const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Доступные города (в будущем будут храниться в БД)
const AVAILABLE_CITIES = ['Иркутск', 'Улан-Удэ', 'Новосибирск'];

// Доступные роли
const AVAILABLE_ROLES = {
    'retail': 'Розничный покупатель',
    'professional': 'Строитель профессионал',
    'dealer': 'Дилер'
};

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', async (req, res) => {
    try {
        const { phone_number, name, city, role } = req.body;

        // Валидация данных
        if (!phone_number || !name || !city || !role) {
            return res.status(400).json({ 
                error: 'Все поля обязательны для заполнения' 
            });
        }

        if (!AVAILABLE_CITIES.includes(city)) {
            return res.status(400).json({ 
                error: 'Недопустимый город' 
            });
        }

        if (!AVAILABLE_ROLES[role]) {
            return res.status(400).json({ 
                error: 'Недопустимая роль' 
            });
        }

        // Проверка, существует ли пользователь с таким номером
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE phone_number = $1',
            [phone_number]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Пользователь с таким номером уже существует' 
            });
        }

        // Создание нового пользователя
        const newUser = await pool.query(
            `INSERT INTO users (phone_number, name, city, role) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, phone_number, name, city, role, bonuses, active_calculations, language`,
            [phone_number, name, city, role]
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера' 
        });
    }
});

// GET /api/auth/cities - Получение списка городов
router.get('/cities', (req, res) => {
    res.json({ cities: AVAILABLE_CITIES });
});

// GET /api/auth/roles - Получение списка ролей
router.get('/roles', (req, res) => {
    res.json({ roles: AVAILABLE_ROLES });
});

// GET /api/auth/user/:phone - Получение данных пользователя по номеру
router.get('/user/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        
        const result = await pool.query(
            'SELECT id, phone_number, name, city, role, bonuses, active_calculations, language FROM users WHERE phone_number = $1',
            [phone]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;