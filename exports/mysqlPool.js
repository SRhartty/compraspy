require('dotenv').config();
const mysql = require('mysql');

// Cria um pool de conexões
exports.pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});