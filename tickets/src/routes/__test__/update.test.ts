import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('return 404 if the provided id does not exists', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'title', price: 40 })
    .expect(404);
});

it('return 401 if the user is not authenticated ', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'title', price: 40 })
    .expect(401);
});

it('return 401 if the user dont own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'title', price: 50 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'title2', price: 15 })
    .expect(401);
});

it('return 404 if the user provides invalid inputs', async () => {
  const cookie =  global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({ title: 'title', price: 50 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 15 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'title', price: -15 })
    .expect(400);
});

it('return 200 if the user provides valid inputs', async () => {

  const cookie =  global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'title', price: 50 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'title2', price: 60 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('title2');
  expect(ticketResponse.body.price).toEqual(60);
});

it('publishes an event', async () => {
  const cookie =  global.signin()
 
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({ title: 'title', price: 50 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'title2', price: 60 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('throw an error if the ticket is reserved', async () => {
  const cookie =  global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'title', price: 50 });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie',cookie)
    .send({ title: 'title2', price: 60 })
    .expect(400);
});
