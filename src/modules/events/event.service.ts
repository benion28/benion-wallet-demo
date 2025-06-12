import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ctx, EventPattern } from '@nestjs/microservices';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  // Handle bill payment status events
  @EventPattern('bill.payment.status')
  async handlePaymentStatus(@Ctx() data: any) {
    try {
      this.logger.log(`Handling payment status update: ${data.status} for transaction ${data.transactionId}`);
      
      // Here you can add logic to notify user, update analytics, etc.
      // For now, we'll just log the event
      this.logger.log(`Payment status updated: ${JSON.stringify(data)}`);
    } catch (error) {
      this.logger.error('Error handling payment status event:', error);
    }
  }

  // Handle bill payment failure events
  @EventPattern('bill.payment.failure')
  async handlePaymentFailure(@Ctx() data: any) {
    try {
      this.logger.error(`Handling payment failure: ${data.error} for transaction ${data.transactionId}`);
      
      // Here you can add retry logic, notify user, update analytics, etc.
      // For now, we'll just log the event
      this.logger.error(`Payment failure: ${JSON.stringify(data)}`);
    } catch (error) {
      this.logger.error('Error handling payment failure event:', error);
    }
  }

  // Handle transaction rollback events
  @EventPattern('transaction.rollback')
  async handleTransactionRollback(@Ctx() data: any) {
    try {
      this.logger.warn(`Handling transaction rollback for transaction ${data.transactionId}`);
      
      // Here you can add logic to:
      // - Retry the transaction
      // - Notify user
      // - Update analytics
      // - Log the rollback
      this.logger.warn(`Transaction rollback completed: ${JSON.stringify(data)}`);
    } catch (error) {
      this.logger.error('Error handling transaction rollback event:', error);
    }
  }
}
