import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './Card';
import { getTransactions, deleteTransaction } from '../lib/transactions';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Trash2, History } from 'lucide-react';
import { Button } from './Button';

export function TransactionHistory({ refreshTrigger }: { refreshTrigger: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [refreshTrigger]);

  const handleDelete = async (transactionId: string) => {
    if (confirm("Hapus catatan ini?")) {
      await deleteTransaction(transactionId);
      setTransactions(transactions.filter(t => t.id !== transactionId));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-slate-400 font-bold text-sm">Memuat riwayat...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-800 font-bold mb-1">Belum ada riwayat</h3>
        <p className="text-slate-500 text-sm">Catatan harian akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat</h2>
        <p className="text-sm text-slate-500">Daftar transaksi harian Anda</p>
      </div>

      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {format(parseISO(t.date), 'EEEE, d MMMM yyyy', { locale: id })}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1 font-bold">
                    {t.adultCount} Dewasa • {t.childCount} Anak
                  </p>
                </div>
              </div>
              <button 
                onClick={() => t.id && handleDelete(t.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-end border-t border-slate-50 pt-3 mt-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
              <span className="text-sm font-bold tracking-tight text-slate-700">
                {formatCurrency(t.totalIncome)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
