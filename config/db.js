const mysql = require("mysql2/promise");
console.log("DB_HOST:", process.env.db_HOST);
console.log("DB_PORT:", process.env.db_PORT);

const pool = mysql.createPool({
  host: process.env.db_HOST,
  user: process.env.db_USER,
  port:process.env.db_PORT,
  password: process.env.db_PASSWORD,
  database: process.env.db_NAME,
  waitForConnections: true
});

module.exports = pool;
