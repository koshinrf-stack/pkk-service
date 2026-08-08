// URL нашего сервера
const API_URL = 'http://localhost:3000/api';

// Номер телефона (в реальном приложении будет браться из MAX)
const USER_PHONE = '+79001234567';

// История навигации для кнопки "Назад"
let navigationHistory = [];
let currentSection = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Приложение ПКК Сервис загружено');
    
    // Загружаем списки городов и ролей
    await loadCities();
    await loadRoles();
    
    // Проверяем, существует ли пользователь
    await checkExistingUser();
    
    // Обработчик отправки формы регистрации
    document.getElementById('registerForm').addEventListener('submit', handleRegistration);
});

// Проверка существующего пользователя
async function checkExistingUser() {
    try {
        const response = await fetch(`${API_URL}/auth/user/${USER_PHONE}`);
        
        if (response.ok) {
            const data = await response.json();
            // Пользователь существует - сразу показываем личный кабинет
            showDashboard(data.user);
        } else {
            // Пользователь не найден - показываем форму регистрации
            document.getElementById('registration-form').style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка проверки пользователя:', error);
        // При ошибке показываем форму регистрации
        document.getElementById('registration-form').style.display = 'block';
    }
}

// Загрузка списка городов
async function loadCities() {
    try {
        const response = await fetch(`${API_URL}/auth/cities`);
        const data = await response.json();
        
        const citySelect = document.getElementById('city');
        data.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки городов:', error);
    }
}

// Загрузка списка ролей
async function loadRoles() {
    try {
        const response = await fetch(`${API_URL}/auth/roles`);
        const data = await response.json();
        
        const roleSelect = document.getElementById('role');
        for (const [key, value] of Object.entries(data.roles)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            roleSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Ошибка загрузки ролей:', error);
    }
}

// Обработка регистрации
async function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const city = document.getElementById('city').value;
    const role = document.getElementById('role').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone_number: USER_PHONE,
                name: name,
                city: city,
                role: role
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Успешная регистрация - показываем личный кабинет
            showDashboard(data.user);
        } else {
            // Ошибка - показываем сообщение
            errorMessage.textContent = data.error || 'Ошибка регистрации';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        errorMessage.textContent = 'Ошибка соединения с сервером';
        errorMessage.style.display = 'block';
    }
}

// Показ личного кабинета
function showDashboard(user) {
    document.getElementById('registration-form').style.display = 'none';
    document.getElementById('header').style.display = 'block';
    document.getElementById('dashboard').style.display = 'block';
    
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-city').textContent = user.city;
    
    // Преобразуем роль в понятный текст
    const roleNames = {
        'retail': 'Розничный покупатель',
        'professional': 'Строитель профессионал',
        'dealer': 'Дилер'
    };
    document.getElementById('user-role').textContent = roleNames[user.role] || user.role;
    document.getElementById('user-bonuses').textContent = user.bonuses;
    
    // Загружаем акции (пока заглушка)
    loadPromotions();
}

// Загрузка акций (заглушка)
function loadPromotions() {
    const promoList = document.getElementById('promo-list');
    promoList.innerHTML = `
        <p>• Скидка 10% на металлочерепицу в Иркутске</p>
        <p>• Бесплатная доставка при заказе от 50 000 руб</p>
    `;
}

// Показать раздел
function showSection(sectionName) {
    navigationHistory.push(currentSection);
    currentSection = sectionName;
    
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('header').style.display = 'none';
    document.getElementById('sections').style.display = 'block';
    
    const content = document.getElementById('section-content');
    
    // Логика отображения для "Новый расчет"
    if (sectionName === 'new-calculation') {
        content.innerHTML = `
            <h2>Новый расчет</h2>
            <p class="description">Выберите тип объекта для начала работы:</p>
            
            <div class="menu-grid">
                <button class="btn menu-btn" onclick="showSubSection('roof-calculation')">Расчет кровли</button>
                <button class="btn menu-btn" onclick="showSubSection('facade-calculation')">Расчет фасада</button>
            </div>
        `;
        return;
    }

    // Заглушки для остальных разделов
    const sectionTitles = {
        'calculation-history': 'История расчетов',
        'order-history': 'История заказов',
        'catalog': 'Каталог стройматериалов',
        'delivery': 'Заказ доставки',
        'measurement': 'Вызвать специалиста на замер',
        'bonuses': 'Управление бонусами',
        'support': 'Служба поддержки',
        'language': 'Выбор языка'
    };
    
    content.innerHTML = `
        <h2>${sectionTitles[sectionName] || sectionName}</h2>
        <p>Этот раздел находится в разработке...</p>
    `;
}

