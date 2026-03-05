const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "..", "models", "avaliacoes.json");

function ensureDbFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf-8");
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const data = JSON.parse(raw || "[]");
  return Array.isArray(data) ? data : [];
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

exports.findByGameId = (jogoId) => {
  const db = readDb();
  return db.filter(a => Number(a.jogoId) === Number(jogoId));
};

exports.save = (avaliacao) => {
  const db = readDb();
  db.push(avaliacao);
  writeDb(db);
  return avaliacao;
};