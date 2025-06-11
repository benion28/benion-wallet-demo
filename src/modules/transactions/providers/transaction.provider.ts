import { getModelToken } from '@nestjs/mongoose';
import { TransactionSchema } from '../schemas/transaction.schema';

export const TransactionProvider = {
  provide: 'TransactionModel',
  useFactory: async (connection) => {
    const model = await connection.model('Transaction', TransactionSchema);
    return model;
  },
  inject: [getModelToken('MongooseModule')]
};
