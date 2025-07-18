const express = require('express');
const authRoutes = require('./routes/jogoRoutes');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/jogoRoutes', authRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});

module.exports = app;