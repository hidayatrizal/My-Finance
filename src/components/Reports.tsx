import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from './Card';
import { getTransactions } from '../lib/transactions';
import { Transaction, MonthlyReport } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export function Reports({ refreshTrigger }: { refreshTrigger: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await getTransactions();
      setTransactions(data);
    };
    fetchTransactions();
  }, [refreshTrigger]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => months.add(t.date.substring(0, 7)));
    if (months.size === 0) months.add(format(new Date(), 'yyyy-MM'));
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const start = startOfMonth(parseISO(`${selectedMonth}-01`));
    const end = endOfMonth(parseISO(`${selectedMonth}-01`));

    const monthTxs = transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start, end });
    }).sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically for chart

    let totalAdults = 0;
    let totalChildren = 0;
    let totalIncome = 0;
    
    // Aggregate by date for the chart (in case multiple records per day, though typically 1)
    const chartDataMap = new Map<string, number>();

    monthTxs.forEach(t => {
      totalAdults += t.adultCount;
      totalChildren += t.childCount;
      totalIncome += t.totalIncome;
      
      const existing = chartDataMap.get(t.date) || 0;
      chartDataMap.set(t.date, existing + t.totalIncome);
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, income]) => ({
      date: format(parseISO(date), 'd MMM', { locale: id }),
      income
    }));

    return {
      report: {
        month: selectedMonth,
        totalAdults,
        totalChildren,
        totalIncome,
        totalDaysRecorded: chartDataMap.size,
      },
      chartData,
      monthTxs
    };
  }, [transactions, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const { report, chartData, monthTxs } = monthlyData;
  const avgIncome = report.totalDaysRecorded > 0 ? Math.round(report.totalIncome / report.totalDaysRecorded) : 0;

  const handleDownload = () => {
    const headers = ["Tanggal", "Dewasa", "Anak-anak", "Total Pelanggan", "Total Pendapatan"];
    const rows = monthTxs.map(t => [
      t.date,
      t.adultCount.toString(),
      t.childCount.toString(),
      (t.adultCount + t.childCount).toString(),
      t.totalIncome.toString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan-my-finance-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

      return (
        <div className="space-y-8">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Laporan</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Ringkasan bisnis Anda</p>
            </div>
            
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none shadow-sm cursor-pointer"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {format(parseISO(`${m}-01`), 'MMM yyyy', { locale: id })}
                </option>
              ))}
            </select>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="flex flex-col p-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
              <CardContent className="p-5 relative z-10">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">Tren Pendapatan</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mt-1">Statistik bulan terpilih</p>
                  </div>
                </div>
                
                <div className="h-[220px] w-full mt-4 -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: 'var(--chart-text)', fontWeight: 'bold', textTransform: 'uppercase' }} 
                        dy={10}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
                        labelStyle={{ color: 'var(--chart-tooltip-text)', fontWeight: 800, fontSize: 12, marginBottom: 4 }}
                        contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderRadius: '16px', border: '1px solid var(--chart-tooltip-border)', boxShadow: '0 8px 30px rgb(0 0 0 / 0.12)' }}
                        itemStyle={{ color: '#6366f1', fontSize: 14, fontWeight: 900 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-panel p-7 rounded-[2rem]"
          >
            <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Ringkasan Bulan Ini</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Total Pendapatan</p>
                <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(report.totalIncome)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase mb-2">Total Org</p>
                  <p className="text-xl font-black text-slate-700 dark:text-white">{report.totalAdults + report.totalChildren}</p>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase mb-2">Total Transaksi</p>
                  <p className="text-xl font-black text-slate-700 dark:text-white">{monthTxs.length}</p>
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black py-4 rounded-2xl tracking-widest uppercase hover:bg-slate-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10 mt-2"
              >
                Unduh Laporan CSV
              </motion.button>
            </div>
          </motion.div>
        </div>
      );
}
