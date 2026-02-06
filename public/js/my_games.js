// Variáveis globais
let meusJogosOriginais = []; 
let jogosFiltrados = [];
let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', () => {
    const usuarioSessao = localStorage.getItem('usuarioLogado');
    
    if (!usuarioSessao) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = 'index.html';
        return;
    }

    usuarioLogado = JSON.parse(usuarioSessao);

    document.getElementById('nomeDisplay').textContent = usuarioLogado.nome;
    document.getElementById('perfilDisplay').textContent = usuarioLogado.perfil;

    configurarInterfacePorPerfil(usuarioLogado.perfil.toLowerCase());
    carregarMeusDados();
});

// --- LÓGICA DE INTERFACE ---
function configurarInterfacePorPerfil(perfil) {
    console.log("Perfil para interface:", perfil); // Verifique se imprime 'professor'

    const secaoProfessor = document.getElementById('secaoProfessor');
    
    if (!secaoProfessor) {
        console.error("ERRO: O elemento 'secaoProfessor' não existe no HTML.");
        return;
    }

    // Compara se o texto contém 'prof' ou 'admin' para evitar erros de digitação
    if (perfil.includes('professor') || perfil.includes('administrador')) {
        secaoProfessor.classList.add('mostrar-gestao');
        console.log("Aba de gestão ativada com sucesso!");
    } else {
        secaoProfessor.classList.remove('mostrar-gestao');
    }
}

// Atualiza o contador de seleção para professores
function atualizarContador() {
    const selecionados = document.querySelectorAll('.check-jogo:checked').length;
    const contador = document.getElementById('contadorSelecao');
    if (contador) {
        contador.textContent = selecionados > 0 
            ? `${selecionados} jogo(s) selecionado(s)` 
            : 'Nenhum jogo selecionado';
    }
}

// --- LÓGICA DE FILTRO (Ajustada para os novos nomes do SQL) ---
function filtrarMeusJogos() {
    const status = document.getElementById('filtroStatus').value;
    const buscaCurso = document.getElementById('filtroCurso').value.toLowerCase();

    jogosFiltrados = meusJogosOriginais.filter(jogo => {
        // Filtro por Status
        const matchStatus = 
            status === "tudo" || 
            (status === "favoritados" && jogo.isFavorito) || 
            (status === "avaliados" && jogo.isAvaliado);

        // Filtro por Nome/Curso (Exemplo)
        const matchTexto = jogo.NOME.toLowerCase().includes(buscaCurso);

        return matchStatus && matchTexto;
    });

    renderizarJogos(jogosFiltrados);
}

