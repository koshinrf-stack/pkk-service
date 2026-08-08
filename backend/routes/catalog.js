const express = require('express');
const router = express.Router();
const multer = require('multer'); // Для загрузки файлов
const axios = require('axios');   // Для отправки запросов в MAX API
const path = require('path');

// Настройка хранения файлов (временно в память, чтобы переслать дальше)
const upload = multer({ storage: multer.memoryStorage() });

// Конфигурация MAX Bot (примерные данные, нужно взять из кабинета разработчика MAX)
const MAX_BOT_TOKEN = 'YOUR_MAX_BOT_TOKEN'; 
const MAX_GROUP_ID = 'GROUP_ID_FROM_LINK'; // Нужно получить ID группы из ссылки https://max.ru/join/...

// Эндпоинт для приема заявки
router.post('/upload-request', upload.single('file'), async (req, res) => {
    try {
        const { calc_type, material, comment, user_name, user_city, user_phone } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        // Формируем текстовое сообщение
        const messageText = `
🔔 *Новая заявка на расчет*
👤 *Клиент:* ${user_name}
📞 *Телефон:* ${user_phone}
🏙 *Город:* ${user_city}
📐 *Тип:* ${calc_type === 'roof' ? 'Кровля' : 'Фасад'}
🧱 *Материал:* ${material}
💬 *Комментарий:* ${comment || 'Нет'}
        `;

        // Логика отправки в MAX
        // Вариант А: Если MAX поддерживает отправку медиа через HTTP API
        /*
        const formData = new FormData();
        formData.append('chat_id', MAX_GROUP_ID);
        formData.append('caption', messageText);
        formData.append('photo', file.buffer, file.originalname);

        await axios.post(`https://api.max.ru/bot${MAX_BOT_TOKEN}/sendPhoto`, formData, {
            headers: formData.getHeaders()
        });
        */

        // Вариант Б (Упрощенный для теста): Просто сохраняем файл на сервере и пишем лог
        // В реальном проекте здесь должен быть код отправки в MAX
        console.log('--- Новая заявка ---');
        console.log(messageText);
        console.log('Имя файла:', file.originalname);
        
        // Здесь можно сохранить файл во временную папку
        // fs.writeFileSync(`uploads/${Date.now()}_${file.originalname}`, file.buffer);

        res.json({ message: 'Заявка принята' });

    } catch (error) {
        console.error('Ошибка обработки заявки:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;