// Функция для отображения подразделов (выбор материала)
function showSubSection(subSectionName) {
    navigationHistory.push(currentSection);
    currentSection = subSectionName;
    
    const content = document.getElementById('section-content');
    
    if (subSectionName === 'roof-calculation') {
        content.innerHTML = `
            <h2>Расчет кровли</h2>
            <p>Выберите тип материала:</p>
            <div class="menu-grid">
                <button class="btn menu-btn" onclick="showUploadForm('Кровля', 'Металлочерепица')">Металлочерепица</button>
                <button class="btn menu-btn" onclick="showUploadForm('Кровля', 'Гибкая черепица')">Гибкая черепица</button>
                <button class="btn menu-btn" onclick="showUploadForm('Кровля', 'Ондулин')">Ондулин</button>
                <button class="btn menu-btn" onclick="showUploadForm('Кровля', 'Композитная черепица')">Композитная черепица</button>
                <button class="btn menu-btn" onclick="showUploadForm('Кровля', 'Фальцевые панели')">Фальцевые панели</button>
            </div>
        `;
    } else if (subSectionName === 'facade-calculation') {
        content.innerHTML = `
            <h2>Расчет фасада</h2>
            <p>Выберите тип материала:</p>
            <div class="menu-grid">
                <button class="btn menu-btn" onclick="showUploadForm('Фасад', 'Металлосайдинг')">Металлосайдинг</button>
                <button class="btn menu-btn" onclick="showUploadForm('Фасад', 'Профлист')">Профлист</button>
                <button class="btn menu-btn" onclick="showUploadForm('Фасад', 'Фасадные панели')">Фасадные панели</button>
                <button class="btn menu-btn" onclick="showUploadForm('Фасад', 'Фиброцементные панели')">Фиброцементные панели</button>
            </div>
        `;
    }
}

// Показ формы загрузки файла
function showUploadForm(calcType, material) {
    const content = document.getElementById('section-content');
    content.innerHTML = `
        <h2>Отправка размеров (${material})</h2>
        <p>Прикрепите фото или схему с размерами. Наш специалист свяжется с вами для уточнения деталей, цвета и толщины.</p>
        
        <form id="uploadForm" onsubmit="handleFileUpload(event)">
            <input type="hidden" name="calc_type" value="${calcType}">
            <input type="hidden" name="material" value="${material}">
            
            <div class="form-group">
                <label>Комментарий (необязательно):</label>
                <textarea name="comment" rows="3" style="width:100%; padding:10px;" placeholder="Например: сложная крыша, много скатов..."></textarea>
            </div>

            <div class="form-group">
                <label>Файл (фото или схема):</label>
                <input type="file" name="file" required accept="image/*,.pdf,.doc,.docx">
            </div>

            <button type="submit" class="btn">Отправить специалисту</button>
        </form>
        <p id="upload-status" style="margin-top:10px; font-weight:bold;"></p>
    `;
}

// Обработка отправки файла
async function handleFileUpload(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const statusEl = document.getElementById('upload-status');
    
    // Добавляем данные пользователя из текущего состояния
    const userName = document.getElementById('user-name').textContent || 'Неизвестно';
    const userCity = document.getElementById('user-city').textContent || 'Неизвестно';
    
    formData.append('user_name', userName);
    formData.append('user_city', userCity);
    formData.append('user_phone', USER_PHONE); 

    statusEl.textContent = 'Отправка...';
    statusEl.style.color = 'blue';

    try {
        // Отправляем на наш бэкенд
        const response = await fetch(`${API_URL}/catalog/upload-request`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            statusEl.textContent = '✅ Успешно отправлено! Ожидайте звонка специалиста.';
            statusEl.style.color = 'green';
            form.reset();
        } else {
            throw new Error('Ошибка сервера');
        }
    } catch (error) {
        console.error(error);
        statusEl.textContent = '❌ Ошибка отправки. Попробуйте позже или позвоните нам.';
        statusEl.style.color = 'red';
    }
}

// Вернуться домой (в личный кабинет)
function goHome() {
    navigationHistory = [];
    currentSection = null;
    
    document.getElementById('sections').style.display = 'none';
    document.getElementById('header').style.display = 'block';
    document.getElementById('dashboard').style.display = 'block';
}

// Вернуться назад
function goBack() {
    if (navigationHistory.length > 0) {
        const previousSection = navigationHistory.pop();
        currentSection = previousSection;
        
        if (previousSection === null) {
            goHome();
        } else {
            // Для простоты просто перерисовываем раздел, если это был подраздел
            if (previousSection === 'new-calculation') {
                showSection('new-calculation');
            } else if (previousSection === 'roof-calculation' || previousSection === 'facade-calculation') {
                showSubSection(previousSection);
            } else {
                showSection(previousSection);
            }
        }
    } else {
        goHome();
    }
}