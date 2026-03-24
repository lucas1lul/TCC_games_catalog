const { randomUUID } = require("crypto");
const avaliacaoRepository = require("../repositories/avaliacaoRepository");
const jogoRepository = require("../repositories/gameRepository");

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

exports.getJogosAvaliadosPorUsuario = async (usuarioId) => {
    const nUsuario = Number(usuarioId);
    if (!nUsuario) return [];

    const avaliacoes = avaliacaoRepository.findByUserId(nUsuario);
    if (!avaliacoes || avaliacoes.length === 0) return [];

    // Usamos Promise.all porque o findById é assíncrono (MySQL)
    return Promise.all(avaliacoes.map(async (a) => {
        try {
            const infoJogo = await jogoRepository.findById(a.jogoId);
            
            return {
                IDJOGO: a.jogoId,
                NOME: infoJogo ? infoJogo.NOME : "Jogo não encontrado",
                LINKIMAGEM: infoJogo ? infoJogo.LINKIMAGEM : "placeholder.png",
                COMPONENTES: infoJogo ? infoJogo.COMPONENTES : "N/A",
                IDIOMA: infoJogo ? infoJogo.IDIOMA : "N/A",
                HABILIDADES_CODIGOS: infoJogo ? infoJogo.HABILIDADES_CODIGOS : "N/A",
                PLATAFORMA_DESCRICAO: infoJogo ? infoJogo.PLATAFORMA_DESCRICAO : "N/A",
                LINK: infoJogo ? infoJogo.LINK : "#",
                MEDIA_AVALIACAO: a.nota, // Nota que veio do JSON
                isAvaliado: true
            };
        } catch (err) {
            console.error(`Erro ao buscar jogo ${a.jogoId}:`, err);
            return null; // Evita que um erro em um jogo derrube a lista toda
        }
    })).then(results => results.filter(r => r !== null)); // Remove itens que deram erro
};

exports.getMediasAgrupadas = () => {
  const all = avaliacaoRepository.readDb(); // Use a função que lê o JSON todo
  const medias = {};

  all.forEach(av => {
    if (!medias[av.jogoId]) {
      medias[av.jogoId] = { soma: 0, qtd: 0 };
    }
    medias[av.jogoId].soma += Number(av.nota);
    medias[av.jogoId].qtd += 1;
  });

  // Transforma em um objeto simples { id: media }
  Object.keys(medias).forEach(id => {
    medias[id] = Number((medias[id].soma / medias[id].qtd).toFixed(1));
  });

  return medias;
};

exports.getNotasPessoaisDoUsuario = (usuarioId) => {
    // Filtra o JSON apenas pelo ID do usuário usando o repositório existente
    return avaliacaoRepository.findByUserId(usuarioId);
};