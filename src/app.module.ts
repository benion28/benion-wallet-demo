import { Logger, Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { BillsModule } from './modules/bills/bills.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { EventsModule } from './modules/events/events.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { PaymentModule } from './modules/payment/payment.module';

const logger = new Logger('MongoDB');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<MongooseModuleOptions> => {
        const uri = configService.get<string>('MONGODB_URI');
        
        if (!uri) {
          const error = 'MONGODB_URI is not defined in environment variables';
          logger.error(error);
          throw new Error(error);
        }

        logger.log(`📚 Attempting to connect to MongoDB at: ${uri.split('@')[1] || uri}`);
        
        return {
          uri,
          retryAttempts: 5,
          retryDelay: 1000,
          connectionFactory: (connection) => {
            if (connection.readyState === 1) {
              logger.log('✅ Successfully connected to MongoDB');
            }

            connection.on('connected', () => {
              logger.log('✅ MongoDB connection event: Connected');
            });
            
            connection.on('disconnected', () => {
              logger.warn('ℹ️ MongoDB connection event: Disconnected');
            });
            
            connection.on('reconnected', () => {
              logger.log('🔄 MongoDB connection event: Reconnected');
            });
            
            connection.on('error', (error) => {
              logger.error('❌ MongoDB connection error:', error);
            });
            
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    WalletModule,
    BillsModule,
    UsersModule,  // This should be the only users-related module imported
    TransactionsModule,
    EventsModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestLoggerMiddleware to all routes
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*');
  }
}