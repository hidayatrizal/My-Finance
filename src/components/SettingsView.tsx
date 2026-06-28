import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { updatePrices } from '../lib/settings';
import { ServicePrices } from '../types';

export function Settings({ prices, onPricesChange }: { prices: ServicePrices, onPricesChange: (p: ServicePrices) => void }) {
  const [adultPrice, setAdultPrice] = useState(prices.adult.toString());
  const [childPrice, setChildPrice] = useState(prices.child.toString());
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
      };
      await updatePrices(newPrices);
      onPricesChange(newPrices);
      setMessage('Harga berhasil diperbarui.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to update prices", error);
      setMessage('Gagal memperbarui harga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan</h2>
        <p className="text-sm text-slate-500">Kelola harga layanan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-6 pt-6">Harga Layanan</h3>
          <CardContent className="space-y-5 pt-0">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Dewasa (Rp)</label>
              <Input 
                type="number" 
                min="0"
                value={adultPrice} 
                onChange={(e) => setAdultPrice(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Anak-anak (Rp)</label>
              <Input 
                type="number" 
                min="0"
                value={childPrice} 
                onChange={(e) => setChildPrice(e.target.value)} 
                required 
              />
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-800 uppercase mb-1">Tips Owner</p>
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">Harga di sini akan digunakan untuk menghitung total pendapatan pada pencatatan transaksi baru.</p>
            </div>
          </CardContent>
        </Card>

        {message && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 text-center font-bold">
            {message}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full text-xs uppercase tracking-widest" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
        </Button>
      </form>
    </div>
  );
}
