// catalogo.js
document.addEventListener('DOMContentLoaded', () => {
    carregarJogos();
    const usuarioSessao = localStorage.getItem('usuarioLogado');
    
    const formFiltros = document.getElementById("filtros");
  if (formFiltros) {
    formFiltros.addEventListener("submit", (e) => {
      e.preventDefault(); // ⛔ evita recarregar a página
      carregarJogos();    // ✅ executa filtragem
    });
  }

    if (usuarioSessao) {
        const usuario = JSON.parse(usuarioSessao);
        const header = document.querySelector('h1'); 
        const saudacao = document.createElement('p');
        saudacao.style.fontSize = '1rem';
        saudacao.style.color = '#555';
        header.insertAdjacentElement('afterend', saudacao);
    }
});

let jogosCompletos = []; 
let paginaAtual = 1;
const jogosPorPagina = 10; 

async function carregarJogos() {
  const curso = document.getElementById("filtroCurso").value.trim();
  const componente = document.getElementById("filtroComponente").value.trim();
  const habilidade = document.getElementById("filtroHabilidade").value.trim();
  const plataforma = document.getElementById("filtroPlataforma").value.trim();

  const lista = document.getElementById("lista");

  paginaAtual = 1;
  jogosCompletos = [];
  lista.innerHTML = "Carregando resultados...";

  // ✅ Se não tiver filtro, busca tudo
  const params = new URLSearchParams();
  if (curso) params.set("curso", curso);
  if (componente) params.set("componente", componente);
  if (habilidade) params.set("habilidade", habilidade);
  if (plataforma) params.set("plataforma", plataforma);

  const url = params.toString() ? `/api/games?${params.toString()}` : "/api/games";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro HTTP! Status: ${res.status}`);

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
    atualizarControlesPaginacao();
  }
}


function renderizarJogosDaPagina() {
    const lista = document.getElementById("lista"); 
    lista.innerHTML = ""; 

    const inicio = (paginaAtual - 1) * jogosPorPagina;
    const fim = inicio + jogosPorPagina;
    const jogosDaPagina = jogosCompletos.slice(inicio, fim);

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const favoritos = usuarioLogado?.favoritos || [];

    jogosDaPagina.forEach(jogo => {
        // AJUSTE DE MAPEAMENTO (SQL da Carol usa MAIÚSCULAS)
        // jogo.NOME, jogo.IDJOGO, jogo.LINK, jogo.IDIOMA, jogo.INTERACAO
        
        const classeAtiva = favoritos.includes(jogo.IDJOGO) ? 'ativa' : '';

        lista.innerHTML += `
            <div class="jogo-card">
                <div class="card-header" style="position: relative; background-color: #8B0000; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
                    <h2 class="jogo-titulo" style="margin: 0; font-size: 1.4rem;">${jogo.NOME}</h2>
                    <span class="jogo-componente" style="display: block; font-size: 0.8rem; margin-top: 5px; opacity: 0.9;">
                        INTERAÇÃO: ${jogo.INTERACAO || 'N/A'}
                    </span>
                    <span class="estrela-favorito ${classeAtiva}" 
                          style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 1.5rem;"
                          onclick="toggleFavorito(${jogo.IDJOGO}, this)">★</span>
                </div>
                
                <div class="card-body" style="padding: 15px; background: white; border: 1px solid #ddd; border-top: none;">
                    <p class="jogo-descricao" style="color: #444; margin-bottom: 15px;">
                        ${jogo.DESCRICAOIMAGEM || 'Sem descrição disponível.'}
                    </p>
                    <div class="detalhes-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                        <p class="detalhe-item"><strong>Licença:</strong> ${jogo.LICENSA || 'N/A'}</p>
                        <p class="detalhe-item"><strong>Idioma:</strong> ${jogo.IDIOMA || 'N/A'}</p>
                    </div>
                </div>

                <div class="card-footer" style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
                    <a href="${jogo.LINK || '#'}" target="_blank" rel="noopener noreferrer" 
                       style="color: #8B0000; font-weight: bold; text-decoration: none;">
                       ${jogo.LINK ? 'Acessar Jogo' : 'Link Indisponível'}
                    </a>
                </div>
            </div>
        `;
    });

    atualizarControlesPaginacao();
}

// ... (Mantenha as funções mudarPagina e atualizarControlesPaginacao iguais) ...

function mudarPagina(direcao) {
    const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
    const novaPagina = paginaAtual + direcao;
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        paginaAtual = novaPagina;
        renderizarJogosDaPagina();
        document.getElementById("lista").scrollIntoView({ behavior: 'smooth' }); 
    }
}

function atualizarControlesPaginacao() {
    const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProximo = document.getElementById('btnProximo');
    const infoPagina = document.getElementById('infoPagina');

    if (btnAnterior) btnAnterior.disabled = paginaAtual === 1;
    if (btnProximo) btnProximo.disabled = paginaAtual === totalPaginas || jogosCompletos.length === 0;
    if (infoPagina) infoPagina.textContent = `Página ${totalPaginas === 0 ? 0 : paginaAtual} de ${totalPaginas}`;
}

async function toggleFavorito(jogoId, elementoEstrela) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuarioLogado) {
        alert("Você precisa estar logado para favoritar!");
        return;
    }

    try {
        const response = await fetch('/api/favoritos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuarioId: usuarioLogado.id, 
                jogoId: jogoId 
            })
        });

        const data = await response.json();

        if (response.ok) {
            elementoEstrela.classList.toggle('ativa');
            // Atualiza o localStorage com o novo IDJOGO vindo do SQL
            usuarioLogado.favoritos = data.favoritos;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        }
    } catch (error) {
        console.error("Erro ao favoritar no banco SQL:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarJogos(); // ✅ mostra todos ao abrir
});
