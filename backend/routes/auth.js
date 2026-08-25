const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

// GET /api/auth/cities
router.get('/cities', async (req, res) => {
    console.log('!!! ЗАПРОС /cities ПОЛУЧЕН (ТЕСТ БЕЗ БД) !!!');
    try {
        // Имитируем быструю работу (100 мс) без реальных сетевых запросов
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ Отдаем тестовые данные');
        res.json({ 
            cities: ["Тестовый Иркутск", "Тестовый Новосибирск", "Тестовый Улан-Удэ"],
            test: "Supabase отключен, это чистый ответ Node.js"
        });
    } catch (error) {
        console.error('❌ ОШИБКА:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Временно закомментируем остальные маршруты, чтобы они не мешали тесту
/*
router.get('/roles', async (req, res) => { ... });
router.post('/register', async (req, res) => { ... });
router.get('/user/:phone', async (req, res) => { ... });
*/

module.exports = router;