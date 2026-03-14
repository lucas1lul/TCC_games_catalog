let jogosCompletos = [];
let usuarioLogado = null; 
let paginaAtual = 1;
const jogosPorPagina = 12;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Verificar Sessão (Aguarda a resposta do servidor)
  await verificarSessao();

  // 2. Carregar Jogos Iniciais
  carregarJogos();

  // Configuração dos Filtros
  const formFiltros = document.getElementById("filtros");
  if (formFiltros) {
    formFiltros.addEventListener("submit", (e) => {
      e.preventDefault();
      carregarJogos();
    });
  }

  // Eventos de clique nos Cards (Delegação de Eventos)
  const lista = document.getElementById("lista");
  if (lista) {
    lista.addEventListener("click", (e) => {
      const card = e.target.closest(".jogo-card");
      if (!card) return;

      const idJogo = Number(card.dataset.jogoId);
      if (!Number.isFinite(idJogo)) return;

      if (e.target.closest('[data-action="detalhes"]')) {
        abrirDetalhes(idJogo);
      } else if (e.target.closest('[data-action="favoritar"]')) {
        toggleFavorito(idJogo, e.target.closest('[data-action="favoritar"]'));
      }
    });
  }
});

async function verificarSessao() {
  try {
    const res = await fetch("/api/me", {
      credentials: "include",
      cache: "no-store"
    });

    if (res.ok) {
      const data = await res.json();
      usuarioLogado = data.user; 

      if (usuarioLogado) {
        const areaBoasVindas = document.getElementById("boasVindas");
        if (areaBoasVindas) {
          areaBoasVindas.textContent = `Olá, ${usuarioLogado.nome}!`;
        }
      }
    }
  } catch (e) {
    console.warn("Usuário não autenticado.");
    usuarioLogado = null;
  }
}

async function carregarJogos() {
  const lista = document.getElementById("lista");
  if (!lista) return;

  // Pegar valores dos filtros
  const nome = (document.getElementById("filtroNome")?.value || "").trim();
  const curso = (document.getElementById("filtroCurso")?.value || "").trim();
  const componente = (document.getElementById("filtroComponente")?.value || "").trim();
  const habilidade = (document.getElementById("filtroHabilidade")?.value || "").trim();
  const plataforma = (document.getElementById("filtroPlataforma")?.value || "").trim();

  paginaAtual = 1;
  jogosCompletos = [];
  lista.innerHTML = "Carregando resultados...";

  // Construir URL com parâmetros
  const params = new URLSearchParams();
  if (nome) params.set("nome", nome);
  if (curso) params.set("curso", curso);
  if (componente) params.set("componente", componente);
  if (habilidade) params.set("habilidade", habilidade);
  if (plataforma) params.set("plataforma", plataforma);

  const url = params.toString() ? `/api/games?${params.toString()}` : "/api/games";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

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
  }
}

function renderizarJogosDaPagina() {
  const lista = document.getElementById("lista");
  if (!lista) return;
  lista.innerHTML = "";

  const inicio = (paginaAtual - 1) * jogosPorPagina;
  const fim = inicio + jogosPorPagina;
  const jogosDaPagina = jogosCompletos.slice(inicio, fim);

  // Usa a variável global usuarioLogado definida lá no topo
  const favoritos = usuarioLogado?.favoritos || [];

  jogosDaPagina.forEach((jogo) => {
    // Chama a função global do arquivo jogoCard.js
    lista.innerHTML += window.renderJogoCard(jogo, { favoritos });
  });

  atualizarControlesPaginacao();
}

async function toggleFavorito(jogoId, elementoEstrela) {
  if (!usuarioLogado) {
    alert("Você precisa estar logado para favoritar!");
    return;
  }

  try {
    const response = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
      body: JSON.stringify({ jogoId: jogoId }),
    });

    const data = await response.json();

    if (response.ok) {
      elementoEstrela.classList.toggle("ativa");
      // Atualiza os favoritos na memória para não perder o estado ao mudar de página
      usuarioLogado.favoritos = data.favoritos; 
    } else {
      alert(data.error || "Erro ao favoritar");
    }
  } catch (error) {
    console.error("Erro ao favoritar:", error);
  }
}

function atualizarControlesPaginacao() {
  const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
  const btnAnterior = document.getElementById("btnAnterior");
  const btnProximo = document.getElementById("btnProximo");
  const infoPagina = document.getElementById("infoPagina");

  if (btnAnterior) btnAnterior.disabled = (paginaAtual === 1);
  if (btnProximo) btnProximo.disabled = (paginaAtual === totalPaginas || jogosCompletos.length === 0);
  if (infoPagina) {
    infoPagina.textContent = `Página ${totalPaginas === 0 ? 0 : paginaAtual} de ${totalPaginas}`;
  }
}

function mudarPagina(direcao) {
  const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
  const novaPagina = paginaAtual + direcao;
  if (novaPagina >= 1 && novaPagina <= totalPaginas) {
    paginaAtual = novaPagina;
    renderizarJogosDaPagina();
    document.getElementById("lista")?.scrollIntoView({ behavior: "smooth" });
  }
}

window.mudarPagina = mudarPagina;