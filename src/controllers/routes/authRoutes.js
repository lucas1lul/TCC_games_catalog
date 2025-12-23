const express = require('express');
const router = express.Router();
const authController = require('../authController'); // Controller específico
const bcrypt = require('bcrypt');
const { readUsers, saveUsers } = require('../../models/usersModel');

router.get('/login', authController.loginPage);      // Renderiza a página de login
router.post('/login', authController.loginAuth);     // Processa o login (POST)
router.get('/register', authController.registerPage);// Renderiza página de registro
router.post('/register', authController.registerAuth); // Cria o usuário
router.get('/logout', authController.logout);        // Destrói a sessão

module.exports = router;