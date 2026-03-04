const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Sessão
router.post("/login", userController.login);
router.post("/register", userController.register);

// Usuários
router.get("/usuarios", userController.listUsers);
router.get("/usuarios/me", userController.getMe);
router.put("/usuarios/me", userController.updateMe);

// Favoritos
router.post("/favoritos", userController.toggleFavorito);
router.get("/usuarios/:id/favoritos", userController.getUserFavorites);

module.exports = router;