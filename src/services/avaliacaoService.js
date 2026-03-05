const { randomUUID } = require("crypto");
const avaliacaoRepository = require("../repositories/avaliacaoRepository");

exports.getAvaliacoesByGame = (jogoId) => {
  const all = avaliacaoRepository.findByGameId(jogoId);

  const total = all.length;
  const media = total
    ? all.reduce((s, a) => s + Number(a.nota || 0), 0) / total
    : 0;

  all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    jogoId: Number(jogoId),
    total,
    media: Number(media.toFixed(2)),
    comentarios: all.map(a => ({
      usuarioNome: a.usuarioNome,
      nota: a.nota,
      comentario: a.comentario,
      createdAt: a.createdAt
    }))
  };
};

exports.createAvaliacao = ({ jogoId, usuarioId, usuarioNome, nota, comentario }) => {
  const nJogo = Number(jogoId);
  const nUsuario = Number(usuarioId);
  const nNota = Number(nota);

  if (!nJogo || !nUsuario || !usuarioNome) {
    throw new Error("Dados obrigatórios ausentes.");
  }

  if (!Number.isFinite(nNota) || nNota < 1 || nNota > 5) {
    throw new Error("Nota deve ser de 1 a 5.");
  }

  const nova = {
    id: randomUUID(),
    jogoId: nJogo,
    usuarioId: nUsuario,
    usuarioNome: String(usuarioNome).slice(0, 60),
    nota: nNota,
    comentario: String(comentario || "").slice(0, 500),
    createdAt: new Date().toISOString()
  };

  return avaliacaoRepository.save(nova);
};