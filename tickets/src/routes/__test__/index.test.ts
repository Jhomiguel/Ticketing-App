import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'title', price: 30 });
};

it('True if the tickets were returned ', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/api/tickets').send({}).expect(200);

  expect(response.body.length).toEqual(3);
});
