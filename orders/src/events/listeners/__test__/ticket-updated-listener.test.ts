import { TicketUpdatedEvent } from '@jhomisorg/gittix-common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title1',
    price: 200,
  });
  await ticket.save();

  //create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id!,
    title: 'title2',
    price: 150,
    version: ticket.version + 1,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('finds, update and save a ticket ', async () => {
  const { listener, data, ticket, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage func with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure the ack func is called
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, ticket, msg } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (error) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
