// src/controllers/avaliacaoController.js
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const DB_FILE = path.join(__dirname, "..", "models", "avaliacoes.json");

function ensureDbFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf-8");
}

function readDb() {
  try {
    ensureDbFile();
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET /api/games/:id/avaliacoes
// Retorna média + total + comentários (mais recente -> mais antigo)
exports.getAvaliacoesByGame = (req, res) => {
  const jogoId = Number(req.params.id);
  const all = readDb().filter(a => Number(a.jogoId) === jogoId);

  const total = all.length;
  const media = total ? (all.reduce((s, a) => s + Number(a.nota || 0), 0) / total) : 0;

  // mais recente primeiro
  all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    jogoId,
    total,
    media: Number(media.toFixed(2)),
    comentarios: all.map(a => ({
      usuarioNome: a.usuarioNome,
      nota: a.nota,
      comentario: a.comentario,
      createdAt: a.createdAt
    }))
  });
};

// POST /api/avaliacoes
// body: { jogoId, usuarioId, usuarioNome, nota, comentario }
exports.postAvaliacao = (req, res) => {
  const { jogoId, usuarioId, usuarioNome, nota, comentario } = req.body || {};

  const nJogo = Number(jogoId);
  const nUsuario = Number(usuarioId);
  const nNota = Number(nota);

  if (!nJogo || !nUsuario || !usuarioNome) {
    return res.status(400).json({ mensagem: "Dados obrigatórios ausentes." });
  }
  if (!Number.isFinite(nNota) || nNota < 1 || nNota > 5) {
    return res.status(400).json({ mensagem: "Nota deve ser de 1 a 5." });
  }

  const db = readDb();

  const nova = {
    id: randomUUID(),
    jogoId: nJogo,
    usuarioId: nUsuario,
    usuarioNome: String(usuarioNome).slice(0, 60),
    nota: nNota,
    comentario: String(comentario || "").slice(0, 500),
    createdAt: new Date().toISOString()
  };

  db.push(nova);
  writeDb(db);

  res.status(201).json({ ok: true });
};
