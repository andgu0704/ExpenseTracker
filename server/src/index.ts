import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth';
import transactionRoutes from './routes/transactions';

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Health check (public)
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// All /api routes require JWT auth
app.use('/api/transactions', authenticate, transactionRoutes);

app.listen(PORT, () => {
  console.log(`ExpenseTracker API running on http://localhost:${PORT}`);
});
