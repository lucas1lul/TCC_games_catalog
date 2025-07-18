const bcrypt = require('bcrypt');

let usuarios = [];  // Nosso "banco fake"

exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  // Verifica se já existe
  const existe = usuarios.find(u => u.email === email);
  if (existe) {
    return res.status(409).json({ mensagem: 'Email já registrado!' });
  }

  const hash = await bcrypt.hash(senha, 10);

  const novoUsuario = {
    id: usuarios.length + 1,
    nome,
    email,
    senha: hash
  };

  usuarios.push(novoUsuario);

  res.status(201).json({ mensagem: 'Usuário registrado!', usuario: novoUsuario });
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
  }

  const match = await bcrypt.compare(senha, usuario.senha);
  if (!match) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
  }

  res.status(200).json({ mensagem: 'Login bem-sucedido!', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
};
