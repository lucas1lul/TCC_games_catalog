const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require("../middlewares/authMiddleware");

// ==========================================
// 1. ROTAS ESPECÍFICAS (Sempre em cima)
// ==========================================

router.get('/games', gameController.getGames);

// NOVA ROTA DE BUSCA DE HABILIDADES
// Ela deve ficar aqui para não ser confundida com /games/:id
router.get('/habilidades/search', gameController.searchHabilidades);

router.get(
  '/games/pending', 
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("administrador"), 
  gameController.listPending
);

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

// ==========================================
// 2. ROTAS COM PARÂMETROS DINÂMICOS (:id)
// ==========================================

// Agora o Express só cai aqui se a URL não bater com as de cima
router.get('/games/:id', gameController.getGameById);

router.put(
  '/games/:id/status', 
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("administrador"), 
  gameController.updateGameStatus
);

router.post(
  "/games",
  authMiddleware.isAuthenticated, 
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

module.exports = router;