import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  async publish(eventName: string, payload: any) {
    // Mock event publishing, e.g., to a queue or message broker
    this.logger.log(`Event published: ${eventName} with payload: ${JSON.stringify(payload)}`);
    // Here you would implement actual queue or pub/sub logic
  }
}
