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

// Маршрут для получения данных о праздниках
router.get('/', async (req, res) => {
  try {

  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
