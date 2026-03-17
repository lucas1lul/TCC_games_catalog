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

  // Preenche formulário de perfil
  document.getElementById("nome").value = usuarioLogado.nome || "";
  document.getElementById("email").value = usuarioLogado.email || "";

  // 2. Se for admin, mostra o formulário de cadastro de jogos
  if (usuarioLogado.perfil === 'administrador' || usuarioLogado.perfil === 'professor') {
    document.getElementById("area-admin").style.display = "block";
  }
}

// Lógica de salvar dados do usuário (Nome/Senha)
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
      // Limpa campos de senha
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

// js/user.js
async function cadastrarJogo(e) {
  e.preventDefault();

  const jogo = {
    nome: document.getElementById("nome_jogo").value, // Pega do ID novo e envia chave minúscula
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

    const result = await response.json();

    if (response.ok) {
      alert("Jogo cadastrado com sucesso!");
      location.reload(); // Recarrega para ver o novo jogo no catálogo
    } else {
      alert("Erro: " + (result.error || result.message));
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosIniciais();
  document.getElementById("formConta").addEventListener("submit", salvarAlteracoes);
  document.getElementById("formCadastroJogo").addEventListener("submit", cadastrarJogo);
});