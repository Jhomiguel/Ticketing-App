import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('Marks an order as cancelled', async () => {
  //Create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  });
  await ticket.save();

  const user = global.signin();
  //Make request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  //make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toBe(OrderStatus.Cacelled);
});

it('publish an order:cancelled event', async () => {
  //Create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  });
  await ticket.save();

  const user = global.signin();
  //Make request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
