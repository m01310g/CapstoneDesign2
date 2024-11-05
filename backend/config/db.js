const mysql = require('mysql2/promise');
require('dotenv').config();

// db 연결 설정
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'co_n'
});

module.exports = db;