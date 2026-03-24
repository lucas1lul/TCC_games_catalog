const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Sessão
router.post("/login", userController.login);
router.post("/register", userController.register);
router.post("/logout", userController.logout);

router.get("/me", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.json({ user: null });
  }

  // Envolvemos em um objeto 'user' para bater com seu fetch
  res.json({ user: req.session.user });
});

// Usuários
router.get("/usuarios", userController.listUsers);
router.get("/usuarios/me", userController.getMe);
router.put("/usuarios/me", userController.updateMe);
router.put("/usuarios/me/senha", authMiddleware.isAuthenticated, userController.updateMyPassword);

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

// --- Gerenciamento Administrativo ---
router.get("/admin/users", authMiddleware.isAuthenticated, userController.listAllUsersAdmin);

router.put("/admin/users/:id", authMiddleware.isAuthenticated, userController.updateUserAdmin);

module.exports = router;