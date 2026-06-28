import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from './Card';
import { getTransactions } from '../lib/transactions';
import { Transaction, MonthlyReport } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      chartData
    };
  }, [transactions, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const { report, chartData } = monthlyData;
  const avgIncome = report.totalDaysRecorded > 0 ? Math.round(report.totalIncome / report.totalDaysRecorded) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan</h2>
          <p className="text-sm text-slate-500">Ringkasan bisnis Anda</p>
        </div>
        
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
        >
          {availableMonths.map(m => (
            <option key={m} value={m}>
              {format(parseISO(`${m}-01`), 'MMMM yyyy', { locale: id })}
            </option>
          ))}
        </select>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm flex flex-col">
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tren Pendapatan</h3>
              <p className="text-sm text-slate-500">Statistik bulan terpilih</p>
            </div>
          </div>
          
          <div className="h-[200px] w-full mt-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }} 
                  dy={10}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
                  labelStyle={{ color: '#0f172a', fontWeight: 600, fontSize: 12, marginBottom: 4 }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}
                  itemStyle={{ color: '#4f46e5', fontSize: 14, fontWeight: 700 }}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Dewasa</p>
            <p className="text-xl font-bold text-slate-800">{report.totalAdults}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Anak-anak</p>
            <p className="text-xl font-bold text-slate-800">{report.totalChildren}</p>
        </div>
        <div className="col-span-2 bg-indigo-900 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10 w-full flex justify-between items-center">
            <div>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold tracking-tight">{formatCurrency(report.totalIncome)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Rata-rata/Hari</p>
              <p className="text-lg font-bold">{formatCurrency(avgIncome)}</p>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
