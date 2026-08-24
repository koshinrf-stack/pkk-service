const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

// GET /api/auth/cities
router.get('/cities', async (req, res) => {
    console.log('!!! ЗАПРОС /cities ПОЛУЧЕН !!!');
    try {
        const { data, error } = await supabase
            .from('cities')
            .select('name')
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) throw error;

        console.log('✅ БД ответила:', data.length, 'строк');
        res.json({ cities: data.map(row => row.name) });
        
    } catch (error) {
        console.error('❌ ОШИБКА В /cities:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/roles
router.get('/roles', async (req, res) => {
    console.log('!!! ЗАПРОС /roles ПОЛУЧЕН !!!');
    try {
        const { data, error } = await supabase
            .from('roles')
            .select('code, name');

        if (error) throw error;

        const rolesObj = {};
        data.forEach(row => {
            rolesObj[row.code] = row.name;
        });

        res.json({ roles: rolesObj });
        
    } catch (error) {
        console.error('❌ ОШИБКА В /roles:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    console.log('!!! ЗАПРОС /register ПОЛУЧЕН !!!');
    try {
        const { phone_number, name, city, role } = req.body;

        if (!phone_number || !name || !city || !role) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        const { data: cityData } = await supabase.from('cities').select('id').eq('name', city).single();
        const { data: roleData } = await supabase.from('roles').select('id').eq('code', role).single();

        if (!cityData || !roleData) {
            return res.status(400).json({ error: 'Неверный город или роль' });
        }

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('phone_number', phone_number)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ phone_number, name, city, role, bonuses: 0 }])
            .select()
            .single();

        if (insertError) throw insertError;

        res.status(201).json({ message: 'Успешная регистрация', user: newUser });
        
    } catch (error) {
        console.error('❌ ОШИБКА ПРИ РЕГИСТРАЦИИ:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// GET /api/auth/user/:phone
router.get('/user/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone_number', phone)
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Пользователь не найден' });

        res.json({ user: data });
    } catch (error) {
        console.error('❌ ОШИБКА ПОИСКА ПОЛЬЗОВАТЕЛЯ:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;