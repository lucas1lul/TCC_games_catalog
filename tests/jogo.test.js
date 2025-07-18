const request = require('supertest');
const app = require('../app'); // Ou index.js, depende de onde está seu Express

describe('Auth routes', () => {
  it('deve registrar um novo usuário', async () => {
    const res = await request(app)
      .post('/api/jogoRoutes/register')
      .send({
        nome: 'Lucas',
        email: 'lucas2@email.com',
        senha: '123456'
      });
    expect(res.statusCode).toEqual(201);
  });

  it('deve logar um usuário existente', async () => {
    const res = await request(app)
      .post('/api/jogoRoutes/login')
      .send({
        email: 'lucas2@email.com',
        senha: '123456'
      });
    expect(res.statusCode).toEqual(200);
  });
});
