// js/navbar.js
document.addEventListener('DOMContentLoaded', function() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;

    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

    const navbarHTML = `
        <nav class="navbar-iff">
            <div class="nav-section nav-left">
                <a href="/catalogo">
                    <img src="/images/iff.jpeg" alt="Logo IFF" class="navbar-logo">
                </a>
            </div>
            
            <div class="nav-section nav-center">
                <h1 class="navbar-title">Catálogo de Jogos Educativos</h1>
            </div>

            <div class="nav-section nav-right">
                ${!usuario ? `
                    <a href="/" class="btn-login-header">Entrar</a>
                ` : `
                    <div class="user-dropdown-container">
                        <div class="user-info-display">
                            <span class="user-name">${usuario.nome}</span>
                            <span class="user-role-badge">${usuario.perfil}</span>
                        </div>
                        
                        <div class="dropdown">
                            <button class="btn-menu-hamburger" onclick="toggleMenu()" aria-label="Menu de configurações">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                            
                            <ul id="dropdownMenu" class="dropdown-content">
                                <li><a href="/user" class="menu-item-profile"><strong>${usuario.perfil}</strong></a></li>
                                <li><a href="/my_game">Meus Jogos</a></li>
                                <li class="divider"></li>
                                <li><button onclick="logoutSistema()" class="btn-logout-item">Sair</button></li>
                            </ul>
                        </div>
                    </div>
                `}
            </div>
        </nav>
    `;

    navbarPlaceholder.innerHTML = navbarHTML;
});

function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
}

function logoutSistema() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = '/';
}

// Fecha o menu se clicar fora dele
window.onclick = function(event) {
    if (!event.target.closest('.dropdown')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let d of dropdowns) {
            if (d.classList.contains('show')) d.classList.remove('show');
        }
    }
}