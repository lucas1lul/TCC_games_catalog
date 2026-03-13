require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require("express-session");

const authRoutes = require('./src/routes/gameRoutes');
const userRoutes = require('./src/routes/userRoutes');
const avaliacaoRoutes = require("./src/routes/avaliacaoRoutes");

const app = express();

const PAGES_DIR = path.join(__dirname, 'src', 'view', 'pages');

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: "segredo-super-seguro-aqui",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true
  }
}));

// Static (CSS/JS/IMAGES)
app.use(express.static(path.join(__dirname, 'public')));

// desabilita cache/etag na API
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.disable("etag");

// API
app.use('/api', authRoutes);
app.use("/api", userRoutes);
app.use("/api", avaliacaoRoutes);

// Páginas (clean URLs)
app.get(['/', '/catalogo'], (req, res) => {
  res.sendFile(path.join(PAGES_DIR, 'catalogo.html'));
});
app.get('/catalogo', (req, res) => res.sendFile(path.join(PAGES_DIR, 'catalogo.html')));
app.get('/user', (req, res) => res.sendFile(path.join(PAGES_DIR, 'user.html')));
app.get('/login', (req, res) => res.sendFile(path.join(PAGES_DIR, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(PAGES_DIR, 'register.html')));
app.get('/my_game', (req, res) => res.sendFile(path.join(PAGES_DIR, 'my_games.html')));
app.get('/intro', (req, res) => res.sendFile(path.join(PAGES_DIR, 'introducao.html')));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servidor está rodando na porta ${PORT}`));

module.exports = app;
