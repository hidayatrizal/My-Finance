import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  History, 
  Settings, 
  PlusCircle, 
  Scissors,
  Moon,
  Sun,
  Home as HomeIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { Home } from './components/Home';
import { RecordTransaction } from './components/RecordTransaction';
import { TransactionHistory } from './components/TransactionHistory';
import { Reports } from './components/Reports';
import { Settings as SettingsView } from './components/SettingsView';
import { getPrices } from './lib/settings';
import { ServicePrices } from './types';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'record' | 'history' | 'reports' | 'settings'>('home');
  const [prices, setPrices] = useState<ServicePrices>({ adult: 35000, child: 25000 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
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

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const tabs = [
    { id: 'home', icon: HomeIcon },
    { id: 'record', icon: PlusCircle },
    { id: 'history', icon: History },
    { id: 'reports', icon: BarChart3 },
    { id: 'settings', icon: Settings },
  ] as const;

  const pageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen w-full md:max-w-md mx-auto bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 flex flex-col md:shadow-2xl relative overflow-hidden transition-colors duration-300">
      <header className="px-5 pb-4 flex items-center justify-between sticky top-0 z-20 bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 dark:to-transparent pt-[calc(env(safe-area-inset-top,0px)+2.5rem)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-[1rem] flex items-center justify-center text-white dark:text-slate-900 font-black text-lg tracking-tighter shadow-lg shadow-slate-900/20 dark:shadow-white/10">
            K<span className="text-slate-400 dark:text-zinc-400">F</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none flex items-baseline gap-1.5">
              Kembarber
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Finance</span>
            </h1>
          </div>
        </div>
        <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm border border-slate-200/50 dark:border-white/5">
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 pt-2 px-5 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full"
          >
            {activeTab === 'home' && <Home refreshTrigger={refreshTrigger} onNavigate={setActiveTab} targetIncome={prices.targetIncome || 500000} />}
            {activeTab === 'record' && (
              <RecordTransaction 
                prices={prices} 
                onSuccess={() => {
                  triggerRefresh();
                  setActiveTab('history');
                }} 
              />
            )}
            {activeTab === 'history' && <TransactionHistory refreshTrigger={refreshTrigger} onDelete={triggerRefresh} />}
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
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <nav className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-full px-2 py-2 flex justify-between items-center shadow-2xl shadow-slate-200/50 dark:shadow-black/50 ring-1 ring-slate-900/5 dark:ring-white/5 pointer-events-auto w-[calc(100%-2.5rem)] md:max-w-[calc(28rem-2.5rem)] mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center justify-center transition-all flex-1 h-12 relative",
                isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-slate-100 dark:bg-zinc-800 rounded-full shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className={cn(
                "p-3 rounded-full transition-all duration-300 flex items-center justify-center relative z-10",
                isActive ? "scale-110" : ""
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
            </button>
          );
        })}
        </nav>
      </div>
    </div>
  );
}