// --- RENDERIZAÇÃO (Ajustada para os novos nomes do SQL) ---
function renderizarJogos(lista) {
    const container = document.getElementById('listaFavoritos');
    if (!container) return;

    container.innerHTML = ''; 

    if (lista.length === 0) {
        container.innerHTML = '<p>Nenhum jogo encontrado.</p>';
        return;
    }

    lista.forEach(jogo => {
        // Criamos o elemento do card
        const card = document.createElement('div');
        card.className = 'jogo-card'; // MESMA CLASSE DO CATALOGO.HTML

        // Montamos o HTML interno IGUAL ao do catálogo
        card.innerHTML = `
            <div class="card-image-container">
                <img src="/images/${jogo.LINKIMAGEM || 'placeholder.png'}" alt="${jogo.NOME}" class="jogo-img" onerror="this.src='/images/placeholder.png'">
            </div>

            <div class="card-content">
                <div class="card-header-info">
                    <h2 class="jogo-titulo">${jogo.NOME}</h2>
                    <span class="jogo-componente">${jogo.INTERACAO || 'N/A'}</span>
                </div>
                
                <div class="card-body">
                    <p class="jogo-descricao">${jogo.DESCRICAOIMAGEM || 'Sem descrição.'}</p>
                </div>

                <div class="card-footer" style="display: flex; gap: 10px; align-items: center;">
                    <button onclick='abrirDetalhes(${JSON.stringify(jogo).replace(/'/g, "&apos;")})' class="btn-ver-mais" style="padding: 8px 12px; font-size: 0.8rem;">
                        🔍 Detalhes
                    </button>
                    
                    <a href="${jogo.LINK || '#'}" target="_blank" class="btn-acessar" style="flex: 1; text-align: center;">
                        Jogar
                    </a>

                    ${(usuarioLogado.perfil.toLowerCase().includes('prof') || usuarioLogado.perfil.toLowerCase().includes('admin')) ? `
                        <input type="checkbox" class="check-jogo" data-id="${jogo.IDJOGO}" onchange="atualizarContador()" style="width: 20px; height: 20px; cursor: pointer;">
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Função para atualizar o texto de quantos jogos estão marcados
function atualizarContador() {
    const selecionados = document.querySelectorAll('.check-jogo:checked').length;
    const info = document.getElementById('contadorSelecao');
    if (info) {
        info.textContent = selecionados > 0 
            ? `${selecionados} jogo(s) selecionado(s)` 
            : 'Nenhum jogo selecionado';
    }
}

// --- COMUNICAÇÃO COM API ---
async function carregarMeusDados() {
    const container = document.getElementById('listaFavoritos');
    
    try {
        // 1. Pega favoritos do JSON
        const responseFav = await fetch(`/api/usuarios/${usuarioLogado.id}/favoritos`);
        if (!responseFav.ok) throw new Error("Falha ao carregar favoritos do JSON");
        const idsFavoritos = await responseFav.json(); 

        // 2. Pega todos os jogos do SQL
        const responseJogos = await fetch('/api/games');
        if (!responseJogos.ok) throw new Error("Falha ao carregar jogos do SQL");
        const todosJogos = await responseJogos.json();

        // 3. Filtra os jogos do SQL usando os IDs que vieram do JSON
        // IMPORTANTE: No SQL os campos são MAIÚSCULOS (IDJOGO)
        meusJogosOriginais = todosJogos.filter(jogo => {
            return idsFavoritos.includes(jogo.IDJOGO) || idsFavoritos.includes(String(jogo.IDJOGO));
        });

        jogosFiltrados = [...meusJogosOriginais];

        if (meusJogosOriginais.length === 0) {
            container.innerHTML = '<p>Você ainda não favoritou nenhum jogo no banco. ❤️</p>';
        } else {
            renderizarJogos(jogosFiltrados);
        }

    } catch (error) {
        console.error("Erro detalhado:", error);
        container.innerHTML = '<p style="color:red">❌ Erro ao sincronizar JSON com SQL. Verifique o console.</p>';
    }
}

// --- FUNÇÕES DE AÇÃO ---
function exportarLista() {
    const checkboxes = document.querySelectorAll('.check-jogo:checked');
    const idsSelecionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));

    if (idsSelecionados.length === 0) {
        alert("Selecione ao menos um jogo para exportar.");
        return;
    }

    const dadosParaExportar = meusJogosOriginais.filter(j => idsSelecionados.includes(j.IDJOGO));

    // Gera o CSV formatado para Excel
    let csvContent = "\uFEFFID;Titulo;Link;Idioma\n";
    dadosParaExportar.forEach(j => {
        csvContent += `${j.IDJOGO};${j.NOME};${j.LINK};${j.IDIOMA}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "meus_jogos_selecionados.csv";
    link.click();
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index';
}

function exportarLista() {
    const checkboxes = document.querySelectorAll('.check-jogo:checked');
    const idsSelecionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));

    if (idsSelecionados.length === 0) {
        alert("Por favor, selecione ao menos um jogo para exportar.");
        return;
    }

    // Filtra os dados completos apenas dos jogos selecionados
    const dadosParaExportar = meusJogosOriginais.filter(j => idsSelecionados.includes(j.id));

    // Cria o cabeçalho do CSV
    let csvContent = "ID;Titulo;Componente;URL\n";

    // Adiciona as linhas
    dadosParaExportar.forEach(j => {
        csvContent += `${j.id};${j.titulo};${j.componente};${j.url}\n`;
    });

    // Cria o download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "meus_jogos_selecionados.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}