import {
  OrderCreatedEvent,
  Publisher,
  Subjects,
} from '@jhomisorg/gittix-common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
