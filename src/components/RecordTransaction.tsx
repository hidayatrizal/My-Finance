import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { addTransaction } from '../lib/transactions';
import { ServicePrices } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export function RecordTransaction({ prices, onSuccess }: { prices: ServicePrices, onSuccess: () => void }) {
  const [adultCount, setAdultCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const adultTotal = adultCount * prices.adult;
  const childTotal = childCount * prices.child;
  const grandTotal = adultTotal + childTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adultCount === 0 && childCount === 0) return;
    
    setIsSubmitting(true);
    try {
      await addTransaction({
        date,
        adultCount,
        childCount,
        adultPrice: prices.adult,
        childPrice: prices.child,
        totalIncome: grandTotal,
        createdAt: Date.now()
      });
      onSuccess();
      setAdultCount(0);
      setChildCount(0);
    } catch (error) {
      console.error("Failed to save transaction", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Catat</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Pemasukan harian</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
              Tanggal
            </label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
              className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 w-full block [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:mr-2"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
              Transaksi
            </label>
            <div className="flex flex-col gap-3">
              <div className="glass-panel p-5 rounded-[1.5rem] flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-slate-800 dark:text-white block">Dewasa</span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">{formatCurrency(prices.adult)} / org</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-full border border-slate-200 dark:border-white/5">
                  <motion.button whileTap={{ scale: 0.9 }} type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors" onClick={() => setAdultCount(Math.max(0, adultCount - 1))}>-</motion.button>
                  <span className="w-6 text-center text-lg font-black text-slate-800 dark:text-white">{adultCount}</span>
                  <motion.button whileTap={{ scale: 0.9 }} type="button" className="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 flex items-center justify-center text-xl font-medium shadow-sm text-slate-900 dark:text-white" onClick={() => setAdultCount(adultCount + 1)}>+</motion.button>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-[1.5rem] flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-slate-800 dark:text-white block">Anak-anak</span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">{formatCurrency(prices.child)} / org</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-full border border-slate-200 dark:border-white/5">
                  <motion.button whileTap={{ scale: 0.9 }} type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors" onClick={() => setChildCount(Math.max(0, childCount - 1))}>-</motion.button>
                  <span className="w-6 text-center text-lg font-black text-slate-800 dark:text-white">{childCount}</span>
                  <motion.button whileTap={{ scale: 0.9 }} type="button" className="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 flex items-center justify-center text-xl font-medium shadow-sm text-slate-900 dark:text-white" onClick={() => setChildCount(childCount + 1)}>+</motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          key={grandTotal}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-slate-900 dark:bg-black p-8 rounded-[2rem] text-white shadow-xl shadow-slate-900/20 dark:shadow-black/50 relative overflow-hidden border border-slate-800 dark:border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/50 dark:bg-zinc-800/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Estimasi</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
              {formatCurrency(grandTotal)}
            </h2>
            <div className="mt-6 pt-5 border-t border-slate-800 dark:border-white/10 w-full flex justify-between items-center">
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">{adultCount + childCount} Pelanggan</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse"></div>
            </div>
          </div>
        </motion.div>

        <motion.button 
          whileTap={{ scale: (isSubmitting || (adultCount === 0 && childCount === 0)) ? 1 : 0.98 }}
          type="submit" 
          disabled={isSubmitting || (adultCount === 0 && childCount === 0)}
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black py-5 rounded-[1.5rem] tracking-widest uppercase hover:bg-slate-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </motion.button>
      </form>
    </div>
  );
}
