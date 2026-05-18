import React from 'react';
import { motion } from 'motion/react';
import { Activity, Users, Layers, MessageSquare, ArrowUpRight, Zap } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, trend }: { label: string, value: string | number, icon: any, color: string, trend?: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-neu p-8 lg:p-10 bg-white/40 border-white/60 relative overflow-hidden group"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <div className="relative z-10">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 opacity-60">{label}</div>
      <div className="text-4xl lg:text-5xl font-display font-medium text-slate-900 tracking-tighter mb-4">{value}</div>
      {trend && (
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
          <ArrowUpRight size={14} />
          <span>{trend} Growth</span>
        </div>
      )}
    </div>
    {/* Global Background Reflection */}
    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-slate-900/5 rounded-full blur-3xl pointer-events-none" />
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl lg:text-6xl font-display font-medium text-slate-900 tracking-tighter uppercase mb-4">Command Center</h2>
          <p className="text-slate-500 font-light text-lg">System health and biometric relay monitoring active.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-neu px-8 py-4 bg-white/60 border-white/50 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Server</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Nodes" value="12" icon={Layers} color="bg-rose-500" trend="12%" />
        <StatCard label="Active Staff" value="48" icon={Users} color="bg-indigo-500" trend="5%" />
        <StatCard label="System Uptime" value="99.9%" icon={Activity} color="bg-slate-900" />
        <StatCard label="SOS Alerts" value="0" icon={Zap} color="bg-red-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-neu p-10 bg-white/40 border-white/80 min-h-[400px] flex flex-col justify-between">
           <div>
              <h3 className="text-2xl font-display font-medium text-slate-900 uppercase tracking-tighter mb-8">Node Performance</h3>
              <div className="space-y-6">
                {[
                  { name: 'Gangashahar Main Hub', status: 'Optimal', load: '42%' },
                  { name: 'Bikaner Central Node', status: 'High Load', load: '88%' },
                  { name: 'JNV Colony Outreach', status: 'Operational', load: '12%' },
                ].map((node, i) => (
                  <div key={i} className="flex items-center justify-between p-6 glass-neu bg-white/60 border-white/40">
                     <div className="flex items-center gap-6">
                        <div className="w-10 h-10 glass-neu-red flex items-center justify-center text-white scale-75">
                           <Layers size={20} />
                        </div>
                        <div>
                           <div className="font-bold text-slate-900 uppercase tracking-tighter">{node.name}</div>
                           <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {node.status}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-xl font-display font-medium text-slate-900">{node.load}</div>
                        <div className="w-20 lg:w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: node.load }}
                             transition={{ duration: 1, delay: 0.5 }}
                             className={`h-full ${parseInt(node.load) > 80 ? 'bg-red-500' : 'bg-rose-500'}`} 
                           />
                        </div>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="glass-neu p-10 bg-slate-900 text-white border-none shadow-3xl flex flex-col justify-between overflow-hidden relative">
           <div className="relative z-10">
              <MessageSquare size={40} className="text-rose-500 mb-8" />
              <h3 className="text-3xl font-display font-bold uppercase tracking-tighter mb-4 text-3d text-white">System <br />Log</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed mb-8">All diagnostic relays are currently synchronized with the cloud backend.</p>
           </div>
           <div className="relative z-10 space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-[10px] font-mono text-emerald-400">
                 [20:10:42] SYSTEM_AUTH_SUCCESS: victorjoshi9@gmail.com
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-[10px] font-mono text-rose-400">
                 [20:10:45] NODE_SYNC_COMPLETED: 12 Nodes Active
              </div>
           </div>
           {/* Glow Effect */}
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
