require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão
connection.getConnection((err, conn) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err.message);
  } else {
    console.log("Conectado ao MySQL com sucesso!");
    conn.release();
  }
});

module.exports = connection;
