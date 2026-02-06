# Catálogo de Serious Games 🎮📚

Este projeto é um **Catálogo de Serious Games Educativos**, desenvolvido como parte de um trabalho acadêmico, utilizando **Node.js, Express, HTML, CSS, MySQL e JavaScript**.

Atualmente, a aplicação utiliza **dados em JSON** para simular persistência de usuários e o MySQL para os dados sobre os jogos. A integração completa com banco de dados será adicionada futuramente.

---

## 🚀 Como executar o projeto em uma máquina nova

### 📋 Pré-requisitos

Antes de executar o projeto em uma máquina nova, instale:

- Node.js (LTS)  
  https://nodejs.org
- Git  
  https://git-scm.com
- MySQL Server 8.x

Verifique se o Node está instalado:

```
node -v  
npm -v
```

---

### 📁 Clonando o projeto

git clone https://github.com/lucas1lul/TCC_games_catalog.git  
cd TCC_games_catalog

---

### 📦 Instalando as dependências

Na pasta raiz do projeto, execute:

`npm install`

---

## ⚙️ Configuração do ambiente (.env)

Crie um arquivo chamado `.env` na raiz do projeto e adicione o seguinte conteúdo:

```
PORT=3002

DB_HOST=localhost  
DB_USER=catalogo_user  
DB_PASSWORD=root  
DB_NAME=jogosdb  
DB_PORT=3306
```
Observação: as variáveis de ambiente devem ser ajustadas de acordo com o seu banco local.

---

### ▶️ Executando o projeto

Modo desenvolvimento:

`npm run dev`

O servidor será iniciado em:

`http://localhost:3002`

---

### 🌐 Acessando o sistema

Página inicial / login:  
`http://localhost:3002/index.html`

Catálogo de jogos:  
`http://localhost:3002/catalogo.html`

---

### 👤 Usuários (modo JSON)

Atualmente, os dados de usuário são armazenados no arquivo:

models/usuarios.json

Exemplo de estrutura de usuário:

```
{
    "id": 1,
    "nome": "lucas",
    "email": "lucascorrado@hotmail.com",
    "senha": "$2b$10$f8yB8aqDGJmGeTlJet.X/OS/Bfk1LPA8LZaKTYEspmS9/B2ZqjNyW",
    "perfil": "administrador",
    "favoritos": [
      1,
      49
    ]
  }

```

---

### 🧠 Observações importantes

- O projeto utiliza arquivos estáticos (HTML, CSS e JavaScript) no frontend.
- A navbar é dinâmica e lê os dados do usuário logado via localStorage.
- A persistência em banco de dados MySQL será integrada por completo futuramente, substituindo o uso de arquivos JSON.
- As senhas não estão criptografadas nesta fase, pois o objetivo é apenas prototipação e testes locais.
- O projeto foi desenvolvido para execução local e não requer configurações adicionais de ambiente além do Node.js.

---

Projeto desenvolvido para fins acadêmicos (TCC).
