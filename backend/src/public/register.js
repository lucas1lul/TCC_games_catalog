// register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const mensagemElement = document.getElementById('mensagem');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            const nome = document.getElementById('nome').value;
            // NOVO: Captura o valor do perfil selecionado
            const perfil = document.getElementById('perfil').value; 
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            // Validação simples para o campo perfil
            if (!perfil) {
                mensagemElement.style.color = 'red';
                mensagemElement.textContent = 'Por favor, selecione um perfil.';
                return;
            }

            try {
                // NOVO: Inclui o campo 'perfil' no body da requisição
                const requestBody = JSON.stringify({ nome, email, senha, perfil });

                const response = await fetch('/api/register', { // Endpoint de registro no seu backend
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: requestBody, // Envia o perfil
                });

                const data = await response.json();

                if (response.ok) {
                    // Registro bem-sucedido
                    mensagemElement.style.color = 'green';
                    mensagemElement.textContent = data.mensagem || 'Registro bem-sucedido! Redirecionando para o login...';
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000); 
                } else {
                    // Registro falhou
                    mensagemElement.style.color = 'red';
                    mensagemElement.textContent = data.mensagem || 'Erro desconhecido no registro.';
                }
            } catch (error) {
                console.error('Erro ao conectar com o servidor:', error);
                mensagemElement.style.color = 'red';
                mensagemElement.textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
            }
        });
    }
});