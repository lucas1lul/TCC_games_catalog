document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const mensagemErro = document.getElementById('mensagemErro');

  if (!loginForm) return;

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    mensagemErro.textContent = 'Carregando...';
    mensagemErro.style.color = 'blue';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ⭐ ESSENCIAL para sessão
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {

        mensagemErro.style.color = 'green';
        mensagemErro.textContent = 'Login realizado com sucesso! Redirecionando...';

        // opcional: manter no localStorage para uso rápido na UI
        if (data.user) {
          localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
        }

        setTimeout(() => {
          window.location.href = '/catalogo';
        }, 800);

      } else {

        mensagemErro.style.color = 'red';
        mensagemErro.textContent = data.error || 'E-mail ou senha incorretos.';
      }

    } catch (error) {

      console.error('Erro na requisição:', error);
      mensagemErro.style.color = 'red';
      mensagemErro.textContent = 'Não foi possível conectar ao servidor.';
    }
  });
});