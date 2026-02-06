require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/controllers/routes/jogoRoutes');
const userRoutes = require('./src/controllers/routes/userRoutes');

const app = express();

const PAGES_DIR = path.join(__dirname, 'src', 'view', 'pages');

app.use(cors());
app.use(express.json());

// Static (CSS/JS/IMAGES)
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/api', authRoutes);
app.use('/api', userRoutes);

// Páginas (clean URLs)
app.get('/', (req, res) => res.sendFile(path.join(PAGES_DIR, 'index.html')));
app.get('/catalogo', (req, res) => res.sendFile(path.join(PAGES_DIR, 'catalogo.html')));
app.get('/user', (req, res) => res.sendFile(path.join(PAGES_DIR, 'user.html')));
app.get('/login', (req, res) => res.sendFile(path.join(PAGES_DIR, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(PAGES_DIR, 'register.html')));
app.get('/my_game', (req, res) => res.sendFile(path.join(PAGES_DIR, 'my_games.html')));
app.get('/intro', (req, res) => res.sendFile(path.join(PAGES_DIR, 'introducao.html')));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servidor está rodando na porta ${PORT}`));

module.exports = app;
