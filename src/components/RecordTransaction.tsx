import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { addTransaction } from '../lib/transactions';
import { ServicePrices } from '../types';
import { format } from 'date-fns';

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
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Catat Hari Ini</h2>
        <p className="text-sm text-slate-500">Masukkan jumlah pelanggan harian</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tanggal</label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Input Transaksi</label>
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-800">Dewasa</span>
                    <span className="text-xs font-bold text-slate-400">{formatCurrency(prices.adult)} / org</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" className="h-12 w-12 text-lg shrink-0" onClick={() => setAdultCount(Math.max(0, adultCount - 1))}>-</Button>
                    <Input 
                      type="number" 
                      min="0" 
                      value={adultCount} 
                      onChange={(e) => setAdultCount(parseInt(e.target.value) || 0)} 
                      className="text-center text-xl shadow-sm"
                    />
                    <Button type="button" variant="outline" size="sm" className="h-12 w-12 text-lg shrink-0" onClick={() => setAdultCount(adultCount + 1)}>+</Button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-800">Anak-anak</span>
                    <span className="text-xs font-bold text-slate-400">{formatCurrency(prices.child)} / org</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" className="h-12 w-12 text-lg shrink-0" onClick={() => setChildCount(Math.max(0, childCount - 1))}>-</Button>
                    <Input 
                      type="number" 
                      min="0" 
                      value={childCount} 
                      onChange={(e) => setChildCount(parseInt(e.target.value) || 0)}
                      className="text-center text-xl shadow-sm" 
                    />
                    <Button type="button" variant="outline" size="sm" className="h-12 w-12 text-lg shrink-0" onClick={() => setChildCount(childCount + 1)}>+</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">Estimasi Hari Ini</p>
            <h2 className="text-3xl font-bold">{formatCurrency(grandTotal)}</h2>
            <div className="mt-4 pt-4 border-t border-indigo-800 flex justify-between items-center">
              <span className="text-xs text-indigo-300 italic">{adultCount + childCount} Pelanggan total</span>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
        </div>

        <Button 
          type="submit" 
          className="w-full text-xs uppercase tracking-widest" 
          size="lg"
          disabled={isSubmitting || (adultCount === 0 && childCount === 0)}
        >
          {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN TRANSAKSI'}
        </Button>
      </form>
    </div>
  );
}
