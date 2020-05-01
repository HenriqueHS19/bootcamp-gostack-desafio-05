import { getRepository, In } from 'typeorm';
import csv from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    // TODO

    const repositoryCategory = getRepository(Category);
    const repositoryTransaction = getRepository(Transaction);

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csv({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async function (line) {
      const [title, type, value, category] = line.map(function (cell: string) {
        return cell.trim();
      });

      if (!title || !type || !value) {
        return null;
      }

      categories.push(category);
      transactions.push({ title, type, value, category });
      return null;
    });

    await new Promise(function (resolve) {
      parseCSV.on('end', resolve);
    });

    const existentCategories = await repositoryCategory.find({
      where: {
        title: In(categories),
      },
    });

    const titlesCategories = existentCategories.map(function (
      element: Category,
    ) {
      return element.title;
    });

    const addCategoriesTitles = categories
      .filter(category => !titlesCategories.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = repositoryCategory.create(
      addCategoriesTitles.map(title => ({
        title,
      })),
    );

    await repositoryCategory.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = repositoryTransaction.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await repositoryTransaction.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
