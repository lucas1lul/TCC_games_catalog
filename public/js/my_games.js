// Variáveis globais para armazenar os dados e permitir filtragem sem nova requisição ao servidor
let meusJogosOriginais = []; 
let jogosFiltrados = [];
let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se o usuário está logado
    const usuarioSessao = localStorage.getItem('usuarioLogado');
    
    if (!usuarioSessao) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = 'index.html';
        return;
    }

    usuarioLogado = JSON.parse(usuarioSessao);

    // 2. Atualiza cabeçalho com dados do usuário
    document.getElementById('nomeDisplay').textContent = usuarioLogado.nome;
    document.getElementById('perfilDisplay').textContent = usuarioLogado.perfil;

    // 3. Configura a interface baseada no Perfil
    configurarInterfacePorPerfil(usuarioLogado.perfil.toLowerCase());

    // 4. Carrega os dados iniciais (Favoritos/Avaliações)
    carregarMeusDados();
});

// --- LÓGICA DE INTERFACE ---

function configurarInterfacePorPerfil(perfil) {
    const secaoAvaliacoes = document.getElementById('secaoAvaliacoes');
    const secaoProfessor = document.getElementById('secaoProfessor');

    // Regra: Alunos, Professores e Admins vêem avaliações
    if (['aluno', 'professor', 'administrador'].includes(perfil)) {
        if (secaoAvaliacoes) secaoAvaliacoes.style.display = 'block';
    }

    // Regra: Professor e Admin vêem ferramentas de docente/exportação
    if (['professor', 'administrador'].includes(perfil)) {
        if (secaoProfessor) secaoProfessor.style.display = 'block';
    }
}

// --- LÓGICA DE FILTRO (IGUAL AO CATALOGO.HTML) ---

function filtrarMeusJogos() {
    const curso = document.getElementById('filtroCurso')?.value.toLowerCase() || "";
    const componente = document.getElementById('filtroComponente')?.value.toLowerCase() || "";
    const habilidade = document.getElementById('filtroHabilidade')?.value.toLowerCase() || "";
    const plataforma = document.getElementById('filtroPlataforma')?.value.toLowerCase() || "";

    jogosFiltrados = meusJogosOriginais.filter(jogo => {
        const matchCurso = jogo.curso?.toLowerCase().includes(curso) || curso === "";
        const matchComponente = jogo.componente?.toLowerCase().includes(componente) || componente === "";
        
        // Verifica se alguma habilidade do array contém o texto
        const matchHabilidade = jogo.habilidades?.some(h => h.toLowerCase().includes(habilidade)) || habilidade === "";
        
        // Verifica se alguma plataforma do array contém o texto
        const matchPlataforma = jogo.plataforma?.some(p => p.toLowerCase().includes(plataforma)) || plataforma === "";

        return matchCurso && matchComponente && matchHabilidade && matchPlataforma;
    });

    renderizarJogos(jogosFiltrados);
}

// --- RENDERIZAÇÃO ---

function renderizarJogos(lista) {
    const container = document.getElementById('listaFavoritos');
    if (!container) return;

    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p>Nenhum jogo encontrado para este perfil ou filtro.</p>';
        return;
    }

    lista.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'card-jogo';
        
        // Lógica para Professor/Admin: Adicionar checkbox de seleção
        const inputCheck = (usuarioLogado.perfil.toLowerCase() === 'professor' || usuarioLogado.perfil.toLowerCase() === 'administrador') 
            ? `<input type="checkbox" class="check-jogo" data-id="${jogo.id}">` 
            : '';

        // Lógica para Admin: Botões de Editar/Excluir
        const botoesAdmin = (usuarioLogado.perfil.toLowerCase() === 'administrador')
            ? `<div class="admin-actions">
                <button onclick="editarJogo(${jogo.id})">✏️</button>
                <button onclick="removerJogo(${jogo.id})">🗑️</button>
               </div>`
            : '';

        card.innerHTML = `
            ${inputCheck}
            <img src="${jogo.imagem || '/img/placeholder.png'}" alt="${jogo.titulo}">
            <h3>${jogo.titulo}</h3>
            <p><strong>Componente:</strong> ${jogo.componente}</p>
            <div class="card-footer">
                <a href="detalhes.html?id=${jogo.id}">Ver Detalhes</a>
                ${botoesAdmin}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- COMUNICAÇÃO COM API ---

async function carregarMeusDados() {
    try {
        // Exemplo: Buscar favoritos do usuário logado
        // No futuro, você criará a rota: GET /api/usuarios/:id/favoritos
        const response = await fetch(`/api/jogos`); // Por enquanto carregando todos para teste
        const data = await response.json();

        if (response.ok) {
            meusJogosOriginais = data;
            jogosFiltrados = data;
            renderizarJogos(jogosFiltrados);
        }
    } catch (error) {
        console.error("Erro ao carregar jogos do usuário:", error);
    }
}

// --- FUNÇÕES DE AÇÃO ---

function exportarLista() {
    const selecionados = Array.from(document.querySelectorAll('.check-jogo:checked'))
                              .map(cb => cb.dataset.id);
    
    if (selecionados.length === 0) {
        alert("Selecione ao menos um jogo para exportar.");
        return;
    }
    alert("Exportando lista dos IDs: " + selecionados.join(', '));
    // Aqui entrará a lógica de gerar o CSV
}

function sugerirJogo() {
    // Redireciona para um formulário de sugestão ou abre modal
    alert("Funcionalidade de Sugestão será implementada em breve!");
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}