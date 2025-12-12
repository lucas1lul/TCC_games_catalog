document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const mensagemErro = document.getElementById('mensagemErro');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            try {
                // Endpoint de login (Ajuste conforme o seu backend)
                const response = await fetch('/api/login', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, senha }),
                });

                // Tenta processar a resposta como JSON
                // Atenção: A imagem de erro mostrava 'Unexpected token <', indicando que
                // o servidor estava retornando HTML (talvez uma página de erro) em vez de JSON.
                // Isso precisa ser corrigido no seu backend para retornar um JSON válido.
                const data = await response.json(); 

                if (response.ok) {
                    // LOGIN BEM-SUCEDIDO (Status 200-299): REDIRECIONAR PARA O CATÁLOGO
                    
                    mensagemErro.style.color = 'green';
                    mensagemErro.textContent = data.mensagem || 'Login bem-sucedido!';

                    // CHAVE: Redireciona para o catalogo.html
                    setTimeout(() => {
                        window.location.href = 'catalogo.html'; 
                    }, 100); 
                    
                } else {
                    // Login falhou (Status 4xx ou 5xx)
                    mensagemErro.style.color = 'red';
                    mensagemErro.textContent = data.mensagem || 'Credenciais inválidas! Tente novamente.';
                }
            } catch (error) {
                // Erro de conexão ou erro no processamento do JSON (ex: 'Unexpected token <')
                console.error('Erro ao tentar conectar ou processar resposta:', error);
                mensagemErro.style.color = 'red';
                mensagemErro.textContent = 'Erro ao conectar com o servidor. Verifique a API. (Possível erro no retorno JSON).';
            }
        });
    }
});