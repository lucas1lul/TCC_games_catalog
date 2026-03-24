// /js/avaliacoes.js

let jogoIdParaAvaliar = null;
let notaAtual = 0;

function montarEstrelas(containerId) {
    const box = document.getElementById(containerId);
    if (!box) return;

    box.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const s = document.createElement("span"); // Usando span para melhor controle de estilo
        s.textContent = "★";
        s.className = "estrela-btn"; // Classe para o novo CSS
        s.dataset.valor = i;

        // Clique para selecionar
        s.addEventListener("click", () => {
            notaAtual = i;
            document.getElementById("notaSelecionada").textContent = i;
            atualizarEstrelasVisual(containerId);
        });

        // Efeito de Hover (Passar o mouse)
        s.addEventListener("mouseenter", () => destacarAte(containerId, i));
        s.addEventListener("mouseleave", () => atualizarEstrelasVisual(containerId));

        box.appendChild(s);
    }
}

// Destaque temporário ao passar o mouse
function destacarAte(containerId, valor) {
    const box = document.getElementById(containerId);
    [...box.children].forEach((star, idx) => {
        star.style.color = (idx + 1) <= valor ? "#ffc107" : "#ccc";
    });
}

// Fixa a cor da nota selecionada
function atualizarEstrelasVisual(containerId) {
    const box = document.getElementById(containerId);
    if (!box) return;
    [...box.children].forEach((star, idx) => {
        star.style.color = (idx + 1) <= notaAtual ? "#ffc107" : "#ccc";
        star.classList.toggle("ativa", (idx + 1) <= notaAtual);
    });
}

window.abrirModalAvaliar = function (jogoId, nomeJogo) {
    console.log("DEBUG - Objeto Usuário:", window.usuarioLogado);

    if (!window.usuarioLogado) {
        alert("Você precisa estar logado para avaliar.");
        return;
    }

    // Como o seu console mostrou que o valor 'professor' está no índice 3:
    // Tentamos pegar de .perfil OU do índice [3] caso seja um array/objeto indexado
    const perfilRaw = window.usuarioLogado.perfil || window.usuarioLogado[3] || "";
    const perfil = String(perfilRaw).toLowerCase().trim();

    console.log("DEBUG - Perfil Identificado:", perfil);

    if (perfil === 'professor') {
        const modal = document.getElementById("modalAvaliar");
        if (!modal) return;

        jogoIdParaAvaliar = Number(jogoId);
        notaAtual = 0;

        document.getElementById("avaliarTitulo").textContent = `Avaliar: ${nomeJogo || "Jogo"}`;
        document.getElementById("comentarioAvaliacao").value = "";
        document.getElementById("notaSelecionada").textContent = "—";

        montarEstrelas("estrelasAvaliacao");
        atualizarEstrelasVisual("estrelasAvaliacao");
        
        // Garante que o modal apareça
        modal.style.setProperty('display', 'flex', 'important');
    } else {
        alert(`Acesso negado: Perfil '${perfil}' não autorizado.`);
    }
};

// ... (Mantenha o restante das funções enviarAvaliacao e fecharModalAvaliar como estão)
window.enviarAvaliacao = async function () {
    if (!notaAtual) return alert("Selecione uma nota de 1 a 5.");

    const payload = {
        jogoId: jogoIdParaAvaliar,
        // Opcional: O backend pode pegar o ID do usuário da sessão/cookie por segurança
        nota: notaAtual,
        comentario: document.getElementById("comentarioAvaliacao")?.value || ""
    };

    try {
        const res = await fetch("/api/avaliacoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fecharModalAvaliar();
            await atualizarMediaNoCard(jogoIdParaAvaliar);
            alert("Avaliação enviada! ✅");
        } else {
            const erro = await res.json();
            alert(erro.mensagem || "Erro ao enviar.");
        }
    } catch (err) {
        console.error(err);
    }
};

// ATUALIZAÇÃO: Média visual fiel com preenchimento parcial (CSS Gradient)
window.atualizarMediaNoCard = async function (jogoId) {
    const card = document.querySelector(`.jogo-card[data-jogo-id="${jogoId}"]`);
    if (!card) return;

    const starsEl = card.querySelector(".estrelas-dinamicas-card");
    // Removi a referência ao totalEl (nota-texto-card) para não dar erro se ele não existir

    try {
        const res = await fetch(`/api/games/${jogoId}/avaliacoes`);
        const { media } = await res.json();

        if (starsEl) {
            const percent = (media / 5) * 100;
            starsEl.style.setProperty('--percent', `${percent}%`);
        }
        // O código não tentará mais escrever "(0.0)" ou "(S/N)" no card
    } catch (err) {
        console.error("Erro ao atualizar média:", err);
    }
};

// No avaliacoes.js
window.carregarAvaliacoesNoDetalhe = async function (jogoId) {
    const res = await fetch(`/api/games/${jogoId}/avaliacoes`);
    const { media, total, comentarios } = await res.json();

    const mediaBox = document.getElementById("detalheMedia");
    if (mediaBox) mediaBox.textContent = total ? `${media.toFixed(1)} / 5 (${total} avaliações)` : "Sem avaliações.";

    const lista = document.getElementById("listaComentarios");
    if (!lista) return;

    // HTML Estruturado para bater com o CSS do catálogo
    lista.innerHTML = comentarios.map(c => `
        <div class="comentario-item">
            <div class="comentario-header">
                <strong>${c.usuarioNome}</strong>
                <span class="nota-estrela">★ ${c.nota}/5</span>
            </div>
            <div class="comentario-data">${new Date(c.createdAt).toLocaleDateString()}</div>
            <div class="comentario-texto">${c.comentario || "<em>Sem comentário</em>"}</div>
        </div>
    `).join("");
};

window.fecharModalAvaliar = function () {
    const modal = document.getElementById("modalAvaliar");
    if (modal) modal.style.display = "none";
    jogoIdParaAvaliar = null; // Limpa o estado
    notaAtual = 0;
};

// Fechar ao clicar fora do conteúdo do modal
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modalAvaliar");
    if (e.target === modal) fecharModalAvaliar();
});