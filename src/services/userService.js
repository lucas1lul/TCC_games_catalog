const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const gameRepository = require('../repositories/gameRepository');


exports.register = async ({ nome, email, senha }) => {
  const existingUser = userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const newUser = userRepository.create({
    nome,
    email,
    senha: hashedPassword,
    perfil: 'usuario'
  });

  return newUser;
};

exports.login = async ({ email, senha }) => {
  const user = userRepository.findByEmail(email);

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const isMatch = await bcrypt.compare(senha, user.senha);

  if (!isMatch) {
    throw new Error('Senha incorreta');
  }

  return user;
};

exports.getMe = (userId) => {
  const user = userRepository.findById(userId);

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return user;
};

exports.updateMe = (userId, data) => {
  const updatedUser = userRepository.update(userId, data);

  if (!updatedUser) {
    throw new Error('Usuário não encontrado');
  }

  return updatedUser;
};

exports.toggleFavorito = (usuarioId, jogoId) => {
  const user = userRepository.findById(userId);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const gameIdNumber = Number(gameId);

  const alreadyFavorited = user.favoritos.includes(gameIdNumber);

  if (alreadyFavorited) {
    user.favoritos = user.favoritos.filter(id => id !== gameIdNumber);
  } else {
    user.favoritos.push(gameIdNumber);
  }

  userRepository.update(userId, { favoritos: user.favoritos });

  return user.favoritos;
};

exports.getUserFavorites = async (userId) => {
  const user = userRepository.findById(userId);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  if (!user.favoritos.length) {
    return [];
  }

  const games = await Promise.all(
    user.favoritos.map(id => gameRepository.findById(id))
  );

  return games.filter(game => game !== undefined);
};