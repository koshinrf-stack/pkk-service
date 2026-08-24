// GET /api/auth/cities
router.get('/cities', async (req, res) => {
    console.log('!!! ЗАПРОС /cities ПОЛУЧЕН !!!');
    
    try {
        console.log('1. Начинаем запрос к Supabase...');
        
        // Добавляем таймаут 10 секунд
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Запрос к Supabase превысил 10 секунд')), 10000);
        });
        
        console.log('2. Выполняем запрос SELECT из cities...');
        
        const queryPromise = supabase
            .from('cities')
            .select('name')
            .eq('is_active', true)
            .order('name', { ascending: true });
        
        const { data, error } = await Promise.race([
            queryPromise,
            timeoutPromise
        ]);
        
        console.log('3. Получен ответ от Supabase');
        
        if (error) {
            console.error('❌ Ошибка от Supabase:', error.message, error.details);
            throw error;
        }
        
        console.log('✅ БД ответила:', data.length, 'строк');
        console.log('Данные:', data);
        
        res.json({ cities: data.map(row => row.name) });
        
    } catch (error) {
        console.error('❌ ОШИБКА В /cities:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});