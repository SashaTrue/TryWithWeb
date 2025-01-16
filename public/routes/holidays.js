// routes/holidays.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const path = require('path');

require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Маршрут для получения списка всех праздников
// Маршрут для получения списка всех праздников
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        // Добавляем ORDER BY для гарантированного порядка
        const query = `
            SELECT h.id, h.title, h.description, h.category,
            COALESCE(array_agg(hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images
            FROM holidays h
            LEFT JOIN holiday_images hi ON h.id = hi.holiday_id
            GROUP BY h.id
            ORDER BY h.id ASC
            LIMIT \$1 OFFSET $2;
        `;

        // Логируем параметры запроса
        console.log('Параметры запроса:', { limit, offset, page });

        const result = await pool.query(query, [limit, offset]);

        // Логируем результат
        console.log('Полученные данные:', {
            количество_записей: result.rows.length,
            записи: result.rows
        });

        const countResult = await pool.query('SELECT COUNT(*) AS total FROM holidays;');
        const total = parseInt(countResult.rows[0].total, 10);

        // Логируем общую информацию
        console.log('Общая информация:', {
            всего_записей: total,
            текущая_страница: page,
            всего_страниц: Math.ceil(total / limit)
        });

        res.json({
            holidays: result.rows,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для удаления праздника по ID
router.delete('/:id', async (req, res) => {
    const holidayId = parseInt(req.params.id, 10);
    if (!holidayId) {
        return res.status(400).send('Invalid holiday ID');
    }

    try {
        // Удаляем связанные изображения
        await pool.query('DELETE FROM holiday_images WHERE holiday_id = $1', [holidayId]);

        // Удаляем сам праздник
        const result = await pool.query('DELETE FROM holidays WHERE id = $1 RETURNING *', [holidayId]);

        if (result.rowCount === 0) {
            return res.status(404).send('Holiday not found');
        }

        res.status(200).send('Holiday deleted successfully');
    } catch (error) {
        console.error('Ошибка при удалении праздника:', error);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;