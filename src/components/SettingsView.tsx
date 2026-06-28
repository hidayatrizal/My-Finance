import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { updatePrices } from '../lib/settings';
import { ServicePrices } from '../types';

export function Settings({ prices, onPricesChange }: { prices: ServicePrices, onPricesChange: (p: ServicePrices) => void }) {
  const [adultPrice, setAdultPrice] = useState(prices.adult.toString());
  const [childPrice, setChildPrice] = useState(prices.child.toString());
  const [targetIncome, setTargetIncome] = useState((prices.targetIncome || 500000).toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const newPrices = {
        adult: parseInt(adultPrice) || 0,
        child: parseInt(childPrice) || 0,
        targetIncome: parseInt(targetIncome) || 500000,
      };
      await updatePrices(newPrices);
      onPricesChange(newPrices);
      setMessage('Pengaturan berhasil diperbarui.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to update prices", error);
      setMessage('Gagal memperbarui pengaturan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pengaturan</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Kelola harga layanan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-1">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4 px-6 pt-6">Harga Layanan</h3>
          <CardContent className="space-y-5 pt-0">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Dewasa (Rp)</label>
              <Input 
                type="number" 
                min="0"
                value={adultPrice} 
                onChange={(e) => setAdultPrice(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Anak-anak (Rp)</label>
              <Input 
                type="number" 
                min="0"
                value={childPrice} 
                onChange={(e) => setChildPrice(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Target Harian (Rp)</label>
              <Input 
                type="number" 
                min="0"
                value={targetIncome} 
                onChange={(e) => setTargetIncome(e.target.value)} 
                required 
              />
            </div>
            
            <div className="mt-8 p-5 bg-rose-50/50 dark:bg-rose-500/10 rounded-[1.5rem] border border-rose-100 dark:border-rose-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                <p className="text-[10px] font-black text-rose-900 dark:text-rose-400 uppercase tracking-widest">Informasi Sistem</p>
              </div>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed font-medium">Harga yang ditetapkan akan digunakan sebagai acuan dasar untuk kalkulasi pendapatan pada pencatatan transaksi baru.</p>
            </div>
          </CardContent>
        </Card>

        {message && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs rounded-[1.5rem] border border-emerald-100 dark:border-emerald-500/20 text-center font-bold tracking-wide">
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black py-5 rounded-[1.5rem] tracking-widest uppercase hover:bg-slate-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
