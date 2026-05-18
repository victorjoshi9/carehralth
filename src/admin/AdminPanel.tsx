import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ContentManager from './ContentManager';
import GalleryManager from './GalleryManager';
import { X, Lock, ShieldCheck, Activity } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [isLogged, setIsLogged] = useState(false);
  const [userVal, setUserVal] = useState('');
  const [pass, setPass] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authError, setAuthError] = useState(false);

  const handleLogin = () => {
    // Using simple credentials as per previous implementation but improved UI
    if (userVal === '9928448633' && pass === '511083') {
      setIsLogged(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  if (!isLogged) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900 overflow-hidden">
        {/* Animated background lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-1/4 left-0 w-full h-px bg-rose-500 animate-[move_5s_linear_infinite]" />
           <div className="absolute top-1/2 left-0 w-full h-px bg-rose-500 animate-[move_7s_linear_infinite_reverse]" />
           <div className="absolute top-3/4 left-0 w-full h-px bg-rose-500 animate-[move_6s_linear_infinite]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`w-full max-w-md glass-neu !bg-slate-800 p-10 lg:p-16 border-white/5 relative z-10 transition-all ${authError ? 'border-red-500/50 shake' : ''}`}
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 glass-neu-red mx-auto mb-8 flex items-center justify-center rounded-3xl shadow-3xl">
              <Lock size={32} />
            </div>
            <h2 className="text-4xl font-display font-medium text-white tracking-tighter uppercase mb-4 text-3d-red">Nexus Console</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">Administrative Access Node</p>
          </div>

          <div className="space-y-6">
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="ADMIN NODE ID" 
                 onChange={e => setUserVal(e.target.value)} 
                 className="w-full bg-slate-900/50 p-5 rounded-2xl border border-white/5 text-white outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:opacity-20" 
               />
            </div>
            <div className="relative">
               <input 
                 type="password" 
                 placeholder="NEXUS ACCESS KEY" 
                 onChange={e => setPass(e.target.value)} 
                 className="w-full bg-slate-900/50 p-5 rounded-2xl border border-white/5 text-white outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:opacity-20" 
               />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin} 
              className="glass-neu-red w-full !py-6 shadow-3xl flex items-center justify-center gap-4 group"
            >
              <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Authorize Entry</span>
            </motion.button>
            
            <button 
              onClick={onClose} 
              className="w-full text-center text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-[0.5em] mt-4"
            >
              Abort Link
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sections':
        return (
          <ContentManager 
            collectionName="sections" 
            title="App Architecture" 
            schema={{
              title: { type: 'text' },
              id: { type: 'text' },
              type: { type: 'text' },
              order: { type: 'number' },
              enabled: { type: 'boolean' }
            }} 
          />
        );
      case 'banners':
        return (
          <ContentManager 
            collectionName="banners" 
            title="Visual Relay" 
            schema={{
              title: { type: 'text' },
              subtitle: { type: 'text' },
              description: { type: 'textarea' },
              button1: { type: 'text' },
              button2: { type: 'text' },
              order: { type: 'number' }
            }} 
          />
        );
      case 'doctors':
        return (
          <ContentManager 
            collectionName="doctors" 
            title="Staff Node" 
            schema={{
              name: { type: 'text' },
              role: { type: 'text' },
              dept: { type: 'text' },
              order: { type: 'number' }
            }} 
          />
        );
      case 'testimonials':
        return (
          <ContentManager 
            collectionName="testimonials" 
            title="Patient Feedback" 
            schema={{
              name: { type: 'text' },
              text: { type: 'textarea' },
              isPending: { type: 'boolean' }
            }} 
          />
        );
      case 'gallery':
        return <GalleryManager />;
      case 'preview':
        return (
          <div className="h-full flex flex-col gap-8">
             <div className="flex items-center justify-between glass-neu p-6 bg-white/40">
                <div>
                   <h3 className="text-xl font-display font-medium text-slate-900 uppercase">Live Node Preview</h3>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time hub synchronization active</p>
                </div>
                <div className="flex gap-4">
                   <button 
                     onClick={() => window.open(window.location.origin, '_blank')}
                     className="glass-neu px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500"
                   >
                      Pop out
                   </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 content-center rounded-full">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-bold text-emerald-600 uppercase">Live</span>
                    </div>
                </div>
             </div>
             <div className="flex-1 glass-neu bg-white overflow-hidden rounded-[24px] border-slate-200 shadow-2xl relative min-h-[600px]">
                <iframe 
                  src={window.location.origin} 
                  className="w-full h-full border-none"
                  title="Nexus Preview"
                  referrerPolicy="no-referrer"
                />
             </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
             <Activity size={80} className="mb-8" />
             <h2 className="text-3xl font-display font-medium uppercase tracking-[0.5em]">Module Under Development</h2>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#FDFDFD] flex overflow-hidden lg:p-6">
      {/* Sidebar - Persistent on Desktop, Toggleable on Mobile */}
      <div className="hidden lg:block h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setIsLogged(false)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#FAFAFA] lg:rounded-[48px] lg:ml-6 overflow-hidden border border-slate-100 shadow-inner">
        <header className="h-20 lg:h-28 px-8 lg:px-16 border-b border-slate-100 flex items-center justify-between bg-white/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl lg:text-3xl font-display font-medium text-slate-900 tracking-tighter uppercase">{activeTab}</h1>
            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse ml-2" />
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] font-bold text-slate-900 uppercase">Victor J.</span>
                <span className="text-[8px] font-bold text-rose-500 uppercase opacity-60">Admin Node 01</span>
             </div>
             <button onClick={onClose} className="w-10 h-10 lg:w-14 lg:h-14 glass-neu flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-rose-50 hover:border-rose-100 transition-all">
                <X size={24} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-16 no-scrollbar pb-32">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Sidebar Toggle Overlay would go here if needed, but keeping it simple with buttons for now */}
    </div>
  );
};

export default AdminPanel;
