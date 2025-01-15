const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Загрузка переменных окружения из .env файла
require('dotenv').config();

// Создание подключения к базе данных PostgreSQL с использованием переменных окружения
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Массив с названиями месяцев для использования в группировке праздников
const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель',
    'Май', 'Июнь', 'Июль', 'Август',
    'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Маршрут для получения списка праздников
router.get('/', async (req, res) => {
    try {
        // SQL запрос для получения праздников с изображениями, если они есть
        const query = `
            SELECT h.id, h.title, h.description, h.category,
                   h.celebration_date,
                   COALESCE(array_agg(hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images
            FROM holidays h
                     LEFT JOIN holiday_images hi ON h.id = hi.holiday_id
            GROUP BY h.id
            ORDER BY celebration_date;
        `;
        const result = await pool.query(query); // Выполнение запроса к базе данных

        // Группировка праздников по месяцам
        const holidaysByMonth = result.rows.reduce((acc, holiday) => {
            const monthIndex = new Date(holiday.celebration_date).getMonth();
            const monthName = MONTHS[monthIndex];
            if (!acc[monthName]) acc[monthName] = []; // Если месяца нет, создаем его
            acc[monthName].push({
                id: holiday.id,
                title: holiday.title,
                description: holiday.description,
                category: holiday.category,
                images: holiday.images,
                date: holiday.celebration_date,
            });
            return acc;
        }, {});

        // Генерация HTML страницы с праздниками
        let html = `
            <!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Holy Days - главная</title>
  <link rel="icon" href="../favicon.svg" type="image/x-icon">
  <link rel="stylesheet" href="../stylesheets/style.css">
</head>
<body>

<nav class="navbar">
  <a href="/" class="logo">
    <img src="../images/logo/SaintChel.png" alt="Holy Days Icon">
    <span>Holy Days</span>
  </a>
  <!-- Кнопка входа через GitHub или кнопка с никнеймом -->
  <a id="auth-btn" href="/auth/github" class="github-login-btn">Войти через GitHub</a>
</nav>

<div class="nav-container">
  <div class="nav-links">
    <a href="/holidays-by-date">По дате</a>
    <a href="/holidays-by-category">По категориям</a>
  </div>
</div>`;

        // Добавление праздников по месяцам в HTML
        Object.keys(holidaysByMonth).forEach(month => {
            html += `
                <div class="categories">
                    <h1 class="category-title">${month}</h1>
                    <div class="category-grid">
            `;
            holidaysByMonth[month].forEach(holiday => {
                html += `
                    <div class="category-item" onclick="showHolidayDetails(${holiday.id})">
                        <h2>${holiday.title}</h2>
                        ${holiday.images.length > 0 ?
                    `<img class="category-image" src="${holiday.images[0]}" alt="${holiday.title}">` :
                    `<img class="category-image" src="./images/default-image.png" alt="${holiday.title}">`
                }
                        <p>${holiday.description || ''}</p>
                        <small>${new Date(holiday.date).toLocaleDateString('ru-RU')}</small>
                    </div>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        });

        html += `
        </div>
        <script src="../javascripts/common.js">
          
        </script>
      </body>
      </html>
        `;

        // Отправка готового HTML на клиентскую сторону
        res.send(html);
    } catch (error) {
        console.error('Ошибка при формировании HTML:', error); // Логирование ошибок
        res.status(500).send('Ошибка сервера'); // Отправка сообщения об ошибке
    }
});

// Экспорт маршрута для использования в основном приложении
module.exports = router;
