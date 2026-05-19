import React from 'react';
import { motion } from 'motion/react';
import { Activity, Plus, Zap, ShieldCheck } from 'lucide-react';

export const Ambulance3D = () => {
  return (
    <motion.div 
      initial={{ rotateY: 20, rotateX: 10 }}
      animate={{ 
        rotateY: [20, 25, 20],
        y: [0, -5, 0]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-64 h-40 preserve-3d"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Chassis */}
      <div className="absolute inset-0 bg-white shadow-2xl rounded-xl glass-neu border-none overflow-hidden" 
           style={{ transform: 'translateZ(10px)' }}>
        <div className="absolute top-0 left-0 w-3/4 h-full bg-gradient-to-r from-red-50 to-white" />
        <div className="absolute bottom-4 left-0 w-full h-4 bg-red-600/80" />
        
        {/* Windows */}
        <div className="absolute top-4 left-4 w-20 h-16 bg-slate-900/10 rounded-lg backdrop-blur-md border border-white/50" />
        <div className="absolute top-4 left-32 w-16 h-16 bg-slate-900/5 rounded-lg" />
        
        {/* Logo */}
        <div className="absolute top-1/2 left-44 -translate-y-1/2 w-12 h-12 glass-neu-red flex items-center justify-center rounded-full !border-none">
          <Plus size={20} className="text-white" />
        </div>
      </div>
      
      {/* Cabin Roof */}
      <div className="absolute -top-4 left-2 w-32 h-4 bg-white/80 rounded-t-lg" 
           style={{ transform: 'translateZ(15px) rotateX(5deg)' }} />
           
      {/* Flashing Lights */}
      <motion.div 
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="absolute -top-6 left-8 w-6 h-3 bg-red-600 rounded-full blur-[2px] shadow-[0_0_20px_#dc2626]"
        style={{ transform: 'translateZ(20px)' }}
      />
      <motion.div 
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="absolute -top-6 left-16 w-6 h-3 bg-blue-600 rounded-full blur-[2px] shadow-[0_0_20px_#2563eb]"
        style={{ transform: 'translateZ(20px)' }}
      />
      
      {/* Wheels */}
      <div className="absolute -bottom-4 left-8 w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-700"
           style={{ transform: 'translateZ(30px)' }} />
      <div className="absolute -bottom-4 right-8 w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-700"
           style={{ transform: 'translateZ(30px)' }} />
    </motion.div>
  );
};

export const XRayMachine3D = () => {
  return (
    <motion.div 
      initial={{ rotateY: -30, rotateX: 15 }}
      animate={{ 
        rotateY: [-30, -20, -30],
        rotateX: [15, 20, 15]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-64 h-64 preserve-3d"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Main Ring / Scanner */}
      <div className="absolute inset-0 rounded-full border-[20px] border-slate-100 glass-neu !bg-white/10 shadow-2xl"
           style={{ transform: 'rotateY(10deg)' }}>
        <motion.div 
          animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-4 rounded-full border-4 border-rose-500/30 blur-sm" 
        />
        
        {/* Rotating Hub */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 rounded-full border border-slate-200"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_15px_#f43f5e]" />
        </motion.div>
      </div>
      
      {/* Scanning Laser */}
      <motion.div 
        animate={{ 
          top: ['20%', '80%', '20%'],
          opacity: [0, 1, 1, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 right-0 h-[2px] bg-rose-500 shadow-[0_0_15px_#f43f5e] z-10"
        style={{ transform: 'translateZ(40px)' }}
      />
      
      {/* Holographic Panel */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -right-12 top-4 w-32 h-40 glass-neu !bg-rose-500/5 backdrop-blur-xl border-white/40 p-4 flex flex-col gap-2 overflow-hidden"
        style={{ transform: 'translateZ(60px) rotateY(-20deg)' }}
      >
        <div className="w-full h-1 bg-rose-500/20 rounded-full" />
        <div className="w-2/3 h-1 bg-rose-500/20 rounded-full" />
        <div className="w-full h-1 bg-rose-500/20 rounded-full" />
        <div className="mt-4 flex items-center justify-center">
            <Activity className="text-rose-500 animate-pulse" size={40} />
        </div>
        <div className="mt-auto text-[8px] font-bold text-rose-500 uppercase tracking-widest text-center">Analyzing Data...</div>
      </motion.div>
      
      {/* Base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-10 bg-slate-100 glass-neu rounded-t-3xl"
           style={{ transform: 'translateZ(-20px)' }} />
    </motion.div>
  );
};

export const Lift3D = () => {
  return (
    <motion.div 
      initial={{ rotateY: 10 }}
      animate={{ rotateY: [10, 15, 10] }}
      transition={{ duration: 8, repeat: Infinity }}
      className="relative w-48 h-80 preserve-3d"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Elevator Shaft (Glass) */}
      <div className="absolute inset-0 glass-neu !bg-white/5 border-white/20 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-transparent to-slate-900/10" />
        
        {/* Moving Cabin */}
        <motion.div 
          animate={{ y: ['80%', '0%', '80%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-4 right-4 h-24 glass-neu !bg-white border-rose-100 flex flex-col items-center justify-center shadow-xl"
        >
          {/* Cabin Doors */}
          <div className="w-full h-full relative flex gap-1 p-2">
             <motion.div 
               animate={{ x: [0, -15, 0] }}
               transition={{ duration: 10, times: [0.4, 0.5, 0.6], repeat: Infinity }}
               className="flex-1 bg-rose-50/50 rounded-lg border border-rose-100" 
             />
             <motion.div 
               animate={{ x: [0, 15, 0] }}
               transition={{ duration: 10, times: [0.4, 0.5, 0.6], repeat: Infinity }}
               className="flex-1 bg-rose-50/50 rounded-lg border border-rose-100" 
             />
          </div>
          
          {/* Floor Indicator */}
          <div className="absolute -top-6 bg-slate-900 text-rose-500 px-3 py-1 rounded-full text-[10px] font-mono border border-slate-800 shadow-lg">
             <motion.span
               animate={{ opacity: [1, 0, 1] }}
               transition={{ duration: 1 }}
             >
                FL 12
             </motion.span>
          </div>
        </motion.div>
      </div>
      
      {/* Frame Decorations */}
      <div className="absolute -left-4 inset-y-0 w-2 bg-slate-100 rounded-full opacity-20" />
      <div className="absolute -right-4 inset-y-0 w-2 bg-slate-100 rounded-full opacity-20" />
      
      {/* Indicator Icons */}
      <div className="absolute -left-12 top-1/4 space-y-4">
        {[1, 2, 3].map(i => (
          <motion.div 
             key={i}
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
             transition={{ delay: i * 0.5, duration: 2, repeat: Infinity }}
             className="w-4 h-4 bg-rose-500 rounded-full blur-[1px]" 
          />
        ))}
      </div>
    </motion.div>
  );
};
