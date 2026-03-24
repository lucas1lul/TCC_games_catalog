// /js/components/jogoCard.js

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.renderJogoCard = function renderJogoCard(jogo, options = {}) {
  const {
    favoritos = [],
    mostrarEstrela = true,
    mostrarBotaoDetalhes = true,
    // NOVO: Opção para controlar a exibição da avaliação no card
    mostrarAvaliacao = true, 
    mostrarLink = true,
    getImagem
  } = options;

  const id = Number(jogo.IDJOGO);
  
  // Normalizamos os IDs dos favoritos para números para garantir a comparação
  const listaFavoritosNumerica = favoritos.map(f => Number(f));
  const classeAtiva = listaFavoritosNumerica.includes(id) ? "ativa" : "";
  
  const urlImg = jogo.LINKIMAGEM ? `/images/${jogo.LINKIMAGEM}` : `/images/placeholder.png`;
  const nome = escapeHtml(jogo.NOME || "Sem título");
  const interacao = escapeHtml(jogo.COMPONENTES || "N/A");
  const descricao = escapeHtml(jogo.IDIOMA || "N/A");
  const habilidadeTxt = escapeHtml(jogo.HABILIDADES_CODIGOS || "N/A");
  const plataformaTxt = escapeHtml(jogo.PLATAFORMA_DESCRICAO || "N/A");
  const link = jogo.LINK || "";

  // NOVO: Lógica para calcular as estrelas dinâmicas
  // Supomos que o objeto 'jogo' agora traga 'MEDIA_AVALIACAO' do backend
  const media = parseFloat(jogo.MEDIA_AVALIACAO) || 0;
  
  // Calculamos a porcentagem de preenchimento (ex: nota 3.5 vira 70%)
  const percentualEstrelas = (media / 5) * 100;
  
  // Texto formatado da nota (ex: "3.5" ou "S/N" se não houver nota)
  const notaFormatada = media > 0 ? media.toFixed(1) : "S/N";

  // Criamos o HTML da avaliação separadamente para organizar
  const avaliacaoHtml = mostrarAvaliacao ? `
    <div class="container-avaliacao-card" data-action="avaliar" title="Nota Pedagógica: ${notaFormatada}/5 (Clique para avaliar)">
      <div class="estrelas-dinamicas-card" style="--percent: ${percentualEstrelas}%">
        ★★★★★
      </div>
      <span class="nota-texto-card">(${notaFormatada})</span>
    </div>
  ` : '';

  return `
  <div class="jogo-card" data-jogo-id="${id}">
    
    <div class="card-image-container">
      <img src="${urlImg}" alt="${nome}" class="jogo-img">
    </div>

    <div class="card-content">
      <h2 class="jogo-titulo">${nome}</h2>

      <span class="jogo-componente">${interacao}</span>

      <p class="jogo-descricao">
        🌐 ${descricao}
      </p>

      <div class="detalhes-grid">
        <div><strong>Habilidades:</strong> ${habilidadeTxt}</div>
        <div><strong>Plataformas:</strong> ${plataformaTxt}</div>
      </div>
    </div>

    <div class="card-footer">
      <div class="footer-icons">
        ${mostrarEstrela ? `<span class="estrela-favorito ${classeAtiva}" data-action="favoritar">❤</span>` : ''}
        ${mostrarBotaoDetalhes ? `<button class="btn-icon" data-action="detalhes">🔍</button>` : ''}
      </div>

      ${avaliacaoHtml}

      ${mostrarLink ? `<a href="${link || "#"}" target="_blank" class="btn-acessar">${link ? "Acessar" : "Indisponível"}</a>` : ''}
    </div>
  </div>
`;
};