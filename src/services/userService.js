const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const gameRepository = require('../repositories/gameRepository');


exports.register = async ({ nome, email, senha, perfil }) => {
  const existingUser = userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Este e-mail já está cadastrado no sistema.');
  }

  const perfisPermitidos = ['aluno', 'profissional_ti', 'professor'];
  
  let perfilFinal = 'aluno'; 
  if (perfil && perfisPermitidos.includes(perfil.toLowerCase())) {
    perfilFinal = perfil.toLowerCase();
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const newUser = userRepository.createUser({
    nome,
    email,
    senha: hashedPassword,
    perfil: perfilFinal
  });

  const { senha: _, ...userWithoutPassword } = newUser;
  
  return userWithoutPassword;
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

// --- MÉTODOS DE ADMINISTRAÇÃO ---

exports.getAllUsers = () => {
    // Retorna todos os usuários do JSON via repository
    return userRepository.findAll();
};

exports.adminUpdateUser = async (usuarioId, data) => {
    const user = userRepository.findById(usuarioId);
    if (!user) throw new Error("Usuário não encontrado.");

    // Validação de perfis permitidos no sistema
    const perfisValidos = ['aluno', 'profissional_ti', 'professor', 'administrador'];
    
    const updateData = {
        nome: data.nome || user.nome,
        email: data.email || user.email
    };

    if (data.perfil && perfisValidos.includes(data.perfil.toLowerCase())) {
        updateData.perfil = data.perfil.toLowerCase();
    }

    // Salva no JSON
    const updatedUser = userRepository.update(usuarioId, updateData);
    
    // Remove a senha antes de retornar
    const { senha, ...safeUser } = updatedUser;
    return safeUser;
};