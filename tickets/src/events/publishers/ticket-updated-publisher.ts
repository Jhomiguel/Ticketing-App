import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@jhomisorg/gittix-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
