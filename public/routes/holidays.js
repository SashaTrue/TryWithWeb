// routes/holidays.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const path = require('path');

// Загрузка переменных окружения из .env файла
require('dotenv').config();

// Инициализация подключения к базе данных PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Маршрут для получения списка всех праздников
router.get('/', async (req, res) => {
    try {
        // SQL-запрос для получения праздников с изображениями
        const query = `
            SELECT h.id, h.title, h.description, h.category,
                   COALESCE(array_agg(hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images
            FROM holidays h
                     LEFT JOIN holiday_images hi ON h.id = hi.holiday_id
            GROUP BY h.id;
        `;
        // Выполнение запроса к базе данных
        const result = await pool.query(query);

        // Подготовка данных для отображения в интерфейсе
        const holidays = result.rows.map(holiday => ({
            id: holiday.id, // Добавляем id для использования в ссылках
            title: holiday.title,
            description: holiday.description,
            category: holiday.category,
            images: holiday.images, // Список изображений для каждого праздника
        }));

        // Формирование HTML для отображения списка праздников с изображениями
        let html = `
            <div class="categories">
                <h1 class="category-title">Праздники</h1>
                <div class="category-grid">`;

        // Проход по каждому празднику и добавление HTML для его отображения
        holidays.forEach(holiday => {
            html += `
                <div class="category-item" onclick="showHolidayDetails(${holiday.id})">
                    <h2>${holiday.title}</h2>
                    <!-- Отображение изображения праздника, если оно есть -->
                    ${holiday.images.length > 0 && holiday.images[0].length > 0 ?
                `<img class="category-image" src="${holiday.images[0]}" alt="${holiday.title}">` :
                `<img class="category-image" src="./images/default-image.png" alt="${holiday.title}">`
            }
                </div>
            `;
        });

        // Закрытие HTML-контейнеров
        html += `</div></div>`;

        // Отправка готового HTML-кода в ответ на запрос
        res.send(html);
    } catch (error) {
        // Обработка ошибок при запросе к базе данных
        console.error('Ошибка при получении данных:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Экспорт маршрута для использования в основном приложении
module.exports = router;
