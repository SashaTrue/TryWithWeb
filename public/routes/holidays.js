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
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1; // Номер страницы
        const limit = parseInt(req.query.limit, 10) || 10; // Количество элементов на странице
        const offset = (page - 1) * limit;

        // SQL-запрос с пагинацией
        const query = `
            SELECT h.id, h.title, h.description, h.category,
                   COALESCE(array_agg(hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images
            FROM holidays h
                     LEFT JOIN holiday_images hi ON h.id = hi.holiday_id
            GROUP BY h.id
            LIMIT $1 OFFSET $2;
        `;
        const result = await pool.query(query, [limit, offset]);

        // Запрос для подсчета общего количества праздников
        const countResult = await pool.query('SELECT COUNT(*) AS total FROM holidays;');
        const total = parseInt(countResult.rows[0].total, 10);

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


module.exports = router;