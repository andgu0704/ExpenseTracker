import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth';
import * as repo from '../repositories/transactionRepository';
import type { TransactionDto } from '../types';
import type { Transaction } from '../types';

const router = Router();

const transactionSchema = z.object({
  type: z.enum(['expense', 'revenue']),
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().optional(),
});

function toDto(t: Transaction): TransactionDto {
  return {
    id: t.id,
    type: t.type,
    title: t.title,
    amount: parseFloat(String(t.amount)),
    category: t.category,
    date: typeof t.date === 'string' ? t.date : (t.date as Date).toISOString().split('T')[0],
    note: t.note,
    createdAt: t.created_at,
  };
}

// GET /api/transactions
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const filters = {
      type: req.query.type as string | undefined,
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
      page,
    };

    const { rows, total } = await repo.getTransactions(req.userId!, filters);
    res.json({ data: rows.map(toDto), total, page });
  } catch (err) {
    console.error('GET /transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions/summary
router.get('/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const summary = await repo.getSummary(req.userId!);
    res.json(summary);
  } catch (err) {
    console.error('GET /transactions/summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/transactions
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  try {
    const transaction = await repo.createTransaction(req.userId!, parsed.data);
    res.status(201).json(toDto(transaction));
  } catch (err) {
    console.error('POST /transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  try {
    const transaction = await repo.updateTransaction(req.params.id, req.userId!, parsed.data);
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(toDto(transaction));
  } catch (err) {
    console.error('PUT /transactions/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await repo.deleteTransaction(req.params.id, req.userId!);
    if (!deleted) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /transactions/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
