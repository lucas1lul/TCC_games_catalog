# 🎮 Catálogo de Serious Games Educativos

Este projeto consiste em um **Catálogo Eletrônico de Serious Games Educativos**, desenvolvido como Trabalho de Conclusão de Curso (TCC) em Engenharia da Computação.

A aplicação tem como objetivo **organizar, classificar e disponibilizar jogos digitais educativos**, relacionando-os com **competências e habilidades curriculares**, servindo como apoio a professores e alunos.

---

## 🧠 Principais Funcionalidades

* 🔎 Filtro avançado de jogos (nome, componente, habilidade, plataforma)
* ❤️ Sistema de favoritos persistente por usuário
* ⭐ Sistema de avaliação com:

  * Avaliação por estrelas (incluindo meia estrela)
  * Persistência em JSON
  * Recuperação automática após reload
* 👤 Sistema de autenticação com sessão
* 📄 Modal de detalhes dos jogos
* 📊 Associação de jogos com habilidades e competências educacionais
* 📁 Paginação de resultados
* 🎯 Interface responsiva e baseada na identidade visual do IFF

---

## 🏗️ Arquitetura do Projeto

O sistema segue uma arquitetura organizada em camadas:

```
Frontend (HTML, CSS, JS)
        ↓
Controller (Express)
        ↓
Service (regras de negócio)
        ↓
Repository (acesso a dados JSON)
```

---

## 🧪 Tecnologias Utilizadas

### 🔧 Backend

* Node.js
* Express
* Express Session
* File System (JSON como banco temporário)

### 🎨 Frontend

* HTML5
* CSS3
* JavaScript (Vanilla)

### 🗄️ Banco de Dados

* MySQL (dados dos jogos)
* JSON (usuários e avaliações)

---

## 🚀 Como executar o projeto

### 📋 Pré-requisitos

* Node.js (LTS) → https://nodejs.org
* Git → https://git-scm.com
* MySQL Server 8+

---

### 📁 Clonar o repositório

```
git clone https://github.com/lucas1lul/TCC_games_catalog.git
cd TCC_games_catalog
```

---

### 📦 Instalar dependências

```
npm install
```

---

### ⚙️ Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz:

```
PORT=3002

DB_HOST=localhost  
DB_USER=catalogo_user  
DB_PASSWORD=root  
DB_NAME=jogosdb  
DB_PORT=3306
```

---

### ▶️ Executar o projeto

Modo desenvolvimento:

```
npm run dev
```

ou

```
node app.js
```

---

### 🌐 Acessar aplicação

* Catálogo:

```
http://localhost:3002/catalogo.html
```

* Login:

```
http://localhost:3002/login.html
```

* Meus jogos:

```
http://localhost:3002/my_game
```

---

## 👤 Sistema de Usuários

Os usuários são armazenados em:

```
src/models/usuarios.json
```

Exemplo:

```json
{
  "id": 1,
  "nome": "lucas",
  "email": "lucas@email.com",
  "senha": "hash",
  "perfil": "professor",
  "favoritos": [1, 49]
}
```

---

## ⭐ Sistema de Avaliações

As avaliações são armazenadas em:

```
data/avaliacoes.json
```

Estrutura:

```json
{
  "id": "uuid",
  "jogoId": 2,
  "usuarioId": 9,
  "usuarioNome": "professor",
  "nota": 4.5,
  "comentario": "",
  "dataCriacao": "2026-03-24T02:28:13.152Z"
}
```

### ✔ Funcionalidades

* Avaliação com estrelas (0.5 até 5)
* Persistência em arquivo JSON
* Carregamento automático ao abrir a página
* Atualização visual imediata

---

## 🔐 Autenticação

* Utiliza `express-session`
* Sessão mantida via cookie
* Endpoint principal:

```
GET /api/me
```

---

## 📌 Observações Importantes

* Projeto voltado para **uso acadêmico**
* Persistência híbrida (MySQL + JSON)
* Backend estruturado em camadas
* Código preparado para futura migração completa para banco relacional
* Sistema de avaliações permite evolução para média e ranking

---

## 🚧 Melhorias Futuras

* 🔄 Migrar avaliações para MySQL
* 📊 Exibir média de avaliações por jogo
* 🧠 Sistema de recomendação de jogos
* 🌍 Deploy em ambiente cloud

---

## 👨‍💻 AutorES

Lucas Corrado
Victor Silva Soares
Engenharia da Computação – IFF

---

## 📄 Licença

Projeto desenvolvido exclusivamente para fins acadêmicos.
