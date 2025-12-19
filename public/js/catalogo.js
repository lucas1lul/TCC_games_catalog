// catalogo.js

// Variáveis de estado da Paginação
let jogosCompletos = []; // Armazena TODOS os jogos retornados pelo filtro
let paginaAtual = 1;
const jogosPorPagina = 9; // 3 jogos por linha * 3 linhas = 9 jogos por página

// Função para buscar e exibir os jogos (Chamada pelo botão 'Filtrar')
async function carregarJogos() {
    // 1. OBTENÇÃO DOS VALORES DOS FILTROS
    const curso = document.getElementById("filtroCurso").value;
    const componente = document.getElementById("filtroComponente").value;
    const habilidade = document.getElementById("filtroHabilidade").value;
    const plataforma = document.getElementById("filtroPlataforma").value;
    
    const lista = document.getElementById("lista"); 
    
    // Resetar paginação ao fazer uma nova busca
    paginaAtual = 1;
    jogosCompletos = [];
    lista.innerHTML = ""; // Limpa a lista antes de tudo

    // 2. VALIDAÇÃO E FEEDBACK INICIAL
    if (!curso && !componente && !habilidade && !plataforma) {
        lista.innerHTML = "💡 Preencha pelo menos um campo de filtro para buscar os jogos.";
        atualizarControlesPaginacao(); // Reseta os botões
        return; 
    }

    lista.innerHTML = "Carregando resultados...";

    // 3. CONSTRUÇÃO DA URL DA API
    let url = "/api/games?"; 
    if (curso) url += `curso=${encodeURIComponent(curso)}&`;
    if (componente) url += `componente=${encodeURIComponent(componente)}&`;
    if (habilidade) url += `habilidade=${encodeURIComponent(habilidade)}&`;
    if (plataforma) url += `plataforma=${encodeURIComponent(plataforma)}&`;

    if (url.endsWith('&')) {
        url = url.slice(0, -1);
    }
    
    // 4. REQUISIÇÃO E PROCESSAMENTO
    try {
        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error(`Erro HTTP! Status: ${res.status}`);
        }
        
        // Armazena TODOS os resultados na variável de estado
        jogosCompletos = await res.json();
        
        if (jogosCompletos.length === 0) {
            lista.innerHTML = "⚠️ Nenhum jogo encontrado com os filtros selecionados.";
            // Garante que os controles sejam desabilitados
            atualizarControlesPaginacao(); 
            return;
        }

        // Chama a função que renderiza a página atual
        renderizarJogosDaPagina();
        
    } catch (error) {
        console.error("Erro ao buscar jogos:", error);
        lista.innerHTML = `❌ Ocorreu um erro ao carregar os dados. Verifique se o servidor está ativo. Detalhe: ${error.message}`;
        atualizarControlesPaginacao();
    }
}

// -----------------------------------------------------------
// NOVAS FUNÇÕES DE PAGINAÇÃO
// -----------------------------------------------------------

function renderizarJogosDaPagina() {
    const lista = document.getElementById("lista"); 
    lista.innerHTML = ""; // Limpa a lista para a nova página

    const inicio = (paginaAtual - 1) * jogosPorPagina;
    const fim = inicio + jogosPorPagina;
    
    // Pega APENAS os jogos da página atual
    const jogosDaPagina = jogosCompletos.slice(inicio, fim);

    // 5. RENDERIZAÇÃO DOS CARDS
    jogosDaPagina.forEach(jogo => {
        // Formatação dos dados (permanece a mesma)
        const generos = (Array.isArray(jogo.generos) && jogo.generos.length > 0) ? jogo.generos.join(' | ') : 'N/A';
        const habilidades = (Array.isArray(jogo.habilidades) && jogo.habilidades.length > 0) ? jogo.habilidades.join(', ') : 'N/A';
        const plataforma = (Array.isArray(jogo.plataforma) && jogo.plataforma.length > 0) ? jogo.plataforma.join(', ') : 'N/A';
        const ano = jogo.ano_lancamento || 'N/A';
        const custo = jogo.modelo_custo || 'N/A';
        const idioma = jogo.idioma || 'N/A';

        lista.innerHTML += `
            <div class="jogo-card">
                <div class="card-header">
                    <h2 class="jogo-titulo">${jogo.titulo}</h2>
                    <span class="jogo-componente">COMPONENTES: ${jogo.componente || 'N/A'}</span>
                </div>
                
                <div class="card-body">
                    <p class="jogo-descricao">${jogo.descricao}</p>
                    
                    <div class="detalhes-grid">
                        <p class="detalhe-item"><strong>Plataformas:</strong> ${plataforma}</p>
                        <p class="detalhe-item"><strong>Gêneros:</strong> ${generos}</p>
                        <p class="detalhe-item"><strong>Habilidades (Códigos):</strong> ${habilidades}</p>
                        <p class="detalhe-item"><strong>Custo:</strong> ${custo}</p>
                        <p class="detalhe-item"><strong>Ano:</strong> ${ano}</p>
                        <p class="detalhe-item"><strong>Idioma:</strong> ${idioma}</p>
                        <p class="detalhe-item completo"><strong>Buscador:</strong> ${jogo.buscador || 'N/A'}</p>
                        <p class="detalhe-item completo"><strong>Autor/Estúdio:</strong> ${jogo.autor || 'N/A'}</p>
                    </div>
                </div>

                <div class="card-footer">
                    <a href="${jogo.url || '#'}" target="_blank" rel="noopener noreferrer">${jogo.url ? 'Acessar Jogo' : 'Link Indisponível'}</a>
                </div>
            </div>
        `;
    });

    // Atualiza o estado dos botões e o contador de página
    atualizarControlesPaginacao();
}

function mudarPagina(direcao) {
    const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
    const novaPagina = paginaAtual + direcao;

    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        paginaAtual = novaPagina;
        renderizarJogosDaPagina();
        // Rola para o topo da lista para melhor experiência do usuário
        document.getElementById("lista").scrollIntoView({ behavior: 'smooth' }); 
    }
}

function atualizarControlesPaginacao() {
    const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
    
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProximo = document.getElementById('btnProximo');
    const infoPagina = document.getElementById('infoPagina');
    
    // Desabilita/Habilita botões
    btnAnterior.disabled = paginaAtual === 1;
    btnProximo.disabled = paginaAtual === totalPaginas || jogosCompletos.length === 0;

    // Atualiza o texto da informação da página
    infoPagina.textContent = `Página ${totalPaginas === 0 ? 0 : paginaAtual} de ${totalPaginas}`;
}

// Funções auxiliares (mantidas)
function verDetalhes(id) {
    window.location.href = "detalhes.html?id=" + id; 
}