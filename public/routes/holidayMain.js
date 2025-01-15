const express = require('express'); // Подключаем Express
const fs = require('fs'); // Подключаем модуль для работы с файловой системой
const path = require('path'); // Подключаем модуль для работы с путями
const { Client } = require('pg'); // Подключаем клиент для работы с PostgreSQL
const router = express.Router(); // Создаём новый роутер

require('dotenv').config(); // Подключаем переменные окружения из файла .env

// Настройка подключения к базе данных PostgreSQL
const client = new Client({
    user: process.env.DB_USER, // Имя пользователя
    host: process.env.DB_HOST, // Хост базы данных
    database: process.env.DB_NAME, // Имя базы данных
    password: process.env.DB_PASSWORD, // Пароль пользователя
    port: process.env.DB_PORT, // Порт для подключения
});

client.connect(); // Устанавливаем соединение с базой данных

// Маршрут для получения данных о празднике
router.get('/', (req, res) => {
    const holidayId = req.query.id; // Получаем ID праздника из параметров запроса

    // Запрос для получения данных о празднике по ID
    const holidayQuery = `
        SELECT title, category, description, traditions, celebration_date, interesting_facts
        FROM holidays
        WHERE id = $1;
    `;

    // Запрос для получения изображений праздника
    const imagesQuery = `
        SELECT image_url
        FROM holiday_images
        WHERE holiday_id = $1
        ORDER BY display_order;
    `;

    // Выполнение запроса для получения данных праздника
    client.query(holidayQuery, [holidayId], (err, result) => {
        if (err) {
            console.error('Ошибка при запросе данных праздника:', err);
            return res.status(500).send('Ошибка сервера');
        }

        if (result.rows.length === 0) {
            return res.status(404).send('Праздник не найден');
        }

        const holidayData = result.rows[0]; // Извлекаем данные о празднике из результата

        // Выполнение запроса для получения изображений
        client.query(imagesQuery, [holidayId], (err, imagesResult) => {
            if (err) {
                console.error('Ошибка при запросе данных изображений:', err);
                return res.status(500).send('Ошибка сервера');
            }

            // Создаём список изображений
            const images = imagesResult.rows.map(row => row.image_url);

            // Путь к основному HTML шаблону
            const holidayMainPath = path.join(__dirname, '../pages/holydayMain.html');

            // Чтение HTML файла как строки
            fs.readFile(holidayMainPath, 'utf-8', (err, data) => {
                if (err) {
                    console.error('Ошибка при чтении файла:', err);
                    return res.status(500).send('Ошибка сервера');
                }

                // Заменяем плейсхолдеры на реальные данные
                let pageContent = data;
                pageContent = pageContent.replace('{{holidayTitle}}', holidayData.title);
                pageContent = pageContent.replace('{{holidayCategory}}', holidayData.category);
                pageContent = pageContent.replace('{{holidayDescription}}', holidayData.description);

                pageContent = pageContent.replace('{{holidayTraditional}}', holidayData.traditions);
                pageContent = pageContent.replace('{{holidayDate}}', holidayData.celebration_date);
                pageContent = pageContent.replace('{{holidayFact}}', holidayData.interesting_facts);

                // Формируем HTML для слайдера изображений
                let imageHTML = '';
                images.forEach(imageUrl => {
                    imageHTML += `<img src="${imageUrl}" alt="Holiday Image">`;
                });
                pageContent = pageContent.replace('<div class="slider-images" id="sliderImages"></div>', `<div class="slider-images" id="sliderImages">${imageHTML}</div>`);

                // Отправляем обновлённую HTML-страницу с данными о празднике и изображениями
                res.send(pageContent);
            });
        });
    });
});

module.exports = router; // Экспортируем роутер
