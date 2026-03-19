const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require("../middlewares/authMiddleware");

// --- ROTAS PÚBLICAS ---
router.get('/games', gameController.getGames);
router.get('/games/:id', gameController.getGameById);

// --- ROTAS ADMIN ---
router.post(
  "/games",
  authMiddleware.isAuthenticated, // Adicionado para garantir login
  authMiddleware.authorizeRoles("administrador"),
  gameController.createGame
);

router.put(
  "/games/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("administrador"),
  gameController.updateGame
);

router.delete(
  "/games/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("administrador"),
  gameController.deleteGame
);

router.get(
  '/games/pending', 
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("administrador"), 
  gameController.listPending
);

router.put(
  '/games/:id/status', 
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("administrador"), 
  gameController.updateGameStatus
);

// --- ROTAS PROFISSIONAL TI (Corrigidas) ---
router.post(
  '/suggest', 
  authMiddleware.isAuthenticated, 
  authMiddleware.authorizeRoles('profissional_ti'), 
  gameController.sugerirJogo
);

router.get(
  '/my-suggestions', 
  authMiddleware.isAuthenticated, 
  authMiddleware.authorizeRoles('profissional_ti'), 
  gameController.listarMeusEnvios
);

module.exports = router;