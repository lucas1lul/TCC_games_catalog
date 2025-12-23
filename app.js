// app.js
const express = require('express');
const session = require('express-session');
const authRoutes = require('./src/controllers/routes/authRoutes');
const userRoutes = require('./src/controllers/routes/userRoutes');
const gameRoutes = require('./src/controllers/routes/gameRoutes');
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

app.use(session({
    secret: 'tcc-games-secret',
    resave: false,
    saveUninitialized: false
}));

// Definindo os prefixos das URLs
app.use('/', authRoutes);      // Acessa /login, /register
app.use('/users', userRoutes); // Acessa /users/perfil, /users/lista
app.use('/games', gameRoutes); // Acessa /games, /games/1

// Rota Home
app.get('/', (req, res) => {
    res.redirect('/games'); // Redireciona para o catálogo ao abrir o site
});

// --- Rotas da API (backend) ---
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});

module.exports = app;