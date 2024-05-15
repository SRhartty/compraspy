var mysql      = require('mysql');
require('dotenv').config();

exports.connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
});


    