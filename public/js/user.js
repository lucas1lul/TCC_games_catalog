function setStatus(msg, type = "info") {
  const el = document.getElementById("status");
  if (!el) return;
  el.textContent = msg || "";
  el.className = "status" + (type === "success" ? " success" : type === "error" ? " error" : "");
}

function getUsuarioLogado() {
  const raw = localStorage.getItem("usuarioLogado");
  return raw ? JSON.parse(raw) : null;
}

async function carregarMeusDados() {
  const user = getUsuarioLogado();
  if (!user?.id) {
    setStatus("Você precisa estar logado para acessar esta página.", "error");
    return;
  }

  setStatus("Carregando seus dados...");
  try {
    // JSON inicial: busca pelo id do usuário logado
    const res = await fetch(`/api/users/me?id=${encodeURIComponent(user.id)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Falha ao carregar usuário");

    document.getElementById("nome").value = data.nome || "";
    document.getElementById("email").value = data.email || "";
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("Não foi possível carregar seus dados.", "error");
  }
}

async function salvarAlteracoes(e) {
  e.preventDefault();

  const user = getUsuarioLogado();
  if (!user?.id) return setStatus("Sessão inválida. Faça login novamente.", "error");

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senhaAtual = document.getElementById("senhaAtual").value;
  const novaSenha = document.getElementById("novaSenha").value;
  const confirmarNovaSenha = document.getElementById("confirmarNovaSenha").value;

  if (!nome || !email) return setStatus("Nome e e-mail são obrigatórios.", "error");

  const vaiTrocarSenha = senhaAtual || novaSenha || confirmarNovaSenha;
  if (vaiTrocarSenha) {
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      return setStatus("Para alterar a senha, preencha todos os campos de senha.", "error");
    }
    if (novaSenha !== confirmarNovaSenha) {
      return setStatus("Nova senha e confirmação não conferem.", "error");
    }
    if (novaSenha.length < 6) {
      return setStatus("A nova senha deve ter pelo menos 6 caracteres.", "error");
    }
  }

  setStatus("Salvando...");

  try {
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        nome,
        email,
        senhaAtual: vaiTrocarSenha ? senhaAtual : undefined,
        novaSenha: vaiTrocarSenha ? novaSenha : undefined
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Erro ao salvar");

    // atualiza localStorage (mantém perfil/favoritos etc.)
    const atualizado = { ...user, nome, email };
    localStorage.setItem("usuarioLogado", JSON.stringify(atualizado));

    // limpa campos de senha
    document.getElementById("senhaAtual").value = "";
    document.getElementById("novaSenha").value = "";
    document.getElementById("confirmarNovaSenha").value = "";

    setStatus("Dados atualizados com sucesso!", "success");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Falha ao salvar alterações.", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarMeusDados();
  document.getElementById("formConta").addEventListener("submit", salvarAlteracoes);
});
