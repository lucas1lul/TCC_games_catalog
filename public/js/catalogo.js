// catalogo.js
document.addEventListener('DOMContentLoaded', () => {
  carregarJogos();
  const usuarioSessao = localStorage.getItem('usuarioLogado');

  const formFiltros = document.getElementById("filtros");
  if (formFiltros) {
    formFiltros.addEventListener("submit", (e) => {
      e.preventDefault(); // ⛔ evita recarregar a página
      carregarJogos();    // ✅ executa filtragem
    });
  }

  if (usuarioSessao) {
    const usuario = JSON.parse(usuarioSessao);
    const header = document.querySelector('h1');
    const saudacao = document.createElement('p');
    saudacao.style.fontSize = '1rem';
    saudacao.style.color = '#555';
    header.insertAdjacentElement('afterend', saudacao);
  }
});

let jogosCompletos = [];
let paginaAtual = 1;
const jogosPorPagina = 12;

async function carregarJogos() {
  const curso = document.getElementById("filtroCurso").value.trim();
  const componente = document.getElementById("filtroComponente").value.trim();
  const habilidade = document.getElementById("filtroHabilidade").value.trim();
  const plataforma = document.getElementById("filtroPlataforma").value.trim();

  const lista = document.getElementById("lista");

  paginaAtual = 1;
  jogosCompletos = [];
  lista.innerHTML = "Carregando resultados...";

  // ✅ Se não tiver filtro, busca tudo
  const params = new URLSearchParams();
  if (curso) params.set("curso", curso);
  if (componente) params.set("componente", componente);
  if (habilidade) params.set("habilidade", habilidade);
  if (plataforma) params.set("plataforma", plataforma);

  const url = params.toString() ? `/api/games?${params.toString()}` : "/api/games";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro HTTP! Status: ${res.status}`);

    jogosCompletos = await res.json();

    if (!Array.isArray(jogosCompletos) || jogosCompletos.length === 0) {
      lista.innerHTML = "⚠️ Nenhum jogo encontrado.";
      atualizarControlesPaginacao();
      return;
    }

    renderizarJogosDaPagina();
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    lista.innerHTML = "❌ Erro ao carregar dados.";
    atualizarControlesPaginacao();
  }
}

function renderizarJogosDaPagina() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const inicio = (paginaAtual - 1) * jogosPorPagina;
  const fim = inicio + jogosPorPagina;
  const jogosDaPagina = jogosCompletos.slice(inicio, fim);

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const favoritos = usuarioLogado?.favoritos || [];

  jogosDaPagina.forEach((jogo) => {
    const classeAtiva = favoritos.includes(jogo.IDJOGO) ? "ativa" : "";

    // Imagem: se não houver LINKIMAGEM, usa placeholder
    const urlImg = jogo.LINKIMAGEM ? `/images/${jogo.LINKIMAGEM}` : "/images/placeholder.png";

    // Campos adicionais (com fallbacks para nomes diferentes no JSON)
    const habilidadeTxt = jogo.HABILIDADES_CODIGOS || "N/A";
    const plataformaTxt = jogo.PLATAFORMA_DESCRICAO || "N/A";
    const componenteTxt = jogo.COMPONENTES || jogo.COMPONENTES_DESCRICAO || "N/A";



    // Para o botão de detalhes (evita quebrar HTML por aspas)
    const jogoJson = JSON.stringify(jogo)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, "&quot;");

    lista.innerHTML += `
      <div class="jogo-card">
        <div class="card-image-container">
          <img src="${urlImg}" alt="${jogo.NOME || "Jogo"}" class="jogo-img">
        </div>

        <div class="card-content">
          <div class="card-header-info">
            <h2 class="jogo-titulo">${jogo.NOME || "Sem título"}</h2>
            <span class="jogo-componente">INTERAÇÃO: ${jogo.INTERACAO || "N/A"}</span>
          </div>

          <div class="card-body">
            <p class="jogo-descricao">${jogo.DESCRICAOIMAGEM || "Sem descrição disponível."}</p>

            <div class="detalhes-grid">
              <p class="detalhe-item"><strong>Habilidades:</strong> ${habilidadeTxt}</p>
              <p class="detalhe-item"><strong>Plataformas:</strong> ${plataformaTxt}</p>
              <p class="detalhe-item completo"><strong>Componentes:</strong> ${componenteTxt}</p>
            </div>
          </div>

          <div class="card-footer" style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <span class="estrela-favorito ${classeAtiva}"
                  onclick="toggleFavorito(${jogo.IDJOGO}, this)"
                  aria-label="Favoritar jogo"
                  title="Favoritar">★</span>

            <button class="btn-ver-mais" onclick="abrirDetalhes(${jogo.IDJOGO})">🔍 Detalhes</button>

            <a href="${jogo.LINK || "#"}"
               target="_blank"
               rel="noopener noreferrer"
               class="btn-acessar"
               style="flex:1; text-align:right;">
              ${jogo.LINK ? "Acessar jogo" : "Link indisponível"}
            </a>
          </div>
        </div>
      </div>
    `;
  });

  atualizarControlesPaginacao();
}

// ... (Mantenha as funções mudarPagina e atualizarControlesPaginacao iguais) ...

function mudarPagina(direcao) {
  const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
  const novaPagina = paginaAtual + direcao;
  if (novaPagina >= 1 && novaPagina <= totalPaginas) {
    paginaAtual = novaPagina;
    renderizarJogosDaPagina();
    document.getElementById("lista").scrollIntoView({ behavior: 'smooth' });
  }
}

function atualizarControlesPaginacao() {
  const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProximo = document.getElementById('btnProximo');
  const infoPagina = document.getElementById('infoPagina');

  if (btnAnterior) btnAnterior.disabled = paginaAtual === 1;
  if (btnProximo) btnProximo.disabled = paginaAtual === totalPaginas || jogosCompletos.length === 0;
  if (infoPagina) infoPagina.textContent = `Página ${totalPaginas === 0 ? 0 : paginaAtual} de ${totalPaginas}`;
}

async function toggleFavorito(jogoId, elementoEstrela) {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuarioLogado) {
    alert("Você precisa estar logado para favoritar!");
    return;
  }

  try {
    const response = await fetch('/api/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: usuarioLogado.id,
        jogoId: jogoId
      })
    });

    const data = await response.json();

    if (response.ok) {
      elementoEstrela.classList.toggle('ativa');
      // Atualiza o localStorage com o novo IDJOGO vindo do SQL
      usuarioLogado.favoritos = data.favoritos;
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    }
  } catch (error) {
    console.error("Erro ao favoritar no banco SQL:", error);
  }
}

window.abrirDetalhes = async function abrirDetalhes(idJogo) {
  const modal = document.getElementById("modalDetalhes");
  if (!modal) {
    console.error("Não achei o modalDetalhes no HTML.");
    return;
  }

  // abre modal
  modal.style.display = "block";

  // helper para setar texto com fallback
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (!el) {
      console.warn("Elemento não encontrado:", id);
      return;
    }
    el.textContent = (v == null || v === "") ? "N/A" : String(v);
  };

  // placeholders
  set("modalTitulo", "Carregando...");
  set("modalHabilidades", "Carregando...");
  set("modalGenero", "Carregando...");
  set("modalIdioma", "Carregando...");
  set("modalPlataforma", "Carregando...");
  set("modalLicenca", "Carregando...");
  set("modalInteracao", "Carregando...");

  // imagem placeholder
  const imgEl = document.getElementById("modalImg");
  if (imgEl) imgEl.src = "/images/placeholder.png";

  try {
    const res = await fetch(`/api/games/${idJogo}`);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
    const jogo = await res.json();

    // título
    set("modalTitulo", jogo.NOME);

    // campos do seu JSON
    set("modalHabilidades", jogo.HABILIDADES_CODIGOS);
    set("modalPlataforma", jogo.PLATAFORMA_DESCRICAO);
    set("modalIdioma", jogo.IDIOMA);
    set("modalLicenca", jogo.LICENSA);
    set("modalInteracao", jogo.INTERACAO);

    // gênero não vem no seu endpoint agora
    set("modalGenero", jogo.GENERO_DESCRICAO || "N/A");

    // imagem do jogo
    if (imgEl) {
      imgEl.src = jogo.LINKIMAGEM ? `/images/${jogo.LINKIMAGEM}` : "/images/placeholder.png";
      imgEl.alt = jogo.NOME || "Capa do Jogo";
    }

  } catch (err) {
    console.error(err);
    set("modalTitulo", "Erro ao carregar");
    set("modalHabilidades", "Erro ao carregar");
    set("modalGenero", "Erro ao carregar");
    set("modalIdioma", "Erro ao carregar");
    set("modalPlataforma", "Erro ao carregar");
    set("modalLicenca", "Erro ao carregar");
    set("modalInteracao", "Erro ao carregar");
  }
};

function fecharModal() {
  const modal = document.getElementById("modalDetalhes");
  if (modal) modal.style.display = "none";
}

// fecha ao clicar fora do conteúdo
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modalDetalhes");
  if (modal && e.target === modal) modal.style.display = "none";
});

