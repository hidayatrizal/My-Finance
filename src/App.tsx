import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  History, 
  Settings, 
  PlusCircle, 
  Scissors
} from 'lucide-react';
import { cn } from './lib/utils';
import { RecordTransaction } from './components/RecordTransaction';
import { TransactionHistory } from './components/TransactionHistory';
import { Reports } from './components/Reports';
import { Settings as SettingsView } from './components/SettingsView';
import { getPrices } from './lib/settings';
import { ServicePrices } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'record' | 'history' | 'reports' | 'settings'>('record');
  const [prices, setPrices] = useState<ServicePrices>({ adult: 35000, child: 25000 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const fetchedPrices = await getPrices();
        setPrices(fetchedPrices);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    };
    fetchPrices();
  }, []);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const tabs = [
    { id: 'record', label: 'Catat', icon: PlusCircle },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <header className="bg-white px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl italic shadow-sm">
            K
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none tracking-tight">My Finance</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Kembarber Heir Studio</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-6">
        {activeTab === 'record' && (
          <RecordTransaction 
            prices={prices} 
            onSuccess={() => {
              triggerRefresh();
              setActiveTab('history');
            }} 
          />
        )}
        {activeTab === 'history' && <TransactionHistory refreshTrigger={refreshTrigger} />}
        {activeTab === 'reports' && <Reports refreshTrigger={refreshTrigger} />}
        {activeTab === 'settings' && (
          <SettingsView 
            prices={prices} 
            onPricesChange={(newPrices) => {
              setPrices(newPrices);
              triggerRefresh();
            }} 
          />
        )}
      </main>

      <nav className="bg-white border-t border-slate-200 absolute bottom-0 w-full px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] flex justify-between items-center z-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-colors",
                isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isActive ? "bg-indigo-50" : "bg-transparent"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
