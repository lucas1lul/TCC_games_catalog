document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const mensagemErro = document.getElementById('mensagemErro');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            // 1. BLOQUEIA o comportamento padrão (impede o ?email= na URL)
            event.preventDefault(); 

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            // Limpa mensagens anteriores
            mensagemErro.textContent = 'Carregando...';
            mensagemErro.style.color = 'blue';

            try {
                // 2. ENVIA os dados para a API
                const response = await fetch('/api/login', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, senha }),
                });

                const data = await response.json(); 

                if (response.ok) {
                    // 3. SUCESSO: Salva os dados do usuário para as outras páginas usarem
                    mensagemErro.style.color = 'green';
                    mensagemErro.textContent = 'Login realizado com sucesso! Redirecionando...';

                    // Salvamos o objeto completo (id, nome, email, perfil)
                    // Isso é o que a página my_games.js vai ler para saber se é Admin ou Aluno
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));

                    // 4. REDIRECIONA
                    setTimeout(() => {
                        window.location.href = '/catalogo'; 
                    }, 800); 
                    
                } else {
                    // 5. ERRO DE CREDENCIAIS (401, 404, etc)
                    mensagemErro.style.color = 'red';
                    mensagemErro.textContent = data.mensagem || 'E-mail ou senha incorretos.';
                }

            } catch (error) {
                // 6. ERRO DE CONEXÃO OU SERVIDOR FORA DO AR
                console.error('Erro na requisição:', error);
                mensagemErro.style.color = 'red';
                mensagemErro.textContent = 'Não foi possível conectar ao servidor. Tente mais tarde.';
            }
        });
    }
});