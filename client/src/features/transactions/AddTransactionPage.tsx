import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TransactionForm from './TransactionForm';
import { useCreateTransaction } from '../../hooks/useTransactionMutations';
import type { CreateTransactionRequest } from '../../types';

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateTransaction();

  const handleSubmit = async (data: CreateTransactionRequest) => {
    try {
      await mutateAsync(data);
      toast.success('Transaction added!');
      navigate('/transactions');
    } catch {
      toast.error('Failed to add transaction. Please try again.');
    }
  };

  return (
    <div className="page-enter max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Add Transaction
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Record a new expense or revenue
        </p>
      </div>

      <TransactionForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
};

export default AddTransactionPage;
