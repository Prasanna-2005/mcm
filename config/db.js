const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.db_HOST,
  user: process.env.db_USER,
  port:process.env.db_PORT,
  password: process.env.db_PASSWORD,
  database: process.env.db_NAME
});

module.exports = pool;
