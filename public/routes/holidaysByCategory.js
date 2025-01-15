// routes/holidaysByCategory.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT h.id, h.title, h.description, h.category,
                   h.celebration_date,
                   COALESCE(array_agg(hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images
            FROM holidays h
                     LEFT JOIN holiday_images hi ON h.id = hi.holiday_id
            GROUP BY h.id
            ORDER BY h.category, h.celebration_date;
        `;
        const result = await pool.query(query);

        // Группировка по категориям
        const holidaysByCategory = result.rows.reduce((acc, holiday) => {
            const category = holiday.category || 'Без категории';
            if (!acc[category]) acc[category] = [];
            acc[category].push({
                id: holiday.id,
                title: holiday.title,
                description: holiday.description,
                images: holiday.images,
                date: holiday.celebration_date,
            });
            return acc;
        }, {});

        // Генерация HTML
        let html = `
            <!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Holy Days - По категориям</title>
  <link rel="stylesheet" href="../stylesheets/style.css">
</head>
<body>
<nav class="navbar">
  <a href="/" class="logo">
    <img src="../images/logo/SaintChel.png" alt="Holy Days Icon">
    <span>Holy Days</span>
  </a>
</nav>

<div class="nav-container">
  <div class="nav-links">
    <a href="/holidays-by-date">По дате</a>
    <a href="/holidays-by-category">По категориям</a>
  </div>
</div>

<div class="content">`;

        Object.keys(holidaysByCategory).forEach(category => {
            html += `
                <div class="categories">
                    <h1 class="category-title">${category}</h1>
                    <div class="category-grid">
            `;
            holidaysByCategory[category].forEach(holiday => {
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
        <script>
          // Обработчик клика на мероприятие
          function showHolidayDetails(holidayId) {
              window.location.href = \`/holiday-details?id=\${holidayId}\`;
          }
        </script>
      </body>
      </html>
        `;

        // Отправка готового HTML
        res.send(html);
    } catch (error) {
        console.error('Ошибка при формировании HTML:', error);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
