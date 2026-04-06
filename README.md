# 🎮 Catálogo de Jogos Educativos

Este projeto consiste em um **Catálogo Eletrônico de Jogos Educativos**, desenvolvido como Trabalho de Conclusão de Curso (TCC) em Engenharia da Computação.

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

## 🏗️ Arquitetura do Projeto (Padrão MVC)

O sistema foi desenvolvido utilizando o padrão de projeto **MVC (Model-View-Controller)**, estruturado em camadas para garantir a separação de responsabilidades, facilitar a manutenção e permitir a escalabilidade do catálogo de Jogos Educativos.

### 🔄 Fluxo de Dados e Camadas

A arquitetura segue um fluxo de controle onde cada componente possui um papel definido, evitando o acoplamento excessivo:

1.  **View (Frontend):** Interface do usuário construída com HTML5, CSS3 e JavaScript. Utiliza a **Fetch API** para realizar requisições assíncronas ao servidor.
2.  **Routes (Roteamento):** Utiliza o `express.Router()` para mapear os endpoints da API e direcionar as requisições para os controllers correspondentes.
3.  **Controller (Controle):** Gerencia o fluxo de entrada, processa os parâmetros das requisições e envia a resposta final ao cliente (JSON).
4.  **Service (Lógica de Negócio):** Camada onde reside a inteligência do sistema, incluindo a aplicação da **Taxonomia CSG** e o vínculo com as diretrizes da **DCN**.
5.  **Repository (Persistência):** Camada de abstração de dados que executa as operações de CRUD diretamente no **MySQL**.

---

### 📂 Detalhamento das Responsabilidades

#### 🌐 View
Responsável por renderizar a interface e capturar interações. No projeto, as views são dinâmicas, consumindo dados do backend e utilizando componentes reutilizáveis (Navbar/Footer) injetados via JavaScript para manter a consistência visual.

#### 🛣️ Routes
Define as portas de entrada da aplicação. Ao separar as rotas em arquivos específicos (ex: `gameRoutes.js`, `userRoutes.js`), o sistema mantém uma organização clara, facilitando a identificação de endpoints de administração e de usuários comuns.

#### 🎮 Controller
Atua como o "cérebro" da requisição. Ele não executa lógica de banco de dados nem regras complexas; sua função é validar se os dados chegaram corretamente, chamar o serviço adequado e retornar o status HTTP correto (ex: `200 OK`, `201 Created` ou `404 Not Found`).

#### 🧠 Service Layer
Implementa o rigor acadêmico do projeto. É nesta camada que os jogos são classificados conforme a metodologia de **de Lope e Medina (2016)** e onde as competências da **Engenharia da Computação** são validadas frente aos parâmetros da educação nacional.

#### 💾 Repository / Model
Encapsula toda a lógica de acesso ao banco de dados. Utiliza o driver do **MySQL** para realizar consultas, garantindo que a lógica SQL fique isolada das regras de negócio do sistema.

---

## 🧪 Tecnologias Utilizadas

* **Arquitetura:** MVC com Service Layer
* **Protocolo:** REST API (JSON)

### 🔧 Backend

* Node.js
* Express
* Express Session

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
node app.js
```

---

### 🌐 Acessar aplicação

* Catálogo:

```
http://localhost:3002/catalogo
```

* Login:

```
http://localhost:3002/login
```

* Meus jogos:

```
http://localhost:3002/my_game
```

* Configurações do Usuário:

```
http://localhost:3002/user
```
* Sobre:

```
http://localhost:3002/introducao
```

* Registro de Usuário:

```
http://localhost:3002/register
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

## 👨‍💻 Autores

Lucas Corrado Albertão
Victor Silva Soares
Engenharia da Computação – IFF

---

## 📄 Licença

Projeto desenvolvido exclusivamente para fins acadêmicos.
