let usuarioLogado = null;
let habilidadesSelecionadas = []; // Estado global para as tags de habilidades

// --- UTILITÁRIOS ---

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

// --- SESSÃO E INICIALIZAÇÃO ---

async function verificarSessao() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
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

    if (document.getElementById("nome")) document.getElementById("nome").value = usuarioLogado.nome || "";
    if (document.getElementById("email")) document.getElementById("email").value = usuarioLogado.email || "";

    if (usuarioLogado.perfil === 'administrador') {
        document.getElementById("menu-admin").style.display = "block";
    } else if (usuarioLogado.perfil === 'profissional_ti') {
        document.getElementById("menu-ti").style.display = "block";
    }
}

// --- LÓGICA DE BUSCA DE HABILIDADES (TAGS) ---

function configurarBuscaHabilidades() {
    const inputBusca = document.getElementById('buscaHabilidade');
    const listaResultados = document.getElementById('resultadosBusca');

    if (!inputBusca) return;

    inputBusca.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const primeiroItem = listaResultados.querySelector('.result-item');
            if (primeiroItem) {
                primeiroItem.click();
            }
        }
    });

    inputBusca.addEventListener('input', async (e) => {
        const termo = e.target.value;
        if (termo.length < 2) {
            listaResultados.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`/api/habilidades/search?q=${termo}`);
            const habilidades = await res.json();

            listaResultados.innerHTML = '';
            if (habilidades.length > 0) {
                habilidades.forEach(hab => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.textContent = `${hab.CODIGO} - ${hab.NOME}`;
                    div.onclick = () => adicionarTagHabilidade(hab);
                    listaResultados.appendChild(div);
                });
                listaResultados.style.display = 'block';
            } else {
                listaResultados.style.display = 'none';
            }
        } catch (err) {
            console.error("Erro na busca de habilidades:", err);
        }
    });

    document.addEventListener('click', (e) => {
        if (!inputBusca.contains(e.target)) listaResultados.style.display = 'none';
    });
}

function adicionarTagHabilidade(hab) {
    if (habilidadesSelecionadas.find(h => h.ID === hab.ID)) return;

    habilidadesSelecionadas.push(hab);
    document.getElementById('buscaHabilidade').value = '';
    document.getElementById('resultadosBusca').style.display = 'none';
    renderizarTags();
}

// Deixando global para o onclick do HTML funcionar
window.removerTagHabilidade = function (id) {
    habilidadesSelecionadas = habilidadesSelecionadas.filter(h => h.ID !== id);
    renderizarTags();
};

function renderizarTags() {
    const container = document.getElementById('habilidadesSelecionadas');
    if (!container) return;
    container.innerHTML = '';
    habilidadesSelecionadas.forEach(hab => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerHTML = `${hab.CODIGO} <span class="remove-btn" onclick="removerTagHabilidade(${hab.ID})">&times;</span>`;
        container.appendChild(span);
    });
}

// --- NAVEGAÇÃO ---

window.showSection = function (sectionId, btn) {
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Gatilhos de carregamento de dados
    if (sectionId === 'section-curadoria') carregarSugestoes();
    if (sectionId === 'section-meus-envios') carregarMeusEnvios();
    
    // ADICIONE ESTA LINHA:
    if (sectionId === 'section-gerenciar-usuarios') carregarUsuariosAdmin();
};

// --- CADASTRO DE JOGO (ADMIN) ---

async function cadastrarJogo(e) {
    e.preventDefault();

    const getCheckedValues = (name) =>
        Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => parseInt(cb.value));

    const jogo = {
        NOME: document.getElementById("NOME").value,
        LINK: document.getElementById("LINK").value,
        LINKIMAGEM: document.getElementById("LINKIMAGEM").value || 'default.png',
        IDIOMA: document.getElementById("IDIOMA").value,
        INTERACAO: document.getElementById("INTERACAO").value,
        LICENSA: document.getElementById("LICENSA").value,

        PLATAFORMAS: getCheckedValues('PLATAFORMA'),
        GENEROS: getCheckedValues('GENERO'),
        COMPONENTES: getCheckedValues('COMPONENTE'),
        HABILIDADES: habilidadesSelecionadas.map(h => h.ID)
    };

    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jogo)
        });

        if (response.ok) {
            if (window.idSugestaoEmFoco) {
                await fetch(`/api/games/suggest/${window.idSugestaoEmFoco}/approve`, { method: 'PUT' });
            }
            alert("Sucesso! Jogo e relacionamentos salvos no banco.");
            location.reload();
        } else {
            const erro = await response.json();
            alert("Erro: " + erro.message);
        }
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
    }
}

// --- AÇÕES DO PERFIL ---

