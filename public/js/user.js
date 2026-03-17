let usuarioLogado = null;

function setStatus(msg, type = "info") {
    const el = document.getElementById("status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "status " + type;
    setTimeout(() => { el.textContent = ""; el.className = "status"; }, 5000);
}

// 1. Busca dados da sessão real no servidor
async function verificarSessao() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user; // Espera { user: {...} } do servidor
    } catch (e) {
        return null;
    }
}

async function carregarDadosIniciais() {
    usuarioLogado = await verificarSessao();
    
    if (!usuarioLogado) {
        window.location.href = "/login";
        return;
    }

    // Preenche formulário de perfil
    document.getElementById("nome").value = usuarioLogado.nome || "";
    document.getElementById("email").value = usuarioLogado.email || "";

    // 2. Se for admin, mostra as opções de menu de administração
    if (usuarioLogado.perfil === 'administrador') {
        const menuAdmin = document.getElementById("menu-admin");
        if (menuAdmin) menuAdmin.style.display = "block";
    }
}

// Troca de abas no dashboard
function showSection(sectionId, btn) {
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (sectionId === 'section-curadoria') carregarSugestoes();
}

async function salvarAlteracoes(e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarNovaSenha").value;

    let payload = { id: usuarioLogado.id, nome, email };

    if (senhaAtual || novaSenha) {
        if (novaSenha !== confirmar) return setStatus("As senhas não conferem!", "error");
        if (novaSenha.length < 6) return setStatus("Nova senha muito curta!", "error");
        payload.senhaAtual = senhaAtual;
        payload.novaSenha = novaSenha;
    }

    try {
        const res = await fetch("/api/users/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setStatus("Dados atualizados com sucesso!", "success");
            document.getElementById("senhaAtual").value = "";
            document.getElementById("novaSenha").value = "";
            document.getElementById("confirmarNovaSenha").value = "";
        } else {
            const err = await res.json();
            throw new Error(err.message || "Erro ao atualizar");
        }
    } catch (err) {
        setStatus(err.message, "error");
    }
}

async function cadastrarJogo(e) {
    e.preventDefault();
    const jogo = {
        nome: document.getElementById("nome_jogo").value,
        link: document.getElementById("link_acesso").value,
        linkimagem: document.getElementById("linkimagem").value,
        idioma: document.getElementById("idioma").value,
        interacao: document.getElementById("interacao").value,
        licensa: document.getElementById("licensa").value
    };

    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jogo),
            credentials: 'include'
        });

        if (response.ok) {
            alert("Jogo cadastrado com sucesso!");
            location.reload();
        } else {
            const result = await response.json();
            alert("Erro: " + (result.error || result.message));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

async function carregarSugestoes() {
    try {
        const response = await fetch('/api/games/pending');
        const jogos = await response.json();
        const tabela = document.getElementById("tabela-sugestoes");
        if (!tabela) return;

        tabela.innerHTML = jogos.map(jogo => `
            <tr>
                <td>${jogo.NOME}</td>
                <td><a href="${jogo.LINK}" target="_blank">Link</a></td>
                <td>
                    <button onclick="decidirStatus(${jogo.IDJOGO}, 'aprovado')" class="btn-approve">✔️</button>
                    <button onclick="decidirStatus(${jogo.IDJOGO}, 'rejeitado')" class="btn-reject">❌</button>
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error("Erro ao carregar sugestões", e); }
}

async function decidirStatus(id, novoStatus) {
    if (!confirm(`Deseja definir como ${novoStatus}?`)) return;
    const res = await fetch(`/api/games/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
    });

    if (res.ok) {
        alert(`Jogo ${novoStatus}!`);
        carregarSugestoes();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosIniciais();
    document.getElementById("formConta").addEventListener("submit", salvarAlteracoes);
    const formJogo = document.getElementById("formCadastroJogo");
    if (formJogo) formJogo.addEventListener("submit", cadastrarJogo);
});