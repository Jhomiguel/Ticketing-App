import {
  ExpirationCompletedEvent,
  Listener,
  NotFoundError,
  OrderStatus,
  Subjects,
} from '@jhomisorg/gittix-common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { queueGroupName } from './queue-group-name';

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent> {
  subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ExpirationCompletedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) throw new NotFoundError();
    if (order.status === OrderStatus.Complete) return msg.ack();

    order.set({ status: OrderStatus.Cacelled });
    await order.save();

    new OrderCancelledPublisher(this.client).publish({
      id: order.id!,
      version: order.version,
      ticket: {
        id: order.ticket.id!,
      },
    });

    msg.ack();
  }
}
