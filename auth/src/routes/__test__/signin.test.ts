import request from 'supertest';
import { app } from '../../app';

it('Fails when an email that doesnt exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '1234',
    })
    .expect(400);
});

it('Fails when an incorrent password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '1234',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'asdas',
    })
    .expect(400);
});

it('Respond with a cookie when giving valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '1234',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '1234',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
