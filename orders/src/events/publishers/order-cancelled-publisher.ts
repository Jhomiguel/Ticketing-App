import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from '@jhomisorg/gittix-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
