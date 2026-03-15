// Variáveis globais
let meusJogosOriginais = [];
let jogosFiltrados = [];
let usuarioLogado = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificar a sessão
    await verificarSessao();

    if (!usuarioLogado) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = "/login"; 
        return;
    }

    // Atualizar displays de perfil
    const nomeEl = document.getElementById("nomeDisplay");
    const perfilEl = document.getElementById("perfilDisplay");
    if (nomeEl) nomeEl.textContent = usuarioLogado.nome || "";
    if (perfilEl) perfilEl.textContent = usuarioLogado.perfil || "";

    configurarInterfacePorPerfil((usuarioLogado.perfil || "").toLowerCase());

    // Listeners de filtro
    document.getElementById("filtroStatus")?.addEventListener("change", filtrarMeusJogos);
    document.getElementById("filtroCurso")?.addEventListener("input", filtrarMeusJogos);

    // Delegação de clique nos cards
    const container = document.getElementById("listaFavoritos");
    if (container) {
        container.addEventListener("click", (e) => {
            const card = e.target.closest(".jogo-card");
            if (!card) return;

            const idJogo = Number(card.dataset.jogoId);
            if (!Number.isFinite(idJogo)) return;

            // Ação de Detalhes
            if (e.target.closest('[data-action="detalhes"]')) {
                if (typeof window.abrirDetalhes === "function") window.abrirDetalhes(idJogo);
            } 
            // Ação de Favoritar/Desfavoritar (O coração/estrela)
            else if (e.target.closest('[data-action="favoritar"]')) {
                toggleFavorito(idJogo, e.target.closest('[data-action="favoritar"]'));
            }
        });
    }

    // 2. Carregar os dados
    carregarMeusDados();
});

async function verificarSessao() {
    try {
        const res = await fetch('/api/me', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'no-cache' }
        });
        if (!res.ok) { usuarioLogado = null; return; }
        const data = await res.json();
        usuarioLogado = (data && data.user && data.user.id) ? data.user : null;
    } catch (e) {
        console.error("Erro na comunicação com o servidor:", e);
        usuarioLogado = null;
    }
}

async function carregarMeusDados() {
    const container = document.getElementById("listaFavoritos");
    if (container) container.innerHTML = "Carregando seus favoritos...";

    try {
        const responseFav = await fetch(`/api/usuarios/${usuarioLogado.id}/favoritos`, {
            credentials: 'include'
        });
        
        if (!responseFav.ok) throw new Error("Falha ao carregar favoritos");

        meusJogosOriginais = await responseFav.json() || [];
        jogosFiltrados = [...meusJogosOriginais];

        if (meusJogosOriginais.length === 0) {
            container.innerHTML = "<p>Você ainda não favoritou nenhum jogo. ❤️</p>";
            return;
        }

        renderizarJogos(jogosFiltrados);
    } catch (error) {
        console.error("Erro ao carregar meus jogos:", error);
        if (container) container.innerHTML = '<p style="color:red">❌ Erro ao carregar favoritos.</p>';
    }
}

function renderizarJogos(lista) {
    const container = document.getElementById("listaFavoritos");
    if (!container) return;
    container.innerHTML = "";

    const favoritos = usuarioLogado?.favoritos || [];

    lista.forEach((jogo) => {
        // Usa a função do jogoCard.js
        container.innerHTML += window.renderJogoCard(jogo, {
            favoritos,
            mostrarEstrela: true,
            mostrarBotaoDetalhes: true,
            mostrarLink: true,
        });
    });
}

async function toggleFavorito(jogoId, elementoEstrela) {
    try {
        const response = await fetch("/api/favoritos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ jogoId }) 
        });

        const data = await response.json();

        if (response.ok) {
            // Sincroniza a sessão local com o servidor
            usuarioLogado.favoritos = data.favoritos;

            const listaIds = (data.favoritos || []).map(Number);
            const aindaFavoritado = listaIds.includes(Number(jogoId));

            // Se desfavoritou, remove o card da tela
            if (!aindaFavoritado) {
                meusJogosOriginais = meusJogosOriginais.filter((j) => Number(j.IDJOGO) !== Number(jogoId));
                filtrarMeusJogos(); 
            }
        }
    } catch (error) {
        console.error("Erro ao favoritar:", error);
    }
}

function filtrarMeusJogos() {
    const status = document.getElementById("filtroStatus")?.value || "tudo";
    const busca = (document.getElementById("filtroCurso")?.value || "").toLowerCase().trim();

    jogosFiltrados = meusJogosOriginais.filter((jogo) => {
        const matchStatus = status === "tudo" || status === "favoritados" || (status === "avaliados" && jogo.isAvaliado);
        const nome = (jogo.NOME || "").toLowerCase();
        const matchTexto = !busca || nome.includes(busca);
        return matchStatus && matchTexto;
    });

    renderizarJogos(jogosFiltrados);
}

function configurarInterfacePorPerfil(perfil) {
    const secaoProfessor = document.getElementById("secaoProfessor");
    if (!secaoProfessor) return;
    secaoProfessor.style.display = (perfil.includes("professor") || perfil.includes("administrador")) ? "block" : "none";
}

function logout() {
    // Agora o logout deve ser feito via API para limpar a sessão no servidor
    fetch('/api/logout', { method: 'POST', credentials: 'include' })
        .then(() => window.location.href = "/catalogo.html");
}

window.logout = logout;