import React from 'react';
import { motion } from 'motion/react';
import { Plus, Activity } from 'lucide-react';

const NexusSpinner = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDFDFD]">
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-t-2 border-r-2 border-rose-500/30"
        />
        
        {/* Inner pulsing glow */}
        <motion.div
           animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-0 m-auto w-24 h-24 bg-rose-500/10 rounded-full blur-xl"
        />

        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 glass-neu-red flex items-center justify-center rounded-2xl shadow-xl"
          >
            <Plus className="text-white w-8 h-8" strokeWidth={4} />
          </motion.div>
        </div>

        {/* Orbiting particles */}
        {[0, 120, 240].map((angle, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-400 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]"
              style={{ transform: `translateY(-10px)` }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <h2 className="text-xl font-display font-medium text-slate-900 uppercase tracking-[0.3em] mb-2">Nexus Node</h2>
        <div className="flex items-center gap-2 justify-center text-rose-500/60 font-bold text-[10px] uppercase tracking-widest">
          <Activity size={14} className="animate-pulse" />
          <span>Syncing Global Parameters</span>
        </div>
      </motion.div>
    </div>
  );
};

export default NexusSpinner;
