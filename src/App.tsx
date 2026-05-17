import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Plus, Heart, Zap, Stethoscope, Microscope, MapPin, 
  ChevronRight, Activity, Phone, Search, Bell, User, 
  Menu, X, ShieldCheck, Clock, Smile, Baby, Camera,
  MessageSquare, HelpCircle, Star, Settings, Layout,
  Layers, Database, Play, Thermometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Spline = lazy(() => import('@splinetool/react-spline'));

// --- Types ---
interface AppSection {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  title: string;
  subtitle?: string;
  content?: string;
  items?: any[];
}

// --- Components ---

const GlobalBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FDFDFD]">
    <div className="absolute inset-0 bg-radial-[circle_at_50%_50%] from-emerald-500/5 via-transparent to-transparent opacity-40" />
    {/* Clean set of floating background elements */}
    <div className="absolute inset-0 opacity-20">
       {[Plus, Activity, Heart, ShieldCheck, Zap, Thermometer].map((icon, i) => (
         <HealthcareElement key={i} icon={icon} i={i} />
       ))}
    </div>
  </div>
);

const isWebGLAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

const SafeSpline = (props: any) => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  if (hasWebGL === false) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-500/5 to-blue-500/5 flex items-center justify-center">
        <div className="text-center p-8">
          <Activity size={40} className="text-emerald-500/20 mx-auto mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nexus Visualizer Offline</p>
        </div>
      </div>
    );
  }

  return <Spline {...props} />;
};

const HealthcareElement = ({ icon: Icon, i }: { icon: any, i: number }) => {
  const isCapsule = i % 2 === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.4, 0],
        y: [0, -120, 0],
        x: [0, i % 2 === 0 ? 40 : -40, 0],
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{ 
        duration: 15 + i * 5, 
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute pointer-events-none"
      style={{
        left: `${(i * 20) % 80 + i * 2}%`,
        top: `${(i * 15) % 70 + 20}%`,
        zIndex: 5
      }}
    >
      <div className={`
        ${isCapsule ? 'w-10 h-20 rounded-full' : 'w-16 h-8 rounded-full'} 
        border-2 border-emerald-500/20 flex items-center justify-center bg-white/20 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)]
      `}>
        <Icon size={20} className="text-emerald-500 opacity-60" />
      </div>
    </motion.div>
  );
};

const SectionWrapper = ({ children, title, subtitle, id, fullWidth, index = 0 }: { children: React.ReactNode, title: string, subtitle?: string, id: string, fullWidth?: boolean, index?: number }) => (
  <section id={id} className={`${fullWidth ? 'w-full' : 'section-width'} py-16 lg:py-24 relative overflow-hidden`}>
    <div className="relative z-10">
      <div className="mb-10 lg:mb-16 text-left lg:text-center relative z-20 px-6 lg:px-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="w-12 lg:w-20 h-1.5 bg-emerald-500 mb-6 lg:mx-auto rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-7xl font-display font-medium text-slate-900 uppercase tracking-tighter leading-none mb-4 text-3d px-1"
        >
          {title.split(' ').map((word, j) => (
             <span key={j} className={j === 1 ? 'text-rose-500 italic text-3d-red' : ''}>{word}{' '}</span>
          ))}
        </motion.h2>
        {subtitle && (
          <div className="inline-block px-6 py-2 glass-glossy rounded-full">
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[8px] lg:text-[10px]">{subtitle}</p>
          </div>
        )}
      </div>
      {children}
    </div>
  </section>
);

