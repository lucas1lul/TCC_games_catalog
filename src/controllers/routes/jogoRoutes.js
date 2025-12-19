const express = require('express');
const router = express.Router();
const jogoController = require('./jogoController');

//ROTAS DE SESSÃO
router.post('/login', jogoController.login);
router.post('/register', jogoController.register);

//ROTAS DE USUÁRIO
router.get('/users', jogoController.listUsers);
router.post('/contact', jogoController.contactDeveloper);

//ROTAS DE JOGOS
router.get('/games', jogoController.getGames);
router.get('/games/:id', jogoController.getGameById);
router.post('/games', jogoController.addGame);
router.delete('/games/:id', jogoController.deleteGame);



module.exports = router;