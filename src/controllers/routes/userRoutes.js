const express = require('express');
const router = express.Router();
const userController = require('../userController');
const auth = require('../../middlewares/auth');

// Todas as rotas abaixo exigem estar logado
router.use(auth); 

// Renderiza a página user.ejs (que criamos antes)
router.get('/perfil', userController.showProfile); 

// Processa a atualização dos dados (email, senha, tipo)
router.post('/perfil/atualizar', userController.updateProfile);

// Listagem de usuários (talvez só para admin?)
router.get('/', userController.listUsers); 

module.exports = router;