/**
 * TPAY TRANSACTIONS LIST - React Admin Panel
 * 
 * UBICACIÓN: src/pages/shop/TransactionsSection.tsx
 * 
 * DESCRIPCIÓN: Componente para mostrar lista de transacciones Tpay en el panel admin
 */

import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, RefreshCw, 
  ExternalLink, Copy, Search, Filter,
  TrendingUp, Eye, X
} from 'lucide-react';
import { pb } from '@/lib/pocketbase';

interface TpayTransaction {
  id: string;
  order_id: string;
  amount: number;
  description: string;
  customer_email: string;
  customer_name: string;
  currency: string;
  transaction_id: string;
  payment_url: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at: string | null;
  error_code: string | null;
  error_message: string | null;
  paid_amount: number | null;
  created: string;
}

interface TransactionsSectionProps {
  transactions: TpayTransaction[];
  onRefresh: () => void;
}

export default function TransactionsSection({ transactions, onRefresh }: TransactionsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TpayTransaction | null>(null);

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        t.order_id.toLowerCase().includes(term) ||
        t.customer_email.toLowerCase().includes(term) ||
        t.transaction_id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Resumen de estados
  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalRevenue: transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + (t.paid_amount || t.amount), 0)
  };

  const formatAmount = (amount: number) => `${(amount / 100).toFixed(2)} PLN`;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Wszystkie transakcje" 
          value={stats.total} 
          icon={<RefreshCw className="w-5 h-5" />} 
        />
        <StatCard 
          title="Oczekujące" 
          value={stats.pending} 
          icon={<Clock className="w-5 h-5 text-yellow-500" />} 
          className="border-yellow-200 bg-yellow-50"
        />
        <StatCard 
          title="Zrealizowane" 
          value={stats.completed} 
          icon={<CheckCircle className="w-5 h-5 text-green-500" />} 
          className="border-green-200 bg-green-50"
        />
        <StatCard 
          title="Przychód" 
          value={formatAmount(stats.totalRevenue)} 
          icon={<TrendingUp className="w-5 h-5 text-sky-500" />} 
          className="border-sky-200 bg-sky-50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj po ID zamówienia, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'completed', 'failed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === f 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Wszystkie' : 
               f === 'pending' ? 'Oczekujące' :
               f === 'completed' ? 'Zrealizowane' : 'Błędne'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID Zamówienia</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kwota</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Klient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Brak transakcji spełniających kryteria
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {t.order_id}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(t.transaction_id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Kopiuj ID transakcji"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold">{formatAmount(t.amount)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{t.customer_email}</p>
                        {t.customer_name && (
                          <p className="text-xs text-gray-500">{t.customer_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(t.created)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTransaction(t)}
                          className="p-2 hover:bg-sky-100 text-sky-600 rounded-lg"
                          title="Szczegóły"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {t.payment_url && (
                          <a
                            href={t.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg"
                            title="Otwórz w Tpay"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, className = '' }: any) {
  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 ${className}`}>
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Oczekuje' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Zrealizowane' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Błędne' },
    refunded: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Zwrócone' },
  };
  
  const { bg, text, label } = config[status as keyof typeof config] || config.pending;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
      {label}
    </span>
  );
}

function TransactionDetailModal({ transaction, onClose }: { transaction: TpayTransaction; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold">Szczegóły transakcji</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <DetailRow label="ID Zamówienia" value={transaction.order_id} />
          <DetailRow label="ID Transakcji Tpay" value={transaction.transaction_id} />
          <DetailRow label="Kwota" value={`${(transaction.amount / 100).toFixed(2)} PLN`} />
          <DetailRow label="Status" value={<StatusBadge status={transaction.status} />} />
          <DetailRow label="Email klienta" value={transaction.customer_email} />
          {transaction.customer_name && (
            <DetailRow label="Nazwa klienta" value={transaction.customer_name} />
          )}
          {transaction.paid_at && (
            <DetailRow label="Data płatności" value={new Date(transaction.paid_at).toLocaleString('pl-PL')} />
          )}
          {transaction.error_code && (
            <DetailRow label="Kod błędu" value={transaction.error_code} />
          )}
          {transaction.error_message && (
            <DetailRow label="Wiadomość błędu" value={transaction.error_message} />
          )}
          <DetailRow label="Data utworzenia" value={new Date(transaction.created).toLocaleString('pl-PL')} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// ============================================================================
// HOOK PARA CARGAR TRANSACCIONES
// ============================================================================

export function useTpayTransactions(websiteId: string) {
  const [transactions, setTransactions] = useState<TpayTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('tpay_transactions').getList(1, 500, {
        filter: `website_id = "${websiteId}"`,
        sort: '-created'
      });
      setTransactions(records.items as unknown as TpayTransaction[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [websiteId]);

  return { transactions, loading, error, refetch: fetchTransactions };
}