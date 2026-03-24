document.addEventListener("DOMContentLoaded", carregarNavbar);

async function carregarNavbar() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  let usuario = null;

  try {
    const response = await fetch("/api/me", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache"
      },
      credentials: "include"
    });

    // 1. Verificamos se o status é 200 OK
    if (response.ok) {
      const data = await response.json();
      console.log("Dados brutos da API:", data);
      // 2. Verificamos se o objeto 'user' existe dentro de 'data' e não está vazio
      if (data && data.user && data.user.nome) {
        usuario = (data && data.user) ? data.user : null;
      } else {
        usuario = null;
      }
    } else {
      usuario = null;
    }

  } catch (err) {
    console.warn("Erro de conexão, tratando como deslogado.");
    usuario = null;
  }

  renderNavbar(usuario, placeholder);
}

function renderNavbar(usuario, container) {

  container.innerHTML = `
    <nav class="navbar-iff">

      <div class="nav-section nav-left">
        <a href="/catalogo">
          <img src="/images/iff.jpeg" class="navbar-logo" alt="Logo IFF">
        </a>
      </div>

      <div class="nav-section nav-center">
        <h1 class="navbar-title">Catálogo de Jogos Educativos</h1>
      </div>

      <div class="nav-section nav-right">
        ${usuario ? navbarLogado(usuario) : navbarDeslogado()}
      </div>

    </nav>
  `;
}

function navbarDeslogado() {
  return `<a href="/login" class="btn-login-header">Entrar</a>`;
}

function navbarLogado(usuario) {
  return `
    <div class="user-dropdown-container">

      <div class="user-info-display">
        <span class="user-name">${usuario.nome}</span>
        <span class="user-role-badge">${usuario.perfil}</span>
      </div>

      <div class="dropdown">

        <button class="btn-menu-hamburger" onclick="toggleMenu()" aria-label="Abrir menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul id="dropdownMenu" class="dropdown-content">
          <li><a href="/user">Perfil</a></li>
          <li><a href="/catalogo">Catálogo</a></li>
          <li><a href="/my_game">Meus jogos</a></li>
          <li class="divider"></li>
          <li><button onclick="logoutSistema()">Sair</button></li>
        </ul>

      </div>

    </div>
  `;
}

function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
}

async function logoutSistema() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include"
    });

    if (response.ok) {
      // Pequeno truque: usamos o replace para o navegador carregar a página 
      // do zero, limpando o estado do JavaScript da Navbar
      window.location.replace("/login");
    }
  } catch (e) {
    console.warn("Erro ao fazer logout");
    window.location.href = "/login";
  }
}

/* garante acesso global para onclick */
window.toggleMenu = toggleMenu;
window.logoutSistema = logoutSistema;