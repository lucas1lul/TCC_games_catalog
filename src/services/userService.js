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

exports.getMe = (usuarioId) => {
  const user = userRepository.findById(usuarioId);

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return user;
};

exports.updateMe = (usuarioId, data) => {
  const updatedUser = userRepository.update(usuarioId, data);

  if (!updatedUser) {
    throw new Error('Usuário não encontrado');
  }

  return updatedUser;
};

exports.toggleFavorito = async (usuarioId, jogoId) => {

  const user = await userRepository.findById(usuarioId);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  if (!user.favoritos) {
    user.favoritos = [];
  }

  const jogoIdNumber = Number(jogoId);
  const jaFavoritado = user.favoritos.includes(jogoIdNumber);

  if (jaFavoritado) {
    user.favoritos = user.favoritos.filter(id => id !== jogoIdNumber);
  } else {
    user.favoritos.push(jogoIdNumber);
  }

  await userRepository.update(usuarioId, { favoritos: user.favoritos });

  return user.favoritos;
};

exports.getUserFavorites = async (usuarioId) => {

  const user = await userRepository.findById(Number(usuarioId));

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  if (!Array.isArray(user.favoritos) || user.favoritos.length === 0) {
    return [];
  }

  const todosJogos = await gameRepository.findAll();

  const favoritos = todosJogos.filter(jogo =>
    user.favoritos.includes(Number(jogo.IDJOGO))
  );

  return favoritos;
};