import {
  ExpirationCompletedEvent,
  Publisher,
  Subjects,
} from "@jhomisorg/gittix-common";
export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
  subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;
}
