const express = require('express');
const router = express.Router();
const jogoController = require('../controllers/jogoController');

router.post('/login', jogoController.login);
router.post('/register', jogoController.register);
router.get('/users', jogoController.listUsers);

module.exports = router;