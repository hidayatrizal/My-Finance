import React, { useEffect, useState } from 'react';
import { getTransactions } from '../lib/transactions';
import { format, isToday, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { TrendingUp, Users, Activity, BarChart2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Home({ refreshTrigger, onNavigate, targetIncome = 500000 }: { refreshTrigger: number, onNavigate: (tab: any) => void, targetIncome?: number }) {
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayCustomers, setTodayCustomers] = useState(0);
  const [weeklyIncome, setWeeklyIncome] = useState(0);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    const fetchData = async () => {
      const data = await getTransactions();
      let totalIncome = 0;
      let totalCustomers = 0;
      let wIncome = 0;
      
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      
      data.forEach(t => {
        totalIncome += t.totalIncome;
        totalCustomers += (t.adultCount + t.childCount);
        
        const [year, month, day] = t.date.split('-').map(Number);
        const tDate = new Date(year, month - 1, day);
        if (isWithinInterval(tDate, { start: weekStart, end: weekEnd })) {
          wIncome += t.totalIncome;
        }
      });
      
      setTodayIncome(totalIncome);
      setTodayCustomers(totalCustomers);
      setWeeklyIncome(wIncome);
    };
    fetchData();
  }, [refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const currentDate = format(new Date(), 'EEEE, d MMMM', { locale: id });

  return (
    <div className="space-y-8">
      <div className="pt-2">
        <p className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          {currentDate}
        </p>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {greeting}.
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 font-medium mt-2 text-sm">
          Ringkasan seluruh aktivitas
        </p>
      </div>

      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate('history')}
        className="bg-slate-900 dark:bg-black p-8 rounded-[2rem] text-white shadow-xl shadow-slate-900/20 dark:shadow-black/50 relative overflow-hidden border border-slate-800 dark:border-white/10 group cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/50 dark:bg-zinc-800/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-slate-700/50 transition-colors duration-700"></div>
        <div className="absolute top-6 right-6 opacity-30 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-400" />
            <p className="text-slate-400 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">Total Pendapatan</p>
          </div>
          <h3 className="text-4xl font-black tracking-tighter mb-1">{formatCurrency(todayIncome)}</h3>
          
          <div className="mt-8 pt-6 border-t border-slate-800 dark:border-white/10 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-1.5">Pelanggan</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-300 dark:text-zinc-300" />
                <span className="text-base font-bold text-slate-200 dark:text-zinc-200">{todayCustomers} Org</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-1.5">Minggu Ini</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-300 dark:text-zinc-300" />
                <span className="text-base font-bold text-slate-200 dark:text-zinc-200">{formatCurrency(weeklyIncome)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
        className="bg-[#0f0f0f] dark:bg-[#0a0a0a] border border-slate-800 dark:border-white/5 rounded-[2rem] p-7 shadow-xl shadow-slate-900/20 font-mono text-slate-300"
      >
        <p className="text-sm mb-4 text-slate-400">Target</p>
        <p className="text-xl text-white mb-6 tracking-tight">{formatCurrency(targetIncome)}</p>
        
        <div className="flex items-center gap-[1px] mb-6 w-3/4">
          {Array.from({ length: 10 }).map((_, i) => {
            const progress = Math.min(100, Math.round((todayIncome / Math.max(targetIncome, 1)) * 100));
            const filledBlocks = progress > 0 ? Math.max(1, Math.round(progress / 10)) : 0;
            const isFilled = i < filledBlocks;
            return (
              <div 
                key={i} 
                className={`h-5 flex-1 border ${
                  isFilled 
                    ? 'bg-white border-white' 
                    : 'bg-transparent border-slate-600/60 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[length:3px_3px]'
                }`}
              />
            );
          })}
        </div>
        
        <p className="text-sm text-slate-200">{Math.min(100, Math.round((todayIncome / Math.max(targetIncome, 1)) * 100))}%</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('reports')}
          className="glass-panel p-6 rounded-[2rem] flex flex-col justify-center items-start group relative overflow-hidden cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-colors"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 group-hover:opacity-20 transition-opacity">
            <BarChart2 className="w-16 h-16" />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/5">
            <TrendingUp className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
          </div>
          <p className="text-sm font-black text-slate-800 dark:text-white">Analisis</p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">Performa Bisnis</p>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('record')}
          className="glass-panel p-6 rounded-[2rem] flex flex-col justify-center items-start group relative overflow-hidden cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-colors"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16" />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/5">
            <Users className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
          </div>
          <p className="text-sm font-black text-slate-800 dark:text-white">Catat Baru</p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">Transaksi Aktif</p>
        </motion.div>
      </div>
    </div>
  );
}
