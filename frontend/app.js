// URL нашего сервера (относительный путь для работы на Vercel и локально)
const API_URL = '/api'; 
const USER_PHONE = '+79001234567'; // В будущем заменим на ввод номера

let navigationHistory = [];
let currentSection = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Приложение ПКК Сервис загружено');
    
    // Сначала пробуем найти форму. Если её нет (например, мы уже в ЛК), то и не грузим списки
    const regForm = document.getElementById('registration-form');
    if (regForm) {
        await loadCities();
        await loadRoles();
        regForm.style.display = 'block'; // Показываем форму сразу
        
        // Обработчик отправки формы
        document.getElementById('registerForm').addEventListener('submit', handleRegistration);
    }
    
    await checkExistingUser();
});

async function checkExistingUser() {
    try {
        const response = await fetch(`${API_URL}/auth/user/${USER_PHONE}`);
        if (response.ok) {
            const data = await response.json();
            showDashboard(data.user);
        }
    } catch (error) {
        console.log('Пользователь не найден, показываем регистрацию');
    }
}

async function loadCities() {
    try {
        const response = await fetch(`${API_URL}/auth/cities`);
        const data = await response.json();
        const citySelect = document.getElementById('city');
        
        if (citySelect && data.cities) {
            citySelect.innerHTML = '<option value="">Выберите город</option>';
            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки городов:', error);
    }
}

async function loadRoles() {
    try {
        const response = await fetch(`${API_URL}/auth/roles`);
        const data = await response.json();
        const roleSelect = document.getElementById('role');
        
        if (roleSelect && data.roles) {
            roleSelect.innerHTML = '<option value="">Выберите статус</option>';
            for (const [code, name] of Object.entries(data.roles)) {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = name;
                roleSelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки ролей:', error);
    }
}

async function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const city = document.getElementById('city').value;
    const role = document.getElementById('role').value;
    const errorMessage = document.getElementById('error-message');
    
    if (!city || !role) {
        if (errorMessage) {
            errorMessage.textContent = 'Пожалуйста, выберите город и роль из списка';
            errorMessage.style.display = 'block';
        }
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone_number: USER_PHONE,
                name: name,
                city: city,
                role: role
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showDashboard(data.user);
        } else {
            if (errorMessage) {
                errorMessage.textContent = data.error || 'Ошибка регистрации';
                errorMessage.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        if (errorMessage) {
            errorMessage.textContent = 'Ошибка соединения с сервером';
            errorMessage.style.display = 'block';
        }
    }
}

function showDashboard(user) {
    document.getElementById('registration-form').style.display = 'none';
    document.getElementById('header').style.display = 'block';
    document.getElementById('dashboard').style.display = 'block';
    
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-city').textContent = user.city;
    document.getElementById('user-bonuses').textContent = user.bonuses;
    
    const roleNames = {
        'retail': 'Розничный покупатель',
        'professional': 'Строитель профессионал',
        'dealer': 'Дилер'
    };
    document.getElementById('user-role').textContent = roleNames[user.role] || user.role;
}

// ... (остальные функции showSection, showSubSection и т.д. остаются без изменений) ...
function showSection(sectionName) {
    navigationHistory.push(currentSection);
    currentSection = sectionName;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('header').style.display = 'none';
    document.getElementById('sections').style.display = 'block';
    
    const content = document.getElementById('section-content');
    if (sectionName === 'new-calculation') {
        content.innerHTML = `
            <h2>Новый расчет</h2>
            <div class="menu-grid">
                <button class="btn menu-btn" onclick="showSubSection('roof-calculation')">Расчет кровли</button>
                <button class="btn menu-btn" onclick="showSubSection('facade-calculation')">Расчет фасада</button>
            </div>
        `;
    } else {
        content.innerHTML = `<h2>${sectionName}</h2><p>В разработке...</p>`;
    }
}

function showSubSection(subSectionName) {
    navigationHistory.push(currentSection);
    currentSection = subSectionName;
    const content = document.getElementById('section-content');
    
    if (subSectionName === 'roof-calculation') {
        content.innerHTML = `
            <h2>Расчет кровли</h2>
            <div class="menu-grid">
                <button class="btn menu-btn" onclick="showUploadForm('Кровля', 'Металлочерепица')">Металлочерепица</button>
                <button class="btn menu-btn" onclick="showUploadForm('Кровля', 'Профнастил')">Профнастил</button>
            </div>
        `;
    } else if (subSectionName === 'facade-calculation') {
        content.innerHTML = `
            <h2>Расчет фасада</h2>
            <div class="menu-grid">
                <button class="btn menu-btn" onclick="showUploadForm('Фасад', 'Сайдинг')">Сайдинг</button>
            </div>
        `;
    }
}

function showUploadForm(calcType, material) {
    const content = document.getElementById('section-content');
    content.innerHTML = `
        <h2>Отправка размеров (${material})</h2>
        <form id="uploadForm" onsubmit="handleFileUpload(event)">
            <input type="hidden" name="calc_type" value="${calcType}">
            <input type="hidden" name="material" value="${material}">
            <div class="form-group">
                <label>Комментарий:</label>
                <textarea name="comment" rows="3" style="width:100%;"></textarea>
            </div>
            <div class="form-group">
                <label>Файл:</label>
                <input type="file" name="file" required>
            </div>
            <button type="submit" class="btn">Отправить</button>
        </form>
        <p id="upload-status"></p>
    `;
}

async function handleFileUpload(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const statusEl = document.getElementById('upload-status');
    
    // Берем данные из ЛК
    formData.append('user_name', document.getElementById('user-name').textContent);
    formData.append('user_city', document.getElementById('user-city').textContent);
    formData.append('user_phone', USER_PHONE); 

    statusEl.textContent = 'Отправка...';
    try {
        const response = await fetch(`${API_URL}/catalog/upload-request`, {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            statusEl.textContent = '✅ Отправлено!';
            statusEl.style.color = 'green';
        } else {
            throw new Error('Ошибка');
        }
    } catch (error) {
        statusEl.textContent = '❌ Ошибка отправки';
        statusEl.style.color = 'red';
    }
}

function goHome() {
    navigationHistory = [];
    currentSection = null;
    document.getElementById('sections').style.display = 'none';
    document.getElementById('header').style.display = 'block';
    document.getElementById('dashboard').style.display = 'block';
}

function goBack() {
    if (navigationHistory.length > 0) {
        const prev = navigationHistory.pop();
        currentSection = prev;
        if (!prev) goHome();
        else showSection(prev);
    } else {
        goHome();
    }
}