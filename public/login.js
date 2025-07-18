document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const mensagemErro = document.getElementById('mensagemErro');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            try {
                const response = await fetch('/api/login', { // Altere a URL se seu endpoint for diferente
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, senha }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Login bem-sucedido
                    console.log('Login bem-sucedido:', data.usuario);
                    // Opcional: Salvar informações do usuário ou token no localStorage/sessionStorage
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                    // Redirecionar para a página principal ou dashboard
                    window.location.href = 'introducao.html';
                } else {
                    // Login falhou
                    mensagemErro.textContent = data.mensagem || 'Erro desconhecido no login.';
                }
            } catch (error) {
                console.error('Erro ao conectar com o servidor:', error);
                mensagemErro.textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
            }
        });
    }
});