const fs = require("fs");
const path = require("path");

const USERS_PATH = path.join(__dirname, "../../data/users.json");

function readUsers() {
  const raw = fs.readFileSync(USERS_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

exports.getMe = (req, res) => {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ message: "id inválido" });

  const users = readUsers();
  const user = users.find(u => u.id === id);

  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  // não devolver senha
  const { senha, ...safe } = user;
  res.json(safe);
};

exports.updateMe = (req, res) => {
  const { id, nome, email, senhaAtual, novaSenha } = req.body;
  const userId = Number(id);

  if (!userId) return res.status(400).json({ message: "id inválido" });
  if (!nome || !email) return res.status(400).json({ message: "nome e email são obrigatórios" });

  const users = readUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ message: "Usuário não encontrado" });

  // valida email duplicado
  const emailEmUso = users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId);
  if (emailEmUso) return res.status(409).json({ message: "Este e-mail já está em uso." });

  // troca senha (opcional)
  if (senhaAtual || novaSenha) {
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ message: "Para alterar a senha, informe senhaAtual e novaSenha." });
    }
    if (users[idx].senha !== senhaAtual) {
      return res.status(401).json({ message: "Senha atual incorreta." });
    }
    if (String(novaSenha).length < 6) {
      return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
    }
    users[idx].senha = novaSenha;
  }

  users[idx].nome = nome;
  users[idx].email = email;

  writeUsers(users);

  res.json({ message: "ok" });
};
