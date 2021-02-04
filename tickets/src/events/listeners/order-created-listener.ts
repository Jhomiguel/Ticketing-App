import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@jhomisorg/gittix-common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: Message
  ): Promise<void> {
    //Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, Error
    if (!ticket) throw new NotFoundError();

    //Mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    //save the ticket
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id!,
      price: ticket.price,
      title: ticket.title,
      orderId: ticket.orderId,
      version: ticket.version,
      userId: ticket.userId,
    });

    msg.ack();
  }
}
