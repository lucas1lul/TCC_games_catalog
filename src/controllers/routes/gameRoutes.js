const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas Públicas (Qualquer um vê o catálogo?)
router.get('/', gameController.getAllGames);
router.get('/:id', gameController.getGameById);

// Rotas Protegidas (Só quem está logado pode adicionar/deletar?)
router.post('/', authMiddleware, gameController.addGame);
router.put('/:id', authMiddleware, gameController.updateGame);
router.delete('/:id', authMiddleware, gameController.deleteGame);

module.exports = router;