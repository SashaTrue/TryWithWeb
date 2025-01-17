const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Настройка подключения к базе данных
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});



// Маршрут для рендеринга HTML
router.get('/', async (req, res) => {
    const holidayId = req.query.id;

    try {
        // Получаем данные о празднике
        const holidayQuery = `
            SELECT id, title, description, traditions, celebration_date, interesting_facts, category
            FROM holidays
            WHERE id = $1
        `;
        const holidayResult = await pool.query(holidayQuery, [holidayId]);

        if (holidayResult.rows.length === 0) {
            return res.status(404).send('<h1>Праздник не найден</h1>');
        }

        const holiday = holidayResult.rows[0];

        const formattedDate = new Date(holiday.celebration_date).toISOString().split('T')[0];




        // Получаем изображения праздника
        const imagesQuery = `
            SELECT image_url, caption
            FROM holiday_images
            WHERE holiday_id = $1
            ORDER BY display_order
        `;
        const imagesResult = await pool.query(imagesQuery, [holidayId]);

        const imagesHtml = imagesResult.rows
            .map(image => `
        <div style="position: relative; display: inline-block; margin: 10px;">
            <img src="${image.image_url}" alt="${image.caption}" style="max-width: 150px; height: auto; display: block; border: 1px solid #ddd; border-radius: 4px;">
            <button 
                style="position: absolute; top: -10px; right: -10px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;" 
                onclick="deleteImage(${holidayId}, ${image.id})">
                ×
            </button>
        </div>
    `)
            .join('');



        // Рендеринг HTML
        const html = `
        <!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Редактирование праздника</title>
    <link rel="icon" href="../favicon.svg" type="image/x-icon">
    <link rel="stylesheet" href="../stylesheets/style.css">
    <style>
        .holiday-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
        }

        .image-slider {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px dashed #ddd;
            padding: 20px;
        }

        .holiday-info {
            display: flex;
            flex-direction: column;
            gap: 20px;
            border: 2px dashed #ddd;
            padding: 20px;
        }

        .holiday-info label {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .holiday-info input,
        .holiday-info textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .info-item {
            border: 2px dashed #ddd;
            padding: 20px;
        }

        .info-item label {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .info-item input,
        .info-item textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .submit-btn {
            background: #4a90e2;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }

        .submit-btn:hover {
            background: #357abd;
        }
    </style>
</head>

<nav class="navbar">
    <a href="/" class="logo">
        <img src="../images/logo/SaintChel.png" alt="Holy Days Icon">
        <span>Holy Days</span>
    </a>
    <a id="auth-btn" href="/auth/github" class="github-login-btn">Войти через GitHub</a>
</nav>
<div class="nav-container">
    <div class="nav-links">
        <a href="/holidays-by-date">По дате</a>
        <a href="/holidays-by-category">По категориям</a>
    </div>
</div>
        <body>
            <main class="holiday-container">
    <form id="addHolidayForm" enctype="multipart/form-data" onsubmit="submitForm(event)">
    <div class="image-slider">
    ${imagesHtml}
    <label for="images">Загрузите изображения:</label>
    <input type="file" id="images" name="images" multiple accept="image/*">
    <div id="uploaded-images"></div>
</div>

        <div class="holiday-info">
            <label for="title">Название праздника:</label>
            <input type="text" id="title" name="title" value="${holiday.title}" required>
            <label for="category">Категория:</label>
            <input type="text" id="category" name="category" value="${holiday.category}" required>
            <label for="description">Описание:</label>
            <input id="description" name="description" value="${holiday.description}" required></input>
        </div>
        <div class="additional-info">
            <h2>Дополнительная информация</h2>
            <div class="info-grid">
                <div class="info-item">
                    <label for="traditions">Традиции:</label>
                    <input id="traditions" name="traditions" value="${holiday.traditions}"></input>
                </div>
                <div class="info-item">
                    <label for="celebration_date">Дата празднования:</label>
                    <input type="date" id="celebration_date" name="celebration_date" value="${formattedDate}" required>
                </div>
                <div class="info-item">
                    <label for="interesting_facts">Интересные факты:</label>
                    <input id="interesting_facts" name="interesting_facts" value="${holiday.interesting_facts}"></textarea>
                </div>
            </div>
        </div>
        <button type="submit" class="submit-btn">Сохранить праздник</button>
    </form>
</main>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Ошибка при получении данных о празднике:', error);
        res.status(500).send('<h1>Внутренняя ошибка сервера</h1>');
    }
});

module.exports = router;
