import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@jhomisorg/gittix-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
