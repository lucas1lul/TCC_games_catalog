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

    // Delegação de clique nos cards (Centraliza Detalhes, Favoritar e Avaliar)
    const container = document.getElementById("listaFavoritos");
    if (container) {
        container.addEventListener("click", (e) => {
            const card = e.target.closest(".jogo-card");
            if (!card) return;

            const idJogo = Number(card.dataset.jogoId);
            if (!Number.isFinite(idJogo)) return;

            // Ação: Detalhes
            if (e.target.closest('[data-action="detalhes"]')) {
                if (typeof window.abrirDetalhes === "function") window.abrirDetalhes(idJogo);
            } 
            // Ação: Favoritar/Desfavoritar
            else if (e.target.closest('[data-action="favoritar"]')) {
                toggleFavorito(idJogo, e.target.closest('[data-action="favoritar"]'));
            }
            // Ação: Avaliar (Estrelas do Card)
            else if (e.target.closest('[data-action="avaliar"]')) {
                const nomeJogo = card.querySelector(".jogo-titulo")?.textContent || "Jogo";
                if (typeof window.abrirModalAvaliar === "function") {
                    window.abrirModalAvaliar(idJogo, nomeJogo);
                }
            }
        });
    }

    // 2. Carregar os dados (Favoritos + Avaliados se for professor)
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
    if (container) container.innerHTML = "Carregando seus dados...";

    try {
        // Busca favoritos
        const resFav = await fetch(`/api/usuarios/${usuarioLogado.id}/favoritos`, { credentials: 'include' });
        const favoritos = await resFav.json() || [];

        // Busca avaliados (apenas para perfil professor)
        let avaliados = [];
        if (usuarioLogado.perfil === 'professor') {
            const resAval = await fetch(`/api/usuarios/${usuarioLogado.id}/avaliados`, { credentials: 'include' });
            avaliados = await resAval.json() || [];
        }

        // Mescla as listas sem duplicar jogos que estão em ambas
        const mapaGeral = new Map();
        
        favoritos.forEach(j => mapaGeral.set(j.IDJOGO, { ...j, isFavorito: true }));
        avaliados.forEach(j => {
            const existente = mapaGeral.get(j.IDJOGO);
            mapaGeral.set(j.IDJOGO, { ...(existente || j), isAvaliado: true });
        });

        meusJogosOriginais = Array.from(mapaGeral.values());
        
        if (meusJogosOriginais.length === 0) {
            container.innerHTML = "<p>Você ainda não possui interações registradas. ❤️</p>";
            return;
        }

        filtrarMeusJogos();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if (container) container.innerHTML = '<p style="color:red">❌ Erro ao carregar dados.</p>';
    }
}

function renderizarJogos(lista) {
    const container = document.getElementById("listaFavoritos");
    if (!container) return;
    container.innerHTML = "";

    const favoritosIds = usuarioLogado?.favoritos || [];

    lista.forEach((jogo) => {
        container.innerHTML += window.renderJogoCard(jogo, {
            favoritos: favoritosIds,
            mostrarEstrela: true,
            mostrarBotaoDetalhes: true,
            mostrarLink: true,
        });
    });
}

function filtrarMeusJogos() {
    const status = document.getElementById("filtroStatus")?.value || "tudo";
    const busca = (document.getElementById("filtroCurso")?.value || "").toLowerCase().trim();

    jogosFiltrados = meusJogosOriginais.filter((jogo) => {
        const matchStatus = 
            status === "tudo" || 
            (status === "favoritados" && jogo.isFavorito) || 
            (status === "avaliados" && jogo.isAvaliado);

        const nome = (jogo.NOME || "").toLowerCase();
        const matchTexto = !busca || nome.includes(busca);

        return matchStatus && matchTexto;
    });

    renderizarJogos(jogosFiltrados);
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
            usuarioLogado.favoritos = data.favoritos;
            const listaIds = (data.favoritos || []).map(Number);
            const aindaFavoritado = listaIds.includes(Number(jogoId));

            // Se o usuário desfavoritou e está no filtro de favoritos, remove o card
            if (!aindaFavoritado) {
                // Atualiza o estado local do objeto
                const jogo = meusJogosOriginais.find(j => Number(j.IDJOGO) === Number(jogoId));
                if (jogo) jogo.isFavorito = false;
                
                // Se não for nem favorito nem avaliado, remove da lista original
                if (jogo && !jogo.isAvaliado) {
                    meusJogosOriginais = meusJogosOriginais.filter(j => Number(j.IDJOGO) !== Number(jogoId));
                }
                filtrarMeusJogos(); 
            }
        }
    } catch (error) {
        console.error("Erro ao favoritar:", error);
    }
}

function configurarInterfacePorPerfil(perfil) {
    const secaoProfessor = document.getElementById("secaoProfessor");
    if (!secaoProfessor) return;
    secaoProfessor.style.display = (perfil.includes("professor") || perfil.includes("administrador")) ? "block" : "none";
}

function logout() {
    fetch('/api/logout', { method: 'POST', credentials: 'include' })
        .then(() => window.location.href = "/catalogo.html");
}

window.logout = logout;