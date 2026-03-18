import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TransactionForm from './TransactionForm';
import { useTransactions } from '../../hooks/useTransactions';
import { useUpdateTransaction } from '../../hooks/useTransactionMutations';
import type { CreateTransactionRequest } from '../../types';

const EditTransactionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useUpdateTransaction();

  // Fetch all transactions and find by id
  const { data, isLoading } = useTransactions();
  const transaction = data?.data.find((tx) => tx.id === id);

  const handleSubmit = async (data: CreateTransactionRequest) => {
    if (!id) return;
    try {
      await mutateAsync({ id, data });
      toast.success('Transaction updated!');
      navigate('/transactions');
    } catch {
      toast.error('Failed to update transaction. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="page-enter max-w-lg mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="page-enter max-w-lg mx-auto text-center py-20" style={{ color: 'var(--text-secondary)' }}>
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Transaction not found</p>
        <button
          onClick={() => navigate('/transactions')}
          className="mt-4 text-sm font-medium"
          style={{ color: 'var(--accent)' }}
        >
          ← Back to Transactions
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Edit Transaction
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Update the details below
        </p>
      </div>

      <TransactionForm
        defaultValues={{
          type: transaction.type,
          title: transaction.title,
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
          note: transaction.note,
        }}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
};

export default EditTransactionPage;