const GallerySection = ({ index = 0 }: { index?: number }) => (
  <SectionWrapper id="gallery" title="Facility Gallery" subtitle="Take a look inside our Bikaner unit" index={index}>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 px-4 lg:px-0">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <motion.div 
          key={i}
          whileHover={{ y: -8, scale: 1.02 }}
          className="glass-neu aspect-square flex items-center justify-center relative group cursor-pointer border-white/40 bg-white/40"
        >
          <div className="absolute inset-4 glass-glossy rounded-[32px] flex items-center justify-center bg-emerald-50/20">
            <Camera size={28} className="opacity-20 group-hover:scale-125 group-hover:opacity-100 transition-all text-emerald-600" />
          </div>
          <div className="absolute inset-x-0 bottom-8 text-center text-[8px] lg:text-[10px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-all text-emerald-600">Scan Node {i}</div>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

const TestimonialSection = ({ index = 0 }: { index?: number }) => (
  <SectionWrapper id="testimonials" title="Patient Pulse" subtitle="What the Bikaner community says" index={index}>
    <div className="flex gap-10 overflow-x-auto no-scrollbar pb-16 px-6 lg:px-0 scroll-smooth">
      {[
        { name: 'Rajesh K.', text: 'Expert treatment and high-tech facility. Gangashahar hub is a lifesaver.' },
        { name: 'Suman V.', text: 'The nexus pharmacy dispatch is incredibly fast. Best care for kids.' },
        { name: 'Amit S.', text: 'Autonomous diagnosis saved us 4 hours of travel. Truly revolutionary.' }
      ].map((t, i) => (
        <div key={i} className="min-w-[320px] lg:min-w-[400px] glass-neu p-10 lg:p-12 flex flex-col justify-between border-white/80 bg-white/60">
           <div className="flex gap-1.5 text-yellow-500 mb-8">
              {[1,2,3,4,5].map(j => <Star key={j} size={16} fill="currentColor" stroke="none" />)}
           </div>
           <p className="text-slate-600 italic font-light leading-relaxed mb-10 text-base lg:text-lg">"{t.text}"</p>
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 glass-neu !bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-emerald-500/20 !border-none">
                 {t.name[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm lg:text-base">{t.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold opacity-70">Verified Node Resident</span>
              </div>
           </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

const EmergencyControl = ({ index = 0 }: { index?: number }) => (
  <section id="emergency" className="w-full py-20 lg:py-32 px-6 lg:px-20 relative overflow-hidden">
    <div className="glass-neu !bg-red-600 p-10 lg:p-28 relative overflow-hidden shadow-3xl border-none">
       <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-red-500 to-transparent opacity-60" />
       
       <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
             <div className="w-16 h-16 glass-neu !bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-10 shadow-2xl !border-white/30">
                <Zap size={32} className="fill-white" />
             </div>
             <h2 className="text-5xl lg:text-8xl font-display font-bold text-white mb-8 leading-none tracking-tighter text-3d !shadow-red-800/50">
                EMERGENCY <br /><span className="opacity-80">DISPATCH</span>
             </h2>
             <p className="text-lg lg:text-xl text-red-50 font-light mb-12 leading-relaxed max-w-sm opacity-90">
                Instant medical relay to our Bikaner command center. Local 3D monitoring active.
             </p>
             <button className="glass-neu w-full sm:w-auto px-12 py-6 bg-white text-red-600 font-bold text-xs lg:text-sm shadow-2xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-4 !rounded-full">
                Call SOS Node <Phone size={20} />
             </button>
          </motion.div>
          <div className="hidden lg:flex items-center justify-center relative">
             <div className="absolute w-[400px] h-[400px] border-[20px] border-white/5 rounded-full animate-ping" />
             <div className="w-64 h-64 glass-neu !bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-3xl">
                <Activity size={100} className="text-white animate-pulse" />
             </div>
          </div>
       </div>
    </div>
  </section>
);

const PharmacySection = ({ items, index = 0 }: { items?: any[], index?: number }) => (
  <SectionWrapper id="pharmacy" title="Nexus Pharmacy" subtitle="24/7 Medicine Relay" index={index}>
    <div className="grid lg:grid-cols-2 gap-10 px-4 lg:px-0">
      <div className="glass-neu p-12 bg-white/60 border-rose-50/50">
        <h3 className="text-3xl font-display font-medium mb-10 text-slate-900 text-3d px-1">Inventory Status</h3>
        <div className="space-y-8">
          {[
            { l: 'Critical Meds', v: '98%', c: 'text-rose-500 text-3d-red' },
            { l: 'Relay Drones', v: 'Active', c: 'text-slate-900' },
            { l: 'Bikaner Nodes', v: '12 Hubs', c: 'text-slate-600' }
          ].map(i => (
            <div key={i.l} className="flex justify-between items-center border-b border-slate-100 pb-5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{i.l}</span>
              <span className={`text-[12px] font-bold ${i.c} uppercase`}>{i.v}</span>
            </div>
          ))}
        </div>
        <button className="glass-neu-red w-full py-6 mt-12 text-white text-[11px] font-bold uppercase tracking-widest shadow-2xl active:scale-95 transition-all !rounded-full">
          Refill Prescription
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6 lg:gap-8">
        {[
          { t: 'Rapid Dispatch', d: 'Bikaner 15min', i: Zap, c: 'text-rose-500' },
          { t: 'Direct Supply', d: 'Nexus Verified', i: ShieldCheck, c: 'text-rose-500' },
          { t: 'Cold Chain', d: 'Managed Hubs', i: Database, c: 'text-slate-900' },
          { i: MessageSquare, t: 'AI Guide', d: 'Dosage Support', c: 'text-indigo-500' }
        ].map((item, i) => (
          <div key={i} className="glass-neu p-8 bg-white/40 hover:bg-rose-50/50 transition-colors group">
            <div className="w-12 h-12 glass-neu-red rounded-2xl flex items-center justify-center mb-6 shadow-sm !rounded-xl">
               <item.i size={24} className="text-white group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-bold text-sm lg:text-base mb-2 text-slate-900 uppercase tracking-tight">{item.t}</h4>
            <p className="text-[10px] text-slate-400 leading-tight uppercase font-bold tracking-widest opacity-60">{item.d}</p>
          </div>
        ))}
      </div>
    </div>
  </SectionWrapper>
);

const LaboratorySection = ({ index = 0 }: { index?: number }) => (
  <SectionWrapper id="labs" title="Laboratory Hub" subtitle="AI Molecular Diagnosis" index={index}>
    <div className="glass-neu bg-slate-900 p-8 lg:p-24 text-white overflow-hidden border-none shadow-3xl">
      <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="w-20 h-20 glass-neu-red flex items-center justify-center text-white mb-10 shadow-2xl !border-none">
            <Microscope size={40} />
          </div>
          <h2 className="text-4xl lg:text-7xl font-display font-medium mb-8 uppercase leading-[0.85] tracking-tighter text-3d text-white">Diagnostic <br /><span className="text-rose-400 italic text-3d-red">Command</span></h2>
          <p className="text-slate-400 text-sm lg:text-base mb-12 leading-relaxed font-light max-w-sm">
            Real-time biometric analysis synced to your Nexus profile. Automated collection active.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <button className="glass-neu-red px-12 py-5 font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all !rounded-full">Book Analysis</button>
            <button className="glass-neu !bg-white/10 !text-white px-12 py-5 border border-white/20 font-bold uppercase tracking-widest text-[10px] !rounded-full">Results Hub</button>
          </div>
        </div>
        <div className="aspect-square glass-glossy rounded-[60px] flex items-center justify-center border border-white/10 relative group bg-white/5">
          <Activity size={120} className="text-rose-500/20 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute top-12 left-12 p-8 glass-neu bg-white/10 backdrop-blur-3xl border border-white/20">
             <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Live Sync</div>
             <div className="text-2xl font-display font-medium">99.8% Precision</div>
          </div>
        </div>
      </div>
    </div>
  </SectionWrapper>
);

const StaffSection = ({ items, index = 0 }: { items?: any[], index?: number }) => (
  <SectionWrapper id="staff" title="Care Staff" subtitle="The heartbeat of Nexus Bikaner" index={index}>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-10 px-6 lg:px-0">
      {(items || [
        { name: 'Vijay', role: 'Support', dept: 'Admin' },
        { name: 'Sonal', role: 'Nurse', dept: 'ICU' },
        { name: 'Karan', role: 'Relay', dept: 'Pharmacy' },
        { name: 'Asha', role: 'Counsel', dept: 'Front' },
        { name: 'Prem', role: 'Ops', dept: 'Nexus' }
      ]).map((staff, i) => (
        <motion.div 
          key={i} 
          whileHover={{ y: -10 }}
          whileTap={{ scale: 0.95 }}
          className="glass-neu p-8 lg:p-12 text-center flex flex-col items-center group cursor-pointer"
        >
          <div className="w-16 h-16 lg:w-24 lg:h-24 bg-emerald-50 rounded-full mb-6 lg:mb-8 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 glass-neu !shadow-sm">
            <User size={36} />
          </div>
          <h5 className="font-bold text-slate-800 text-sm lg:text-lg whitespace-nowrap uppercase tracking-tight">{staff.name}</h5>
          <p className="text-[8px] lg:text-[10px] font-bold text-emerald-600/60 uppercase tracking-[0.2em] mt-2">{staff.role}</p>
          <div className="mt-4 px-4 py-1.5 glass-glossy rounded-full text-[7px] lg:text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
             Node {staff.dept}
          </div>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

const CategoryScroll = () => {
  const cats = [
    { n: 'Surgery', i: Zap, c: 'text-blue-500' },
    { n: 'Pediatric', i: Baby, c: 'text-purple-500' },
    { n: 'Heart', i: Heart, c: 'text-red-500' },
    { n: 'Dental', i: ShieldCheck, c: 'text-emerald-500' },
    { n: 'Labs', i: Microscope, c: 'text-indigo-500' },
    { n: 'Vision', i: Camera, c: 'text-orange-500' }
  ];
  return (
    <div className="lg:hidden px-6 mb-6 mt-4 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
        {cats.map(c => (
          <motion.div 
            key={c.n} 
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-3 min-w-[80px]"
          >
            <div className="w-16 h-16 glass-neu flex items-center justify-center border border-white/50 shadow-lg !bg-white/40">
               <c.i size={24} className={c.c} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.n}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Hero = ({ config }: { config: AppSection }) => (
  <section id="hero" className="relative min-h-screen bg-[#FDFDFD] overflow-hidden flex flex-col lg:flex-row">
    {/* Animated Background Stroke */}
    <div className="absolute inset-x-0 top-0 h-screen pointer-events-none opacity-5">
      <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path d="M0,500 Q250,200 500,500 T1000,500" fill="none" stroke="#ef4444" strokeWidth="20" className="animated-stroke" />
      </svg>
    </div>

    {/* Left Content Side */}
    <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-20 lg:py-0 relative z-20">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 glass-neu-red flex items-center justify-center text-white shadow-2xl !rounded-2xl">
            <Plus size={32} strokeWidth={4} />
          </div>
          <div className="px-5 py-2 glass-glossy rounded-full border border-red-100/50">
             <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.4em]">Nexus Core Active</span>
          </div>
        </div>

        <div className="relative mb-8 h-[100px] lg:h-[180px] w-full">
           <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
             <defs>
               <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#ef4444" />
                 <stop offset="100%" stopColor="#e11d48" />
               </linearGradient>
             </defs>
             <text 
               x="0" 
               y="150" 
               className="font-display font-bold text-[100px] lg:text-[150px] uppercase tracking-tighter stroke-rose-500/30 fill-transparent animated-stroke"
               strokeWidth="2"
             >
               DIVYAM
             </text>
             <text 
               x="5" 
               y="150" 
               className="font-display font-bold text-[100px] lg:text-[150px] uppercase tracking-tighter fill-slate-900"
             >
               DIVYAM
             </text>
           </svg>
        </div>

        <h1 className="text-6xl lg:text-[100px] font-display font-medium leading-[0.85] text-[#1D1D1F] mb-12 tracking-tighter text-3d px-1 relative">
           <motion.span 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 0.8 }}
             className="block"
           >
             Healthcare
           </motion.span>
           <motion.span 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="text-3d-red italic"
           >
             Redefined
           </motion.span>
        </h1>

        <p className="text-xl lg:text-2xl text-slate-500 max-w-lg mb-16 font-light leading-relaxed opacity-80">
          Precision diagnostics & world-class care, integrated into Bikaner's most advanced autonomous node.
        </p>

        <div className="flex flex-wrap gap-8 mb-20 lg:mb-32">
          <button 
            onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}
            className="glass-neu-red !py-7 !px-16 !text-xs !font-bold !uppercase !tracking-widest !rounded-full shadow-[0_20px_50px_rgba(239,68,68,0.3)] hover:scale-110 active:scale-95 transition-all"
          >
            Access Care Node
          </button>
          <button 
            onClick={() => document.getElementById('emergency')?.scrollIntoView({ behavior: 'smooth' })}
            className="glass-neu !py-7 !px-16 !text-xs !font-bold !uppercase !tracking-widest !rounded-full flex items-center gap-4 text-slate-900 border border-slate-100 hover:bg-slate-50 transition-all shadow-xl"
          >
            Emergency SOS <Phone size={18} className="text-rose-500" />
          </button>
        </div>

        <div className="flex items-center justify-between lg:justify-start lg:gap-20 border-t border-slate-100 pt-12">
           <div className="glass-neu p-8 rounded-[40px] bg-white/40 group hover:bg-white transition-colors">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 opacity-60">Status: Operational</div>
              <div className="text-3xl font-display font-medium text-slate-900 tracking-tighter">12 Active Hubs</div>
           </div>
           <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-16 h-16 rounded-full glass-neu-red flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-2xl">
                 <Play size={24} fill="currentColor" />
              </div>
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em]">Watch Overview</span>
           </div>
        </div>
      </motion.div>
    </div>

    {/* Right Spline Side */}
    <div className="flex-1 relative min-h-[400px] lg:min-h-screen bg-[#F5F5F7] lg:rounded-l-[120px] overflow-hidden border-l border-white/50 shadow-inner">
       <Suspense fallback={
         <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full" />
         </div>
       }>
          <div className="w-full h-full scale-110">
             <SafeSpline 
               scene="https://prod.spline.design/WG1dWYKv2NAjdcbA/scene.splinecode" 
             />
          </div>
          
          {/* Overlay Stats Tablet */}
          <div className="absolute inset-x-10 bottom-14 lg:bottom-20 p-12 glass-neu border border-white shadow-3xl flex items-center justify-between group hover:-translate-y-4 transition-transform bg-white/60">
             <div>
                <div className="text-[11px] font-bold text-rose-500 uppercase tracking-[0.5em] mb-3">Live Bio-Feed</div>
                <div className="text-3xl lg:text-5xl font-display font-medium text-slate-900 tracking-tighter text-3d px-1">Gangashahar Node</div>
             </div>
             <div className="w-20 h-20 glass-neu-red rounded-3xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
                <Activity size={40} className="animate-pulse" />
             </div>
          </div>
       </Suspense>
    </div>
  </section>
);

const FacilitySection = ({ config, index = 0 }: { config: AppSection, index?: number }) => (
  <SectionWrapper id="facilities" title="Core Facilities" subtitle="Advanced technology at your service" index={index}>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 px-4 lg:px-0">
      {config.items?.map((item, i) => (
        <motion.div
           key={i}
           whileHover={{ y: -10 }}
           className="glass-neu p-10 group border-white/50 bg-white/40 overflow-hidden"
        >
          <div className="w-18 h-18 glass-neu-red flex items-center justify-center text-white mb-8 group-hover:rotate-12 transition-all duration-500 !shadow-lg">
            <Layers size={32} className="transition-transform" />
          </div>
          <h3 className="text-2xl font-display font-medium mb-4 text-slate-900 uppercase tracking-tight text-3d px-1">{item.title}</h3>
          <p className="text-slate-500 text-base leading-relaxed font-light opacity-80">{item.desc}</p>
          <div className="mt-10 flex items-center justify-between">
             <div className="px-4 py-1.5 glass-glossy rounded-full border border-rose-100/50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500">Active Node</span>
             </div>
             <div className="w-12 h-12 glass-neu-red rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                <ChevronRight size={20} />
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

const Navbar = () => (
  <>
    {/* Android Style Top Bar - Mobile Only */}
    <div className="android-top-bar flex lg:hidden !bg-white/40 !backdrop-blur-3xl !border-white/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 glass-neu !bg-emerald-500 rounded-xl flex items-center justify-center text-white">
          <Plus size={22} strokeWidth={4} />
        </div>
        <span className="font-display font-bold text-slate-900 tracking-tight text-lg">DIVYAM Hub</span>
      </div>
    </div>

    {/* Web Header - Desktop Only */}
    <header className="hidden lg:flex fixed top-0 inset-x-0 z-50 pointer-events-none p-10 px-24">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-5 glass-neu px-8 py-4 border-white/50 shadow-2xl bg-white/60">
          <div className="w-14 h-14 glass-neu-red flex items-center justify-center shadow-lg !border-none">
            <Plus className="text-white w-7 h-7 stroke-[4px]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-medium leading-none text-slate-900 tracking-tighter text-3d px-1">DIVYAM Hub</h1>
            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-[0.5em] mt-1.5 opacity-80">Bikaner Node v3.0</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-12 glass-neu px-16 py-5 border-white shadow-2xl bg-white/40">
          {['About', 'Facility', 'Pharmacy', 'Emergency', 'Staff'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-rose-500 transition-all hover:scale-110">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="w-14 h-14 glass-neu flex items-center justify-center text-slate-500 active:scale-95 transition-all !rounded-2xl">
            <Bell size={22} />
          </button>
          <button className="glass-neu px-10 py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:!bg-emerald-500 transition-colors !rounded-2xl shadow-3xl">
            Nexus Console
          </button>
        </div>
      </div>
    </header>
  </>
);

const MobileNav = ({ active, set }: { active: string, set: (s: string) => void }) => (
  <nav className="fixed bottom-0 inset-x-0 h-20 bg-white/95 backdrop-blur-3xl z-50 flex lg:hidden items-center justify-around px-2 border-t border-emerald-50 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] pb-safe">
     {[
       { id: 'home', icon: Home, label: 'Home' },
       { id: 'fac', icon: Layers, label: 'Labs' },
       { id: 'sos', icon: Zap, label: 'SOS' },
       { id: 'docs', icon: User, label: 'Admin' }
     ].map(item => {
       const isActive = active === item.id;
       return (
         <button 
           key={item.id} 
           onClick={() => {
             set(item.id);
             const targetId = item.id === 'home' ? 'hero' : item.id === 'fac' ? 'facilities' : item.id === 'sos' ? 'emergency' : 'doctors';
             const el = document.getElementById(targetId);
             el?.scrollIntoView({ behavior: 'smooth' });
           }}
           className="relative flex flex-col items-center justify-center w-full h-full transition-all duration-300"
         >
           <div className="relative mb-1">
             {isActive && (
               <motion.div 
                 layoutId="nav-pill" 
                 className="absolute inset-x-[-12px] inset-y-[-4px] bg-emerald-100 rounded-full -z-10" 
                 transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
               />
             )}
             <item.icon 
               size={24} 
               className={`transition-colors duration-300 ${isActive ? 'text-emerald-900 stroke-[2.5px]' : 'text-slate-500 opacity-60'}`} 
             />
           </div>
           <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-emerald-900' : 'text-slate-400'}`}>
             {item.label}
           </span>
         </button>
       );
     })}
  </nav>
);

// --- Icons used in Mobile Nav ---
const Home = ({ ...props }) => <Layout {...props} />;

// --- Main App ---

export default function App() {
  const [sections, setSections] = useState<AppSection[]>([]);
  const [mobileTab, setMobileTab] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this fetches from Firebase
    // I'll simulate a fetch but provide default data for the demo
    const defaultSections: AppSection[] = [
      { id: 'hero', type: 'hero', enabled: true, order: 0, title: 'Divyam Nexus Hub' },
      { id: 'about', type: 'about', enabled: true, order: 0.5, title: 'Bikaner Legacy' },
      { id: 'facilities', type: 'facilities', enabled: true, order: 1, title: 'Medical Services', items: [
        { title: 'Pediatrics Unit', desc: 'Expert child care node with neonatal support systems.' },
        { title: 'Gynaecology', desc: 'Comprehensive maternal care and surgical excellence.' },
        { title: 'Nexus Pharmacy', desc: '24/7 automated medicine relay with Bikaner dispatch.' },
        { title: 'Diagnostic Lab', desc: 'AI-assisted molecular diagnosis and blood analysis.' },
        { title: 'ICU / Critical Care', desc: 'High-frequency monitoring and life-support integration.' },
        { title: 'Operation Theatre', desc: 'Precision surgical environments for advanced procedures.' }
      ]},
      { id: 'pharmacy', type: 'pharmacy', enabled: true, order: 1.5, title: 'Nexus Pharmacy' },
      { id: 'labs', type: 'labs', enabled: true, order: 1.6, title: 'Laboratory Hub' },
      { id: 'doctors', type: 'doctors', enabled: true, order: 2, title: 'Expert Doctors', items: [
        { name: 'Dr. Sameer Khan', role: 'Pediatrics', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400' },
        { name: 'Dr. Anjali Verma', role: 'Gynecology', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400' },
        { name: 'Dr. Vivek Sharma', role: 'Cardiology', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' },
        { name: 'Dr. Pooja Devi', role: 'Dentistry', image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400' }
      ]},
      { id: 'staff', type: 'staff', enabled: true, order: 3, title: 'Friendly Staff' },
      { id: 'gallery', type: 'gallery', enabled: true, order: 4, title: 'Facility Gallery' },
      { id: 'testimonials', type: 'testimonials', enabled: true, order: 5, title: 'Patient Pulse' },
      { id: 'emergency', type: 'emergency', enabled: true, order: 6, title: 'SOS Dispatch' }
    ];

    const q = query(collection(db, "sections"), orderBy("order"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppSection));
        setSections(fetched);
      } else {
        setSections(defaultSections);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "sections");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
     return (
       <div className="h-screen flex flex-col items-center justify-center bg-health-bg">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center animate-bounce border border-emerald-100">
             <Plus className="text-emerald-500 w-8 h-8 stroke-[3px]" />
          </div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-600 animate-pulse">Initializing Nexus Core</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <GlobalBackground />
      <Navbar />
      
      <main className="relative z-10 no-scrollbar scroll-smooth">
        {sections.filter(s => s.enabled).map((section, i) => (
          <React.Fragment key={section.id}>
            {section.type === 'hero' && (
              <>
                <Hero config={section} />
                <CategoryScroll />
              </>
            )}
            {section.type === 'about' && (
              <SectionWrapper id="about" title="About Nexus" subtitle="The Bikaner medical legacy" index={i}>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="glass-neu p-16 rounded-[80px] aspect-square flex items-center justify-center bg-white/40">
                     <div className="w-full h-full glass-glossy rounded-[60px] flex items-center justify-center border-white/50">
                        <Smile size={120} className="text-emerald-500/40 animate-pulse" />
                     </div>
                  </div>
                   <div>
                    <h2 className="text-5xl lg:text-7xl font-display font-medium text-slate-900 mb-10 uppercase leading-[0.85] tracking-tighter text-3d">DECADES OF <br /><span className="text-rose-500 text-3d-red">HUMAN CARE</span></h2>
                    <p className="text-xl lg:text-2xl text-slate-500 font-light leading-relaxed mb-12 opacity-80">
                      Located near the Old Post Office in Gangashahar, Divyam stands as a beacon of advanced medical integration. 
                      Our multi-specialty approach combines expertise with Nexus 3D systems.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="glass-neu p-10 rounded-[48px] bg-white/60 group hover:bg-rose-50 transition-colors">
                         <div className="text-5xl font-display font-medium text-rose-500 text-3d-red">20+</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 opacity-60">Specialists</div>
                      </div>
                      <div className="glass-neu p-10 rounded-[48px] bg-white/60 group hover:bg-rose-50 transition-colors">
                         <div className="text-5xl font-display font-medium text-rose-500 text-3d-red">50k+</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 opacity-60">Active Patients</div>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            )}
            {section.type === 'pharmacy' && <PharmacySection index={i} />}
            {section.type === 'labs' && <LaboratorySection index={i} />}
            {section.type === 'facilities' && <FacilitySection config={section} index={i} />}
            {section.type === 'doctors' && (
               <SectionWrapper id="doctors" title="Expert Doctors" subtitle="Bikaner's leading medical input" index={i}>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 px-6 lg:px-0">
                    {section.items?.map((doc, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -10 }}
                        whileTap={{ scale: 0.95 }}
                        className="glass-neu p-8 lg:p-12 text-center group cursor-pointer flex flex-col items-center"
                      >
                        <div className="relative w-28 lg:w-40 h-28 lg:h-40 mb-8 lg:mb-10">
                           <div className="absolute inset-[-10px] glass-neu !rounded-full !bg-emerald-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white glass-glossy !p-1 shadow-2xl">
                              <div className="w-full h-full rounded-full overflow-hidden">
                                {doc.image ? (
                                  <img 
                                    src={doc.image} 
                                    alt={doc.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                     <User size={48} />
                                  </div>
                                )}
                              </div>
                           </div>
                           <div className="absolute bottom-2 right-2 w-10 h-10 glass-neu !bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-xl">
                              <Plus size={16} strokeWidth={4} />
                           </div>
                        </div>
                        
                        <h4 className="font-display text-lg lg:text-2xl font-bold text-slate-900 leading-tight mb-2 uppercase tracking-tighter text-3d px-1">{doc.name}</h4>
                        <p className="text-[10px] lg:text-[12px] font-bold uppercase text-emerald-600/60 tracking-widest mb-6 opacity-80">{doc.role}</p>
                        
                        <div className="w-full mt-auto">
                           <button className="glass-neu w-full py-4 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all !rounded-full">
                             Consult Node
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
               </SectionWrapper>
            )}
            {section.type === 'staff' && <StaffSection items={section.items} index={i} />}
            {section.type === 'gallery' && <GallerySection index={i} />}
            {section.type === 'testimonials' && <TestimonialSection index={i} />}
            {section.type === 'emergency' && <EmergencyControl index={i} />}
          </React.Fragment>
        ))}

        <section className="section-width py-20 lg:py-32 mb-24 lg:mb-0 relative overflow-hidden">
           <div className="grid lg:grid-cols-3 gap-10 px-4 lg:px-0">
              <div className="lg:col-span-2 glass-neu bg-emerald-50/30 min-h-[500px] relative group overflow-hidden border-none shadow-3xl">
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-200 p-10 text-center opacity-40">
                    <MapPin size={100} className="mb-8 animate-bounce" />
                    <p className="text-lg font-bold uppercase tracking-[0.4em] text-emerald-600">Bikaner Location Hub</p>
                 </div>
                 
                 <div className="absolute bottom-10 lg:bottom-12 left-10 lg:left-12 right-10 lg:right-12 flex flex-col lg:flex-row gap-10 items-center justify-between">
                    <div className="glass-neu bg-white/80 backdrop-blur-3xl px-10 py-8 border-white shadow-2xl w-full lg:w-auto">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                           <h5 className="font-bold text-slate-900 text-2xl uppercase tracking-tighter text-3d px-1">Divyam Node</h5>
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Near Old Post Office, Gangashahar, Bikaner</p>
                        <div className="flex gap-8 mt-10 pt-8 border-t border-slate-100">
                           <a href="https://www.google.com/search?q=Divyam+Hospital+Bikaner" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[10px] font-bold text-emerald-600 uppercase hover:text-emerald-700 transition-colors">
                              <Search size={18}/> Maps
                           </a>
                           <a href="https://www.justdial.com/Bikaner/Divyam-Hospital-Near-Old-Post-Office-Gangashahar/9999PX151.X151.180215161042.Z1G3" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[10px] font-bold text-blue-600 uppercase hover:text-blue-700 transition-colors">
                              <Zap size={18}/> Nexus Page
                           </a>
                        </div>
                    </div>
                 </div>
              </div>
              <div className="glass-neu p-12 flex flex-col justify-between bg-white/60 border-white shadow-3xl">
                 <div>
                    <div className="w-16 h-16 glass-neu !bg-emerald-500 rounded-[28px] flex items-center justify-center text-white mb-12 shadow-xl shadow-emerald-500/30 !border-none">
                       <Database size={32} />
                    </div>
                    <h3 className="text-5xl font-display font-bold uppercase mb-12 leading-[0.9] tracking-tighter text-slate-900 text-3d px-1">Nexus <br />Command <br /><span className="text-emerald-500 text-3d-emerald">Live</span></h3>
                    <div className="space-y-8">
                       {[
                         { l: 'Node Latency', v: '0.02ms', c: 'text-emerald-500 text-3d-emerald' },
                         { l: 'Capacity', v: '94%', c: 'text-blue-500' },
                         { l: 'Accuracy', v: '99.9%', c: 'text-emerald-500' }
                       ].map(i => (
                         <div key={i.l} className="flex justify-between items-center border-b border-slate-100 pb-5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{i.l}</span>
                            <span className={`text-[11px] font-bold uppercase ${i.c}`}>{i.v}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <button className="glass-neu w-full h-20 bg-slate-900 text-white font-bold uppercase tracking-[0.2em] rounded-full shadow-2xl hover:!bg-emerald-500 active:scale-95 transition-all text-xs mt-16 !border-none">
                    Enter Console Hub
                 </button>
              </div>
           </div>
        </section>

        {/* FAQ Section */}
        <SectionWrapper id="faq" title="Nexus Inquiries" subtitle="Got questions about our relay systems?" index={sections.length}>
           <div className="max-w-4xl mx-auto space-y-6 px-4 lg:px-0">
              {[
                { q: 'What is Divyam Nexus?', a: 'A multi-specialty clinical workflow designed to organize specialists and diagnostic streams into one autonomous hub.' },
                { q: 'Is emergency dispatch available 24/7?', a: 'Yes, our Bikaner dispatch unit is always active with an average 5-minute response time.' },
                { q: 'How can I manage my data?', a: 'Through the Nexus Console, you have full transparency over your medical records and specialist input.' }
              ].map((faq, i) => (
                <div key={i} className="glass-neu p-10 bg-white/60 border-white/40 group hover:bg-emerald-50/30 transition-colors">
                   <h5 className="font-bold text-slate-800 flex items-center gap-4 text-lg lg:text-xl uppercase tracking-tighter text-3d px-1">
                      <div className="w-10 h-10 glass-neu !bg-emerald-50 flex items-center justify-center text-emerald-500 !shadow-sm">
                         <HelpCircle size={20} />
                      </div>
                      {faq.q}
                   </h5>
                   <p className="mt-6 text-base text-slate-500 font-light leading-relaxed pl-14 opacity-80">{faq.a}</p>
                </div>
              ))}
           </div>
        </SectionWrapper>
      </main>

      {/* Footer (Hiding on Mobile as requested) */}
      <footer className="hidden lg:block bg-slate-900 pt-40 pb-24 px-6 lg:px-20 text-white rounded-t-[100px] relative z-10 shadow-[0_-30px_60px_rgba(0,0,0,0.2)]">
         <div className="section-width grid grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="col-span-2">
               <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 glass-neu-red flex items-center justify-center !border-none">
                    <Plus size={32} className="stroke-[4px]" />
                  </div>
                  <h2 className="text-5xl font-display font-medium tracking-tighter text-3d text-white !shadow-slate-800 uppercase">DIVYAM NEXUS</h2>
               </div>
               <p className="text-slate-400 text-lg max-w-sm font-light leading-relaxed mb-12 opacity-80">
                  Tomorrow's health architecture, serving Bikaner today with 3D precision and human compassion.
               </p>
            </div>
            {['Nexus Hub', 'Services', 'Protocols'].map(cat => (
               <div key={cat}>
                  <h5 className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-500 mb-10">{cat}</h5>
                  <ul className="space-y-6 text-slate-400 text-sm font-light uppercase tracking-widest opacity-60">
                     <li className="hover:text-rose-500 cursor-pointer transition-colors">Digital Console</li>
                     <li className="hover:text-rose-500 cursor-pointer transition-colors">Expert Nodes</li>
                     <li className="hover:text-rose-500 cursor-pointer transition-colors">Privacy Chain</li>
                  </ul>
               </div>
            ))}
         </div>
         <div className="section-width border-t border-white/5 mt-24 pt-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-600">© 2026 DIVYAM NEXUS HUB • BIKANER NODE 12</p>
         </div>
      </footer>

      <MobileNav active={mobileTab} set={setMobileTab} />
    </div>
  );
}
