import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@jhomisorg/gittix-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
