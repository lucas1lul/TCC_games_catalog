// app.js
require('dotenv').config();
const express = require('express');
const authRoutes = require('./src/controllers/routes/jogoRoutes');
const cors = require('cors');
const path = require('path'); // Certifique-se de que está importado

const app = express();

app.use(cors());
app.use(express.json());

// --- Configuração para servir arquivos estáticos do frontend ---
// A pasta 'public' deve estar no mesmo nível que 'app.js'
app.use(express.static(path.join(__dirname, 'src', 'view', 'pages')));

// Opcional: Se você tiver CSS ou Imagens na pasta public, mantenha essa também:
app.use(express.static(path.join(__dirname, 'public')));

// --- Rotas da API (backend) ---
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});

module.exports = app;