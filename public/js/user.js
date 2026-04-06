let usuarioLogado = null;
let habilidadesSelecionadas = [];
let todosOsJogosAdmin = [];

// --- UTILITÁRIOS ---

function debounce(func, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

function setStatus(msg, type = "info") {
    const el = document.getElementById("status");
    if (!el) return;

    el.textContent = msg || "";
    el.className = "status " + type;

    setTimeout(() => {
        el.textContent = "";
        el.className = "status";
    }, 5000);
}

// --- SESSÃO ---

async function verificarSessao() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
    } catch {
        return null;
    }
}

async function carregarDadosIniciais() {
    usuarioLogado = await verificarSessao();

    if (!usuarioLogado) {
        window.location.href = "/login";
        return;
    }

    if (document.getElementById("nome")) document.getElementById("nome").value = usuarioLogado.nome || "";
    if (document.getElementById("email")) document.getElementById("email").value = usuarioLogado.email || "";

    // Mostra menus baseados no perfil
    if (usuarioLogado.perfil === 'administrador') {
        document.getElementById("menu-admin").hidden = false;
    } 
    
    if (usuarioLogado.perfil === 'profissional_ti') {
        const menuTi = document.getElementById("menu-ti");
        if (menuTi) menuTi.hidden = false;
    }
}

// --- BUSCA DE HABILIDADES ---

function configurarBuscaHabilidades() {
    const input = document.getElementById('buscaHabilidade');
    const lista = document.getElementById('resultadosBusca');

    if (!input) return;

    // Aplicação de Debounce para performance e economia de API
    input.addEventListener('input', debounce(async (e) => {
        const termo = e.target.value;

        if (termo.length < 2) {
            lista.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`/api/habilidades/search?q=${termo}`);
            const dados = await res.json();

            lista.innerHTML = '';
            lista.setAttribute('role', 'listbox');

            dados.forEach(h => {
                const div = document.createElement('div');
                div.className = 'result-item';
                div.setAttribute('role', 'option');
                div.textContent = `${h.CODIGO} - ${h.NOME}`;
                div.onclick = () => adicionarTagHabilidade(h);
                lista.appendChild(div);
            });

            lista.style.display = dados.length ? 'block' : 'none';
        } catch (err) {
            console.error("Erro na busca:", err);
        }
    }, 300));
}

function adicionarTagHabilidade(hab) {
    if (habilidadesSelecionadas.find(h => h.ID === hab.ID)) return;

    habilidadesSelecionadas.push(hab);
    renderizarTags();

    document.getElementById('buscaHabilidade').value = '';
    document.getElementById('resultadosBusca').style.display = 'none';
}

window.removerTagHabilidade = function (id) {
    habilidadesSelecionadas = habilidadesSelecionadas.filter(h => h.ID !== id);
    renderizarTags();
};

function renderizarTags() {
    const container = document.getElementById('habilidadesSelecionadas');
    if (!container) return;

    container.innerHTML = '';

    habilidadesSelecionadas.forEach(h => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerHTML = `${h.CODIGO} 
            <span class="remove-btn" role="button" aria-label="Remover" onclick="removerTagHabilidade(${h.ID})">&times;</span>`;
        container.appendChild(span);
    });
}

// --- NAVEGAÇÃO ---

window.showSection = function (sectionId, btn) {
    document.querySelectorAll('.section-content').forEach(s => s.hidden = true);

    const target = document.getElementById(sectionId);
    if (target) target.hidden = false;

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (sectionId === 'section-curadoria') carregarSugestoes();
    if (sectionId === 'section-meus-envios') carregarMeusEnvios();
    if (sectionId === 'section-gerenciar-usuarios') carregarUsuariosAdmin();
    if (sectionId === 'section-gerenciar-jogos') carregarJogosAdmin();
};

// --- CADASTRO JOGO ---

async function cadastrarJogo(e) {
    e.preventDefault();

    const getChecked = (name) =>
        Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(cb => parseInt(cb.value));

    const jogo = {
        NOME: document.getElementById("NOME").value,
        LINK: document.getElementById("LINK").value,
        LINKIMAGEM: document.getElementById("LINKIMAGEM").value || 'default.png',
        IDIOMA: document.getElementById("IDIOMA").value,
        INTERACAO: document.getElementById("INTERACAO").value,
        LICENSA: document.getElementById("LICENSA").value,
        PLATAFORMAS: getChecked('PLATAFORMA'),
        GENEROS: getChecked('GENERO'),
        COMPONENTES: getChecked('COMPONENTE'),
        HABILIDADES: habilidadesSelecionadas.map(h => h.ID)
    };

    try {
        const res = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jogo)
        });

        if (!res.ok) throw new Error("Falha no servidor");

        if (window.idSugestaoEmFoco) {
            await fetch(`/api/games/suggest/${window.idSugestaoEmFoco}/approve`, { method: 'PUT' });
        }

        alert("Cadastro realizado com sucesso!");
        location.reload();

    } catch (err) {
        alert("Erro ao cadastrar jogo: " + err.message);
    }
}

