import { pool } from '../db';
import type { Transaction, CreateTransactionBody, SummaryDto } from '../types';

const PAGE_SIZE = 20;

export async function getTransactions(
  userId: string,
  filters: { type?: string; category?: string; search?: string; page?: number }
): Promise<{ rows: Transaction[]; total: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = ['user_id = $1'];
  const values: unknown[] = [userId];
  let idx = 2;

  if (filters.type) {
    conditions.push(`type = $${idx++}`);
    values.push(filters.type);
  }
  if (filters.category) {
    conditions.push(`category = $${idx++}`);
    values.push(filters.category);
  }
  if (filters.search) {
    conditions.push(`(title ILIKE $${idx} OR note ILIKE $${idx})`);
    values.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM transactions WHERE ${where}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await pool.query<Transaction>(
    `SELECT * FROM transactions WHERE ${where} ORDER BY date DESC, created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, PAGE_SIZE, offset]
  );

  return { rows: dataResult.rows, total };
}

export async function getById(id: string, userId: string): Promise<Transaction | null> {
  const result = await pool.query<Transaction>(
    'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] ?? null;
}

export async function createTransaction(
  userId: string,
  body: CreateTransactionBody
): Promise<Transaction> {
  const result = await pool.query<Transaction>(
    `INSERT INTO transactions (user_id, type, title, amount, category, date, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, body.type, body.title, body.amount, body.category, body.date, body.note ?? null]
  );
  return result.rows[0];
}

export async function updateTransaction(
  id: string,
  userId: string,
  body: CreateTransactionBody
): Promise<Transaction | null> {
  const result = await pool.query<Transaction>(
    `UPDATE transactions
     SET type = $1, title = $2, amount = $3, category = $4, date = $5, note = $6
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [body.type, body.title, body.amount, body.category, body.date, body.note ?? null, id, userId]
  );
  return result.rows[0] ?? null;
}

export async function deleteTransaction(id: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getSummary(userId: string): Promise<SummaryDto> {
  const totalsResult = await pool.query<{ type: string; total: string }>(
    `SELECT type, COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = $1
     GROUP BY type`,
    [userId]
  );

  let totalIncome = 0;
  let totalExpenses = 0;
  for (const row of totalsResult.rows) {
    if (row.type === 'revenue') totalIncome = parseFloat(row.total);
    if (row.type === 'expense') totalExpenses = parseFloat(row.total);
  }

  const categoryResult = await pool.query<{ category: string; total: string }>(
    `SELECT category, COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = $1 AND type = 'expense'
     GROUP BY category
     ORDER BY total DESC`,
    [userId]
  );

  const trendsResult = await pool.query<{ month: string; income: string; expenses: string }>(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
       COALESCE(SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
     FROM transactions
     WHERE user_id = $1
       AND date >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
     GROUP BY DATE_TRUNC('month', date)
     ORDER BY DATE_TRUNC('month', date) ASC`,
    [userId]
  );

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    expensesByCategory: categoryResult.rows.map(r => ({
      category: r.category,
      total: parseFloat(r.total),
    })),
    monthlyTrends: trendsResult.rows.map(r => ({
      month: r.month,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
    })),
  };
}
