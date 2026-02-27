const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// ROTAS DE GAMES
router.get('/games', gameController.getGames);
router.get('/games/:id', gameController.getGameById);
router.post('/games', gameController.addGame);
router.delete('/games/:id', gameController.deleteGame);

module.exports = router;