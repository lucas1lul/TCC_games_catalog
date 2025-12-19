const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function carregar() {
    const res = await fetch("/api/games/" + id);
    const jogo = await res.json();

    document.getElementById("detalhes").innerHTML = `
        <h1>${jogo.nome}</h1>
        <p>${jogo.descricao}</p>
        <p><strong>Curso:</strong> ${jogo.curso}</p>
        <p><strong>Componente:</strong> ${jogo.componente}</p>
        <p><strong>Habilidades:</strong> ${jogo.habilidades.join(", ")}</p>
        <p><strong>Plataforma:</strong> ${jogo.plataforma}</p>

        <a href="${jogo.link}" target="_blank">
            <button>Baixar / Jogar</button>
        </a>

        <h3>Contato com o Desenvolvedor</h3>
        <button onclick="enviarContato()">Enviar mensagem</button>
    `;
}

async function enviarContato() {
    await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jogoId: id,
            emailProfessor: "professor@if.com",
            mensagem: "Olá! Gostaria de saber mais sobre o jogo."
        })
    });

    alert("Mensagem enviada ao desenvolvedor!");
}

carregar();