// --- PERFIL E CONFIGURAÇÕES ---

async function atualizarDadosBasicos(e) {
    e.preventDefault();

    const payload = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value
    };

    try {
        const res = await fetch("/api/usuarios/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();
        setStatus("Dados atualizados!", "success");

    } catch {
        setStatus("Erro ao atualizar dados", "error");
    }
}

async function atualizarSenha(e) {
    e.preventDefault();

    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarNovaSenha").value;

    if (novaSenha !== confirmar) {
        setStatus("As novas senhas não coincidem", "error");
        return;
    }

    try {
        const res = await fetch("/api/usuarios/me/senha", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senhaAtual, novaSenha })
        });

        if (!res.ok) throw new Error("Senha atual incorreta");

        setStatus("Senha alterada com sucesso!", "success");
        e.target.reset();

    } catch (err) {
        setStatus(err.message, "error");
    }
}

// --- SUGESTÕES ---

async function enviarSugestao(e) {
    e.preventDefault();

    const dados = {
        nome: document.getElementById("sug_nome").value,
        link: document.getElementById("sug_link").value,
        justificativa: document.getElementById("sug_justificativa").value
    };

    try {
        const res = await fetch('/api/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error();
        alert("Sugestão enviada para análise!");
        e.target.reset();
    } catch {
        alert("Erro ao enviar sugestão.");
    }
}

async function carregarSugestoes() {
    const tabela = document.getElementById("tabela-sugestoes");
    if (!tabela) return;

    try {
        const res = await fetch('/api/games/pending');
        const dados = await res.json();

        if (!dados.length) {
            tabela.innerHTML = `<tr><td colspan="3" style="text-align:center">Nenhuma sugestão pendente</td></tr>`;
            return;
        }

        tabela.innerHTML = dados.map(s => `
            <tr>
                <td>${s.NOME_JOGO}</td>
                <td><a href="${s.LINK_ACESSO}" target="_blank" rel="noopener">Abrir Link</a></td>
                <td>
                    <button class="btn btn-primary"
                        onclick="prepararAprovacao('${s.ID_SUGESTAO}','${s.NOME_JOGO}','${s.LINK_ACESSO}')">
                        Aprovar
                    </button>
                    <button class="btn btn-primary"
                        onclick="reprovarSugestao('${s.ID_SUGESTAO}')">
                        Reprovar
                    </button>
                </td>
            </tr>
        `).join('');
    } catch {
        tabela.innerHTML = `<tr><td colspan="3">Erro ao carregar sugestões</td></tr>`;
    }
}

window.prepararAprovacao = function (id, nome, link) {
    showSection('section-cadastro-jogo', document.querySelector('[onclick*="cadastro-jogo"]'));
    document.getElementById("NOME").value = nome;
    document.getElementById("LINK").value = link;
    window.idSugestaoEmFoco = id;
};

window.reprovarSugestao = async function(id) {
    if (!confirm("Tem certeza que deseja reprovar esta sugestão? Ela sairá da lista de pendentes.")) return;

    try {
        const res = await fetch(`/api/games/suggestion/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'rejeitado' })
        });

        if (res.ok) {
            alert("Sugestão reprovada com sucesso! ❌");
            carregarSugestoes(); // Recarrega a tabela
        } else {
            alert("Erro ao reprovar sugestão.");
        }
    } catch (err) {
        console.error("Erro:", err);
    }
};

async function carregarMeusEnvios() {
    const tabela = document.getElementById("tabela-meus-envios");
    if (!tabela) return;

    try {
        const res = await fetch('/api/my-suggestions'); 
        const dados = await res.json();

        if (!dados || dados.length === 0) {
            tabela.innerHTML = `<tr><td colspan="3" style="text-align:center">Você ainda não enviou sugestões</td></tr>`;
            return;
        }

        tabela.innerHTML = dados.map(s => {
            // Tratamento da data para evitar "Invalid Date"
            const dataFormatada = s.DATA_ENVIO 
                ? new Date(s.DATA_ENVIO).toLocaleDateString('pt-BR') 
                : "---";

            return `
                <tr>
                    <td>${s.NOME_JOGO || "Sem nome"}</td>
                    <td>${dataFormatada}</td>
                    <td>
                        <span class="status-badge status-${(s.STATUS || 'pendente').toLowerCase()}">
                            ${s.STATUS || "Pendente"}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Erro ao carregar envios:", err);
        tabela.innerHTML = `<tr><td colspan="3">Erro ao carregar histórico</td></tr>`;
    }
}

// --- ADMINISTRAÇÃO DO CATÁLOGO ---

async function carregarJogosAdmin() {
    const tbody = document.getElementById("tabela-jogos-corpo");
    if (!tbody) return;

    try {
        const res = await fetch('/api/games'); 
        todosOsJogosAdmin = await res.json();
        renderizarTabelaJogos(todosOsJogosAdmin);
    } catch (err) {
        console.error("Erro ao carregar jogos:", err);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Erro ao carregar os jogos.</td></tr>`;
    }
}

function renderizarTabelaJogos(jogos) {
    const tbody = document.getElementById("tabela-jogos-corpo");
    if (!tbody) return;
    
    if (jogos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nenhum jogo encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = jogos.map(jogo => `
        <tr>
            <td>${jogo.IDJOGO}</td>
            <td><strong>${jogo.NOME}</strong></td>
            <td>${jogo.INTERACAO || 'N/A'}</td>
            <td>
                <button class="btn btn-danger" onclick="removerJogo('${jogo.IDJOGO}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

window.filtrarJogosAdmin = function() {
    const termo = document.getElementById("filtro-nome-jogo").value.toLowerCase();
    const filtrados = todosOsJogosAdmin.filter(j => 
        j.NOME && j.NOME.toLowerCase().includes(termo)
    );
    renderizarTabelaJogos(filtrados);
};

window.removerJogo = async function(id) {
    if (!confirm("⚠️ Tem certeza que deseja remover este jogo permanentemente do catálogo?")) return;

    try {
        const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Jogo removido!");
            carregarJogosAdmin(); // Atualiza a lista
        } else {
            alert("Erro ao remover o jogo.");
        }
    } catch (err) {
        console.error(err);
    }
};

// --- ADMINISTRAÇÃO DE USUÁRIOS ---

async function carregarUsuariosAdmin() {
    const tabela = document.getElementById('tabela-usuarios-corpo');
    if (!tabela) return;

    try {
        const res = await fetch('/api/admin/users');
        const usuarios = await res.json();

        tabela.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.perfil}</td>
                <td>
                    <button class="btn btn-primary"
                        onclick='abrirModalEditarUsuario(${JSON.stringify(u)})'>
                        Editar
                    </button>
                </td>
            </tr>
        `).join('');
    } catch {
        tabela.innerHTML = `<tr><td colspan="5">Erro ao carregar usuários</td></tr>`;
    }
}

window.abrirModalEditarUsuario = function (user) {
    const modal = document.getElementById('modal-editar-usuario');
    modal.hidden = false;

    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-nome').value = user.nome;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-perfil').value = user.perfil;
};

async function atualizarUsuarioAdmin(e) {
    e.preventDefault();

    const id = document.getElementById('edit-user-id').value;
    const payload = {
        nome: document.getElementById('edit-user-nome').value,
        email: document.getElementById('edit-user-email').value,
        perfil: document.getElementById('edit-user-perfil').value
    };

    try {
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();

        fecharModalUser();
        carregarUsuariosAdmin(); // Atualiza a tabela sem recarregar a página
        alert("Usuário atualizado com sucesso!");
    } catch {
        alert("Erro ao atualizar usuário.");
    }
}

window.fecharModalUser = function () {
    document.getElementById('modal-editar-usuario').hidden = true;
};

// --- INICIALIZAÇÃO ---

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosIniciais();
    configurarBuscaHabilidades();

    // Listeners de Formulários
    document.getElementById("formDadosBasicos")?.addEventListener("submit", atualizarDadosBasicos);
    document.getElementById("formSenha")?.addEventListener("submit", atualizarSenha);
    document.getElementById("formCadastroJogo")?.addEventListener("submit", cadastrarJogo);
    document.getElementById("form-sugerir-jogo")?.addEventListener("submit", enviarSugestao);
    
    // Fix do bug de edição: Adicionando o listener no formulário do modal
    document.getElementById("form-editar-usuario")?.addEventListener("submit", atualizarUsuarioAdmin);
});

