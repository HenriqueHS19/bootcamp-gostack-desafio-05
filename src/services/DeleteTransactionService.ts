import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    // TODO
    const repository = getRepository(Transaction);

    const findTransactions = await repository.findOne({
      where: {
        id,
      },
    });

    if (findTransactions) {
      await repository.delete(id);
    } else {
      throw new AppError('Transactions not found.', 404);
    }
  }
}

export default DeleteTransactionService;
