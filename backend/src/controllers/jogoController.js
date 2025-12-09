const bcrypt = require('bcrypt');

let usuarios = [];  // Nosso "banco fake"
let games = [];  // SEMPRE um array!

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

// --- CONTATAR DESENVOLVEDOR ---
exports.contactDeveloper = (req, res) => {
    console.log("Mensagem enviada ao dev:", req.body);
    res.json({ mensagem: "Mensagem enviada ao desenvolvedor!" });
};

const { readGames, saveGames } = require('../models/gamesModel');

// --- LISTAR JOGOS COM FILTROS ---
exports.getGames = (req, res) => {
    try {
        const games = readGames();  // SEMPRE lê do arquivo
        const { curso, componente, nivel, habilidade, plataforma } = req.query;

        let resultados = games;

        if (curso) {
            resultados = resultados.filter(j => j.curso?.toLowerCase().includes(curso.toLowerCase()));
        }
        if (componente) {
            resultados = resultados.filter(j => j.componente?.toLowerCase().includes(componente.toLowerCase()));
        }
        if (nivel) {
            resultados = resultados.filter(j => j.nivel?.toLowerCase().includes(nivel.toLowerCase()));
        }
        if (habilidade) {
            resultados = resultados.filter(j => j.habilidade?.toLowerCase().includes(habilidade.toLowerCase()));
        }
        if (plataforma) {
            resultados = resultados.filter(j => j.plataforma?.toLowerCase().includes(plataforma.toLowerCase()));
        }

        res.status(200).json(resultados);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao listar jogos" });
    }
};

// --- DETALHES DO JOGO ---
exports.getGameById = (req, res) => {
    try {
        const games = readGames();
        const game = games.find(g => g.id == req.params.id);

        if (!game) return res.status(404).json({ mensagem: "Jogo não encontrado" });

        res.json(game);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao obter jogo" });
    }
};

// --- CADASTRAR JOGO ---
exports.addGame = (req, res) => {
    try {
        const games = readGames();

        const novo = {
            id: Date.now(),
            nome: req.body.nome,
            descricao: req.body.descricao,
            curso: req.body.curso,
            componente: req.body.componente,
            habilidades: req.body.habilidades,
            plataforma: req.body.plataforma,
            link: req.body.link,
            desenvolvedor_email: req.body.desenvolvedor_email,
            imagem: req.body.imagem
        };

        games.push(novo);
        saveGames(games);

        res.status(201).json({ mensagem: "Jogo cadastrado com sucesso", jogo: novo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao cadastrar jogo" });
    }
};

exports.deleteGame = (req, res) => {
    try {
        let games = readGames();
        const id = req.params.id;

        const existe = games.find(g => g.id == id);
        if (!existe) {
            return res.status(404).json({ mensagem: "Jogo não encontrado" });
        }

        games = games.filter(g => g.id != id);

        saveGames(games);

        res.status(200).json({ mensagem: "Jogo deletado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao deletar jogo" });
    }
};

