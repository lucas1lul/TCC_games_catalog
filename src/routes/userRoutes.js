const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Sessão
router.post("/login", userController.login);
router.post("/register", userController.register);

// Usuários
router.get("/users", userController.listUsers);
router.get("/users/me", userController.getMe);
router.put("/users/me", userController.updateMe);

// Favoritos
router.post("/favoritos", userController.toggleFavorito);
router.get("/usuarios/:id/favoritos", userController.getUserFavorites);

module.exports = router;