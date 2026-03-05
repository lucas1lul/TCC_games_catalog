const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Sessão
router.post("/login", userController.login);
router.post("/register", userController.register);

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.json({ user: null });
  }

  res.json(req.session.user);
});

// Usuários
router.get("/usuarios", userController.listUsers);
router.get("/usuarios/me", userController.getMe);
router.put("/usuarios/me", userController.updateMe);

// Favoritos
router.post(
  "/favoritos",
  authMiddleware.isAuthenticated,
  userController.toggleFavorito
);
router.get(
  "/usuarios/:id/favoritos",
  authMiddleware.isAuthenticated,
  userController.getUserFavorites
);

module.exports = router;