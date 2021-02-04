import { TicketCreatedEvent } from '@jhomisorg/gittix-common';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  //create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title1',
    price: 200,
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage func with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure a ticket was
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});
it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage func with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure the ack func is called
  expect(msg.ack).toHaveBeenCalled();
});