async function salvarAlteracoes(e) {
    e.preventDefault();
    const payload = {
        id: usuarioLogado.id,
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value
    };

    try {
        const res = await fetch("/api/users/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setStatus("Dados atualizados com sucesso!", "success");
        } else {
            const err = await res.json();
            throw new Error(err.message || "Erro ao atualizar");
        }
    } catch (err) {
        setStatus(err.message, "error");
    }
}

// --- SUGESTÕES E CURADORIA ---

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
        if (res.ok) {
            alert("Sugestão enviada!");
            e.target.reset();
        }
    } catch (err) { console.error(err); }
}

async function carregarSugestoes() {
    const tabela = document.getElementById("tabela-sugestoes");
    if (!tabela) return;
    try {
        const res = await fetch('/api/games/pending');
        const sugestoes = await res.json();
        if (!Array.isArray(sugestoes) || sugestoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhuma sugestão pendente.</td></tr>';
            return;
        }
        tabela.innerHTML = sugestoes.map(s => `
            <tr>
                <td>${s.NOME_JOGO}</td>
                <td>${s.AUTOR_ID || 'Usuário'}</td>
                <td><a href="${s.LINK_ACESSO}" target="_blank">Link</a></td>
                <td>
                    <button class="btn-approve" onclick="prepararAprovacao('${s.ID_SUGESTAO}', '${s.NOME_JOGO}', '${s.LINK_ACESSO}')">✅</button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); }
}

window.prepararAprovacao = function (id, nome, link) {
    showSection('section-cadastro-jogo', document.querySelector('[onclick*="section-cadastro-jogo"]'));
    document.getElementById("NOME").value = nome;
    document.getElementById("LINK").value = link;
    window.idSugestaoEmFoco = id;
    setStatus("Sugestão carregada.", "info");
};

// --- GERENCIAMENTO DE USUÁRIOS (ADMIN) ---

async function carregarUsuariosAdmin() {
    const tabelaCorpo = document.getElementById('tabela-usuarios-corpo');
    if (!tabelaCorpo) return;

    try {
        const res = await fetch('/api/admin/users');
        const usuarios = await res.json();

        if (!Array.isArray(usuarios)) throw new Error("Erro ao receber lista de usuários");

        tabelaCorpo.innerHTML = usuarios.map(u => {
            // Criamos uma string segura do objeto para passar no onclick
            const userJson = JSON.stringify(u).replace(/'/g, "&apos;");
            
            return `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td><span class="badge-${u.perfil}">${u.perfil}</span></td>
                    <td>
                        <button class="btn-edit" onclick='abrirModalEditarUsuario(${userJson})'>✏️ Editar</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        tabelaCorpo.innerHTML = '<tr><td colspan="5">Erro ao carregar dados.</td></tr>';
    }
}

window.abrirModalEditarUsuario = function(user) {
    // Exibe o modal (certifique-se de ter o ID correspondente no HTML)
    const modal = document.getElementById('modal-editar-usuario');
    if (!modal) return;

    modal.style.display = 'flex';

    // Preenche os campos
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-nome').value = user.nome;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-perfil').value = user.perfil;
};

window.fecharModalUser = function() {
    const modal = document.getElementById('modal-editar-usuario');
    if (modal) modal.style.display = 'none';
};

// Event Listener para o formulário de edição do modal
document.getElementById('form-editar-usuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-user-id').value;
    const payload = {
        nome: document.getElementById('edit-user-nome').value,
        perfil: document.getElementById('edit-user-perfil').value,
        email: document.getElementById('edit-user-email').value
    };

    // Validação básica (Passo 4a do seu Caso de Uso)
    if (payload.nome.trim().length < 3) {
        alert("O nome deve ter pelo menos 3 caracteres.");
        return;
    }

    try {
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Usuário atualizado com sucesso!");
            fecharModalUser();
            carregarUsuariosAdmin(); // Atualiza a tabela

            // Se o admin editou a si mesmo, atualiza a sessão local
            if (Number(id) === usuarioLogado.id) {
                usuarioLogado = { ...usuarioLogado, ...payload };
            }
        } else {
            const err = await res.json();
            alert("Erro: " + err.error);
        }
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
    }
});

// --- EVENT LISTENERS ---

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosIniciais();
    configurarBuscaHabilidades();

    const formConta = document.getElementById("formConta");
    if (formConta) formConta.addEventListener("submit", salvarAlteracoes);

    const formJogo = document.getElementById("formCadastroJogo");
    if (formJogo) formJogo.addEventListener("submit", cadastrarJogo);

    const formSugestao = document.getElementById("form-sugerir-jogo");
    if (formSugestao) formSugestao.addEventListener("submit", enviarSugestao);
});