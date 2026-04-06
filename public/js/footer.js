function carregarRodape() {
    const footerHTML = `
    <footer class="main-footer">
        <div class="footer-container">
            <div class="footer-info">
                <p>&copy; 2026 Catálogo de Jogos Educativos - IFF Campos Centro</p>
            </div>
            <div class="footer-links">
                <a href="/introducao" class="btn-footer">Sobre o Projeto</a>
            </div>
        </div>
    </footer>`;

    // Insere o rodapé no final do body
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

document.addEventListener("DOMContentLoaded", carregarRodape);