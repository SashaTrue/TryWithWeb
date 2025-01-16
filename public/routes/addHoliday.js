const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const date = new Date().toISOString().slice(0, 10);
        const dir = path.join(__dirname, '..', 'images', 'user', date);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неверный формат файла'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/', async (req, res) => {
    try {
        // Отправляем HTML форму для добавления праздника
        res.sendFile(path.join(__dirname, '..', 'pages', 'add_holiday.html'));
    } catch (error) {
        console.error('Ошибка при формировании страницы:', error);
        res.status(500).send('Ошибка сервера');
    }
});

router.post('/', upload.array('images'), async (req, res) => {
    try {
        console.log('Received fields:', req.body);
        console.log('Received files:', req.files);

        const {
            title,
            description,
            traditions,
            celebration_date,
            interesting_facts,
            category,
        } = req.body;

        if (!title || !description || !category || !celebration_date) {
            return res.status(400).json({ success: false, message: 'Необходимы обязательные поля: title, description, category, celebration_date' });
        }

        const title_slug = title.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const holidayResult = await client.query(
                'INSERT INTO holidays (title, title_slug, description, traditions, celebration_date, interesting_facts, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [title, title_slug, description, traditions, celebration_date, interesting_facts, category]
            );

            const holidayId = holidayResult.rows[0].id;

            if (req.files && req.files.length > 0) {
                const date = new Date().toISOString().slice(0, 10);
                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    const imagePath = `/images/user/${date}/${file.filename}`;
                    await client.query(
                        'INSERT INTO holiday_images (holiday_id, image_url, display_order) VALUES ($1, $2, $3)',
                        [holidayId, imagePath, i + 1]
                    );
                }
            }

            await client.query('COMMIT');
            res.status(201).json({ success: true, holidayId });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Ошибка при добавлении праздника:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при сохранении праздника: ' + error.message
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Ошибка на сервере:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера: ' + error.message
        });
    }
});

router.post('/', upload.array('images'), async (req, res) => {
    try {
        console.log('Received fields:', req.body);
        console.log('Received files:', req.files);

        const {
            title,
            description,
            traditions,
            celebration_date,
            interesting_facts,
            category,
        } = req.body;

        if (!title || !description || !category || !celebration_date) {
            return res.status(400).json({ success: false, message: 'Необходимы обязательные поля: title, description, category, celebration_date' });
        }

        const title_slug = title.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const holidayResult = await client.query(
                'INSERT INTO holidays (title, title_slug, description, traditions, celebration_date, interesting_facts, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [title, title_slug, description, traditions, celebration_date, interesting_facts, category]
            );

            const holidayId = holidayResult.rows[0].id;

            if (req.files && req.files.length > 0) {
                const date = new Date().toISOString().slice(0, 10);
                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    const imagePath = `/images/user/${date}/${file.filename}`;
                    await client.query(
                        'INSERT INTO holiday_images (holiday_id, image_url, display_order) VALUES ($1, $2, $3)',
                        [holidayId, imagePath, i + 1]
                    );
                }
            }

            await client.query('COMMIT');
            res.status(201).json({ success: true, holidayId });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Ошибка при добавлении праздника:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при сохранении праздника: ' + error.message
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Ошибка на сервере:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера: ' + error.message
        });
    }
});


module.exports = router;