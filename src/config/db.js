const mysql = require('mysql2');

const connection = mysql.createPool({ // Usar Pool é melhor para servidores web
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'jogosdb',  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão
connection.getConnection((err, conn) => {
    if (err) console.error("Erro ao conectar no MySQL:", err);
    else {
        console.log("Conectado ao MySQL com sucesso!");
        conn.release();
    }
});

module.exports = connection;