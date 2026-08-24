// backend/config/db.js
const { createClient } = require('@supabase/supabase-js');

console.log('--- Инициализация Supabase Client ---');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ОШИБКА: Отсутствуют SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
} else {
    console.log('✅ Supabase Client успешно инициализирован');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;