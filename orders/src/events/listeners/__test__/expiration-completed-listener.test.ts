import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompletedListener } from '../expiration-completed-listener';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';
import {
  ExpirationCompletedEvent,
  OrderStatus,
} from '@jhomisorg/gittix-common';

const setup = async () => {
  const listener = new ExpirationCompletedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title1',
    price: 200,
  });
  await ticket.save();

  const order = Order.build({
    userId: '1213',
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  });
  await order.save();

  const data: ExpirationCompletedEvent['data'] = {
    orderId: order.id!,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, data, order, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cacelled);
});

it('emit an order cancelled event', async () => {
  const { listener, data, order, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
