document.addEventListener("DOMContentLoaded", carregarNavbar);

async function carregarNavbar() {

  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  let usuario = null;

  try {

    const response = await fetch("/api/me", {
      credentials: "include"
    });

    const data = await response.json();

    usuario = data.user;

  } catch (err) {
    console.warn("Erro ao buscar sessão");
  }

  renderNavbar(usuario, placeholder);
}

function renderNavbar(usuario, container) {

  container.innerHTML = `
  
  <nav class="navbar-iff">

    <div class="nav-section nav-left">
      <a href="/catalogo">
        <img src="/images/iff.jpeg" class="navbar-logo">
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

      <button class="btn-menu-hamburger" onclick="toggleMenu()">
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

  if (menu) {
    menu.classList.toggle("show");
  }

}

async function logoutSistema() {

  await fetch("/api/logout", {
    method: "POST",
    credentials: "include"
  });

  window.location.href = "/login";

}