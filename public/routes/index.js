// Подключение необходимых библиотек
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Загружаем переменные окружения из .env файла
require('dotenv').config();

// Создаём подключение к базе данных PostgreSQL с использованием Pool
const pool = new Pool({
  user: process.env.DB_USER,        // Имя пользователя для базы данных
  host: process.env.DB_HOST,        // Хост базы данных
  database: process.env.DB_NAME,    // Имя базы данных
  password: process.env.DB_PASSWORD, // Пароль для доступа к базе данных
  port: process.env.DB_PORT,        // Порт для подключения к базе данных
});

// Маршрут для получения данных о праздниках
router.get('/', async (req, res) => {
  try {
    // Здесь будет логика для извлечения данных о праздниках из базы данных
    // Пример:
    // const result = await pool.query('SELECT * FROM holidays');
    // res.json(result.rows);
  } catch (error) {
    // Обработка ошибок при запросе к базе данных
    console.error('Ошибка при получении данных:', error);
    res.status(500).send('Ошибка сервера');
  }
});

// Экспортируем маршруты для использования в основном приложении
module.exports = router;
