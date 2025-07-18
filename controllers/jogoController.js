const bcrypt = require('bcrypt');

let usuarios = [];  // Nosso "banco fake"

// Apenas para testes, adicione alguns usuários iniciais para não começar vazio toda vez que o servidor reiniciar
// Em um sistema real, você teria um banco de dados persistente.
usuarios.push({ id: 1, nome: "Professor Teste", email: "professor@iff.com", senha: "$2b$10$abcdefghijklmnopqrstuv" }); // Senha hash genérica
usuarios.push({ id: 2, nome: "Aluno Teste", email: "aluno@iff.com", senha: "$2b$10$abcdefghijklmnopqrstuv" }); // Senha hash genérica
// Lembre-se: essas senhas não são válidas para login sem o bcrypt.compare real.
// Para testar login, você pode gerar um hash de uma senha real:
// console.log(bcrypt.hashSync("minhasenha123", 10)); e usar o hash gerado.


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
    senha: hash // Armazena o hash da senha
  };

  usuarios.push(novoUsuario);

  res.status(201).json({ mensagem: 'Usuário registrado!', usuario: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email } });
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

// NOVA FUNÇÃO: Listar todos os usuários (para fins de teste/administração)
exports.listUsers = (req, res) => {
    // Retorna os usuários sem o hash da senha por segurança!
    const usersWithoutPassword = usuarios.map(u => ({
        id: u.id,
        nome: u.nome,
        email: u.email
    }));
    res.status(200).json(usersWithoutPassword);
};

// Adicionei isso apenas para que você possa registrar um usuário de teste e saber a senha.
// REMOVA EM PRODUÇÃO!
// exports.testHash = async (req, res) => {
//     const { senha } = req.body;
//     const hash = await bcrypt.hash(senha, 10);
//     res.json({ hash });
// };