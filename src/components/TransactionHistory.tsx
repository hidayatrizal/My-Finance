import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './Card';
import { getTransactions, deleteTransaction } from '../lib/transactions';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Trash2, History, ArrowUpRight } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'motion/react';

export function TransactionHistory({ refreshTrigger, onDelete }: { refreshTrigger: number, onDelete?: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const confirmDelete = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    setTransactions(transactions.filter(t => t.id !== transactionId));
    setDeletingId(null);
    if (onDelete) {
      onDelete();
    }
  };

  const handleDeleteClick = (transactionId: string) => {
    setDeletingId(transactionId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-slate-400 dark:text-zinc-500 font-bold text-sm">Memuat riwayat...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-24">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-20 h-20 bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-black/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3"
        >
          <History className="w-10 h-10 text-slate-400 dark:text-zinc-600 -rotate-3" />
        </motion.div>
        <h3 className="text-slate-800 dark:text-white font-black text-lg mb-2">Belum ada riwayat</h3>
        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Catatan harian akan muncul di sini.</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Riwayat</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Daftar transaksi harian Anda</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {transactions.map((t) => (
          <motion.div 
            variants={item}
            key={t.id} 
            className="glass-panel p-4 rounded-3xl flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/20 transition-colors"
          >
            <div className="flex gap-4 items-center flex-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center border border-slate-200 dark:border-white/5">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {format(parseISO(t.date), 'EEEE, d MMM', { locale: id })}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5 font-bold">
                  {t.adultCount + t.childCount} Org
                </p>
              </div>
            </div>
            
            <div className="text-right flex flex-col justify-center">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(t.totalIncome)}
              </span>
              {deletingId === t.id ? (
                <div className="flex items-center justify-end gap-2 mt-1">
                  <button 
                    onClick={() => setDeletingId(null)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-500 uppercase tracking-widest text-right"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => t.id && confirmDelete(t.id as string)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest text-right"
                  >
                    Ya, Hapus
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => t.id && handleDeleteClick(t.id as string)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-500 mt-1 uppercase tracking-widest text-right opacity-80 hover:opacity-100 transition-opacity"
                >
                  Hapus
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
