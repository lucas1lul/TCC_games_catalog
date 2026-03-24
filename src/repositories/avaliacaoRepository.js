const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "..", "models", "avaliacoes.json");

/**
 * Garante que o diretório e o arquivo existam para evitar erros de 'File not found'
 */
function ensureDbFile() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, "[]", "utf-8");
    }
  } catch (error) {
    console.error("Erro ao garantir existência do arquivo de avaliações:", error);
  }
}

function readDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    // Se o arquivo estiver vazio, retorna um array vazio
    const data = JSON.parse(raw || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erro ao ler banco de avaliações (JSON):", error);
    return [];
  }
}

function writeDb(data) {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao escrever no banco de avaliações:", error);
  }
}

/**
 * Busca todas as avaliações de um jogo específico
 */
exports.findByGameId = (jogoId) => {
  const db = readDb();
  // Usamos Number() em ambos os lados para garantir a comparação correta
  return db.filter(a => Number(a.jogoId) === Number(jogoId));
};

/**
 * Salva uma nova avaliação no arquivo
 */
exports.save = (avaliacao) => {
  const db = readDb();
  
  // Adiciona um timestamp se não houver, útil para ordenar avaliações depois
  const novaAvaliacao = {
    ...avaliacao,
    dataCriacao: avaliacao.dataCriacao || new Date().toISOString()
  };

  db.push(novaAvaliacao);
  writeDb(db);
  return novaAvaliacao;
};

exports.findByUserId = (usuarioId) => {
  const db = readDb();
  // Filtra as avaliações onde o usuarioId coincide
  return db.filter(a => Number(a.usuarioId) === Number(usuarioId));
};