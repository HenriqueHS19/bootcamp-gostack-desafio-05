import {
  getRepository,
  getCustomRepository,
  TransactionRepository,
} from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const repositoryTransaction = getCustomRepository(TransactionsRepository);
    const repositoryCategory = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await repositoryTransaction.getBalance();

      if (value > total) {
        throw new AppError('transaction not approved', 400);
      }
    }

    let findCategory = await repositoryCategory.findOne({
      where: {
        title: category,
      },
    });

    if (!findCategory) {
      findCategory = repositoryCategory.create({
        title: category,
      });
      await repositoryCategory.save(findCategory);
    }

    const transaction = repositoryTransaction.create({
      title,
      type,
      value,
      category: findCategory,
    });

    await repositoryTransaction.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
