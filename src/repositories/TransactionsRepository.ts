import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO

    const transactions = await this.find();

    const incomeValues = (await transactions).map(function (element) {
      if (element.type === 'income') {
        return Number(element.value);
      }
      return 0;
    });

    const outcomeValues = (await transactions).map(function (element) {
      if (element.type === 'outcome') {
        return Number(element.value);
      }
      return 0;
    });

    const income = incomeValues.reduce(function (accumualtor, value) {
      return accumualtor + value;
    });

    const outcome = outcomeValues.reduce(function (accumualtor, value) {
      return accumualtor + value;
    });

    const total = income - outcome;

    const balance: Balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
