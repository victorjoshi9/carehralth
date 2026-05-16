import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Plus, Heart, Zap, Stethoscope, Microscope, MapPin, 
  ChevronRight, Activity, Phone, Search, Bell, User, 
  Menu, X, ShieldCheck, Clock, Smile, Baby, Camera,
  MessageSquare, HelpCircle, Star, Settings, Layout,
  Layers, Database
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
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 bg-[#f8fafc]" />
    {/* Permanent Floating Elements that drift across the entire app background */}
    <div className="absolute inset-0 opacity-40">
       {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
         <Floating3DElement key={i} i={i} />
       ))}
    </div>
    {/* Large drifting gradient orbs */}
    <motion.div 
      animate={{ 
        x: [0, 100, 0], 
        y: [0, 50, 0],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" 
    />
    <motion.div 
      animate={{ 
        x: [0, -80, 0], 
        y: [0, 120, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" 
    />
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

const Floating3DElement = ({ i }: { i: number }) => {
  const icons = [Plus, Activity, Heart, Zap, Smile, Baby];
  const colors = [
    'text-emerald-500 bg-emerald-500/20', 
    'text-blue-500 bg-blue-500/20', 
    'text-red-500 bg-red-500/20', 
    'text-purple-500 bg-purple-500/20', 
    'text-yellow-500 bg-yellow-500/20'
  ];
  const Icon = icons[i % icons.length];
  const colorClass = colors[i % colors.length];
  const isBalloon = i % 2 === 0;

  return (
    <motion.div
      initial={{ y: 0, x: 0, rotate: 0 }}
      animate={{ 
        y: [0, -150, 0],
        x: [0, i % 2 === 0 ? 60 : -60, 0],
        rotate: isBalloon ? [0, 20, -20, 0] : [0, 720],
        scale: [1, 1.25, 1],
        filter: ['blur(0px)', 'blur(1px)', 'blur(0px)']
      }}
      transition={{ 
        duration: 20 + i * 4, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute pointer-events-none perspective-1000"
      style={{
        left: `${(i * 15) % 90 + 5}%`,
        top: `${(i * 20) % 70 + 10}%`,
        opacity: i % 2 === 0 ? 0.35 : 0.2,
        zIndex: i % 3 === 0 ? 10 : 0
      }}
    >
      <div className={`
        ${isBalloon ? 'rounded-t-full rounded-b-[45%] w-20 h-24' : 'w-24 h-24 rounded-3xl animate-3d-coin'} 
        border-[6px] border-white/60 flex items-center justify-center glass ${colorClass} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-3xl
        transform-gpu rotate-x-12 rotate-y-12
      `}>
        <Icon size={36} strokeWidth={2.5} className="drop-shadow-lg" />
      </div>
      {isBalloon && (
        <div className="w-[2px] h-32 bg-gradient-to-t from-transparent via-slate-300 to-slate-300 mx-auto opacity-30 mt-[-4px]" />
      )}
    </motion.div>
  );
};

const SectionWrapper = ({ children, title, subtitle, id, fullWidth, index = 0 }: { children: React.ReactNode, title: string, subtitle?: string, id: string, fullWidth?: boolean, index?: number }) => (
  <section id={id} className={`${fullWidth ? 'w-full' : 'section-width'} py-16 lg:py-24 relative overflow-hidden`}>
    <div className="relative z-10">
      <div className="mb-10 lg:mb-16 text-left lg:text-center relative z-20 px-4 lg:px-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="w-12 lg:w-20 h-1.5 bg-emerald-500 mb-6 lg:mx-auto rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-7xl font-display font-bold text-slate-900 uppercase tracking-tighter leading-[0.8] mb-4"
        >
          {title.split(' ').map((word, i) => (
             <span key={i} className={i === 1 ? 'text-emerald-500 italic' : ''}>{word}{' '}</span>
          ))}
        </motion.h2>
        {subtitle && (
          <div className="inline-block px-4 py-1.5 glass rounded-full border-emerald-50">
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[8px] lg:text-[9px]">{subtitle}</p>
          </div>
        )}
      </div>
      {children}
    </div>
  </section>
);

const GallerySection = ({ index = 0 }: { index?: number }) => (
  <SectionWrapper id="gallery" title="Facility Gallery" subtitle="Take a look inside our Bikaner unit" index={index}>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 px-4 lg:px-0">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <motion.div 
          key={i}
          whileHover={{ y: -5 }}
          className="aspect-square android-card flex items-center justify-center relative group cursor-pointer border-emerald-50/30"
        >
          <div className="absolute inset-0 bg-emerald-50/10 flex items-center justify-center">
            <Camera size={24} className="opacity-20 group-hover:scale-125 group-hover:opacity-100 transition-all text-emerald-600" />
          </div>
          <div className="absolute inset-x-0 bottom-4 text-center text-[7px] lg:text-[8px] uppercase tracking-[0.2em] font-bold opacity-0 group-hover:opacity-100 transition-all text-emerald-600">Scan Point {i}</div>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

const TestimonialSection = ({ index = 0 }: { index?: number }) => (
  <SectionWrapper id="testimonials" title="Patient Pulse" subtitle="What the Bikaner community says" index={index}>
    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-10 px-4 lg:px-0 scroll-smooth">
      {[
        { name: 'Rajesh K.', text: 'Expert treatment and high-tech facility. Gangashahar hub is a lifesaver.' },
        { name: 'Suman V.', text: 'The nexus pharmacy dispatch is incredibly fast. Best care for kids.' },
        { name: 'Amit S.', text: 'Autonomous diagnosis saved us 4 hours of travel. Truly revolutionary.' }
      ].map((t, i) => (
        <div key={i} className="min-w-[280px] lg:min-w-[320px] android-card p-8 flex flex-col justify-between border-white/80 bg-white/60 backdrop-blur-md">
           <div className="flex gap-1 text-yellow-500 mb-6">
              {[1,2,3,4,5].map(j => <Star key={j} size={12} fill="currentColor" />)}
           </div>
           <p className="text-slate-600 italic font-light leading-relaxed mb-8 text-sm lg:text-base">"{t.text}"</p>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                 {t.name[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-xs">{t.name}</span>
                <span className="text-[8px] uppercase tracking-widest text-emerald-600 font-bold">Verified Patient</span>
              </div>
           </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

const EmergencyControl = ({ index = 0 }: { index?: number }) => (
  <section id="emergency" className="section-width py-12 lg:py-24 relative overflow-hidden">
    <div className="android-card bg-white p-8 lg:p-24 relative overflow-hidden shadow-2xl shadow-red-500/10 border-red-50/50">
       <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
             <div className="w-16 h-16 bg-red-500 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-red-500/30 mb-8 animate-pulse">
                <Zap size={32} className="stroke-[3px]" />
             </div>
             <h2 className="text-4xl lg:text-7xl font-display font-bold text-slate-900 mb-6 leading-[0.9] tracking-tighter">
                SOS <br /><span className="text-red-500 italic">Dispatch</span>
             </h2>
             <p className="text-sm lg:text-base text-slate-500 font-light mb-10 leading-relaxed max-w-sm">
                Instant medical relay to our command center. Local Bikaner monitoring active.
             </p>
             <button className="w-full sm:w-auto px-12 py-6 bg-red-500 text-white font-bold text-base rounded-[24px] shadow-2xl shadow-red-500/40 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-4">
                Call SOS Now <Phone size={20} />
             </button>
          </motion.div>
          <div className="hidden lg:flex items-center justify-center relative scale-125">
             <div className="absolute w-64 h-64 border-8 border-red-500/5 rounded-full animate-ping" />
             <div className="w-40 h-40 bg-red-50 rounded-full flex items-center justify-center shadow-inner">
                <Activity size={60} className="text-red-500 animate-pulse" />
             </div>
          </div>
       </div>
    </div>
  </section>
);

const PharmacySection = ({ items, index = 0 }: { items?: any[], index?: number }) => (
  <SectionWrapper id="pharmacy" title="Nexus Pharmacy" subtitle="24/7 Medicine Relay" index={index}>
    <div className="grid lg:grid-cols-2 gap-8 px-4 lg:px-0">
      <div className="android-card p-10 bg-white/60 backdrop-blur-md border-emerald-50/50">
        <h3 className="text-2xl font-display font-bold mb-8 text-slate-900">Inventory Status</h3>
        <div className="space-y-6">
          {[
            { l: 'Critical Meds', v: '98%', c: 'text-emerald-500' },
            { l: 'Relay Drones', v: 'Active', c: 'text-blue-500' },
            { l: 'Bikaner Nodes', v: '12 Active', c: 'text-slate-600' }
          ].map(i => (
            <div key={i.l} className="flex justify-between items-center border-b border-slate-50 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{i.l}</span>
              <span className={`text-[11px] font-bold ${i.c} uppercase`}>{i.v}</span>
            </div>
          ))}
        </div>
        <button className="w-full py-5 mt-10 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          Refill Prescription
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:gap-6">
        {[
          { t: 'Rapid Dispatch', d: 'Bikaner within 15min', i: Zap, c: 'text-yellow-500' },
          { t: 'Direct Supply', d: 'Nexus Verified', i: ShieldCheck, c: 'text-emerald-500' },
          { t: 'Cold Chain', d: 'Managed Hubs', i: Database, c: 'text-blue-500' },
          { i: MessageSquare, t: 'AI Guide', d: 'Dosage Support', c: 'text-purple-500' }
        ].map((item, i) => (
          <div key={i} className="android-card p-6 bg-white/40 backdrop-blur-md hover:bg-emerald-50 transition-colors group">
            <item.i size={20} className={`${item.c} mb-3 group-hover:scale-110 transition-transform`} />
            <h4 className="font-bold text-xs mb-1 text-slate-900">{item.t}</h4>
            <p className="text-[9px] text-slate-400 leading-tight uppercase font-medium">{item.d}</p>
          </div>
        ))}
      </div>
    </div>
  </SectionWrapper>
);

const LaboratorySection = ({ index = 0 }: { index?: number }) => (
  <SectionWrapper id="labs" title="Laboratory Hub" subtitle="AI Molecular Diagnosis" index={index}>
    <div className="android-card bg-slate-900 p-8 lg:p-24 text-white overflow-hidden">
      <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="w-16 h-16 bg-emerald-500 rounded-[24px] flex items-center justify-center text-white mb-10 shadow-2xl shadow-emerald-500/20">
            <Microscope size={32} />
          </div>
          <h2 className="text-4xl lg:text-7xl font-display font-bold mb-8 uppercase leading-[0.9] tracking-tighter">Diagnostic <br /><span className="text-emerald-400 italic">Command</span></h2>
          <p className="text-slate-400 text-sm lg:text-base mb-12 leading-relaxed font-light max-w-sm">
            Real-time biometric analysis synced to your Nexus profile. Automated collection active.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all">Book Analysis</button>
            <button className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Results Hub</button>
          </div>
        </div>
        <div className="aspect-square bg-white/5 backdrop-blur-2xl rounded-[40px] flex items-center justify-center border border-white/10 relative group">
          <Activity size={100} className="text-emerald-500/20 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute top-8 left-8 p-6 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/10">
             <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Live Sync</div>
             <div className="text-xl font-display font-bold">99.8% Precision</div>
          </div>
        </div>
      </div>
    </div>
  </SectionWrapper>
);

const StaffSection = ({ items, index = 0 }: { items?: any[], index?: number }) => (
  <SectionWrapper id="staff" title="Care Staff" subtitle="The heartbeat of Nexus Bikaner" index={index}>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8 px-4 lg:px-0">
      {(items || [
        { name: 'Vijay', role: 'Support', dept: 'Admin' },
        { name: 'Sonal', role: 'Nurse', dept: 'ICU' },
        { name: 'Karan', role: 'Relay', dept: 'Pharmacy' },
        { name: 'Asha', role: 'Counsel', dept: 'Front' },
        { name: 'Prem', role: 'Ops', dept: 'Nexus' }
      ]).map((staff, i) => (
        <motion.div 
          key={i} 
          whileHover={{ y: -5 }}
          className="glass-glossy p-6 lg:p-10 text-center flex flex-col items-center group cursor-pointer rounded-[32px]"
        >
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-emerald-500/5 rounded-full mb-6 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <User size={32} />
          </div>
          <h5 className="font-bold text-slate-800 text-xs lg:text-sm whitespace-nowrap uppercase tracking-tight">{staff.name}</h5>
          <p className="text-[7px] lg:text-[8px] font-bold text-emerald-600/40 uppercase tracking-[0.2em] mt-2">{staff.role}</p>
          <div className="mt-4 px-3 py-1 bg-white/40 rounded-full text-[6px] lg:text-[7px] font-bold text-emerald-600 uppercase tracking-widest border border-white/50">
             {staff.dept} Hub
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
    <div className="lg:hidden px-4 mb-4 mt-2 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 scroll-smooth">
        {cats.map(c => (
          <motion.div 
            key={c.n} 
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-3 min-w-[70px]"
          >
            <div className="w-16 h-16 bg-white/60 backdrop-blur-xl rounded-[24px] flex items-center justify-center shadow-lg shadow-slate-200/50 border border-white/80">
               <c.i size={24} className={c.c} />
            </div>
            <span className="text-[8px] font-bold uppercase text-slate-800 tracking-[0.1em]">{c.n}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Hero = ({ config }: { config: AppSection }) => (
  <section id="hero" className="relative min-h-[85vh] lg:min-h-screen flex items-center overflow-hidden pt-24 lg:pt-20">
    <div className="section-width grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-left px-4 lg:px-0 mt-8 lg:mt-0"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-md rounded-full mb-6 border-white/80 shadow-sm">
          <Activity size={12} className="text-emerald-500 animate-pulse" />
          <span className="text-[8px] lg:text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em]">System Online</span>
        </div>
        <h1 className="text-5xl lg:text-8xl font-display font-bold leading-[0.82] text-slate-900 mb-8 uppercase tracking-tighter">
          Divyam <br />
          <span className="text-emerald-500 italic">Nexus Hub</span>
        </h1>
        <p className="text-sm lg:text-lg text-slate-500 max-w-lg mb-10 leading-relaxed font-light">
          Old Post Office, Gangashahar. Bikaner's most advanced clinical autonomous node.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-4 lg:mb-0">
          <button 
            onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-white font-bold rounded-3xl shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px]"
          >
            Get Expert Care
          </button>
          <button 
            onClick={() => document.getElementById('emergency')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-10 py-5 bg-white/40 backdrop-blur-xl text-slate-800 font-bold rounded-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[10px] border border-white"
          >
            SOS <Phone size={14} className="text-red-500" />
          </button>
        </div>
      </motion.div>

      <div className="relative aspect-[4/3] lg:aspect-auto h-[300px] lg:h-[650px] flex items-center justify-center lg:mt-0 px-4 mb-8 lg:mb-0">
        <Suspense fallback={<div className="animate-pulse w-full h-full bg-slate-100 rounded-[40px]" />}>
           <div className="w-full h-full glass rounded-[40px] lg:rounded-[60px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.08)] relative group border-white/50">
              <SafeSpline 
                scene="https://prod.spline.design/WG1dWYKv2NAjdcbA/scene.splinecode" 
                onError={(e) => console.error("Spline Load Failed", e)}
              />
              <div className="absolute inset-x-4 lg:inset-x-6 bottom-4 lg:bottom-8 p-6 lg:p-10 bg-white/40 backdrop-blur-3xl rounded-[32px] lg:rounded-[40px] border-white/80 group-hover:translate-y-2 transition-transform shadow-xl">
                 <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[8px] lg:text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-bold mb-2">Nexus Live</div>
                        <div className="text-lg lg:text-2xl font-display font-bold text-slate-900 leading-none tracking-tight tracking-tighter">Status: Active</div>
                    </div>
                    <div className="w-10 lg:w-14 h-10 lg:h-14 bg-white/80 rounded-xl lg:rounded-2xl flex items-center justify-center text-emerald-500">
                        <Activity size={20} className="animate-pulse" />
                    </div>
                 </div>
              </div>
           </div>
        </Suspense>
      </div>
    </div>
  </section>
);

const FacilitySection = ({ config, index = 0 }: { config: AppSection, index?: number }) => (
  <SectionWrapper id="facilities" title="Core Facilities" subtitle="Advanced technology at your service" index={index}>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-4 lg:px-0">
      {config.items?.map((item, i) => (
        <motion.div
           key={i}
           whileHover={{ y: -5 }}
           className="android-card p-8 group border-emerald-50/30"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <Layers size={28} className="group-hover:rotate-12 transition-transform" />
          </div>
          <h3 className="text-xl font-display font-bold mb-3 text-slate-900">{item.title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed font-light">{item.desc}</p>
          <div className="mt-8 flex items-center justify-between">
             <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Active Node</span>
             <ChevronRight size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

const Navbar = () => (
  <header className="fixed top-0 inset-x-0 z-50 pointer-events-none p-4 lg:p-6 lg:px-20">
    <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-[24px] shadow-sm border border-white/50">
        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Plus className="text-white w-5 h-5 stroke-[4px]" />
        </div>
        <div>
          <h1 className="text-sm font-display font-bold leading-none text-slate-900 tracking-tighter">DIVYAM Hub</h1>
          <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-[0.4em] mt-0.5">Bikaneri Node</p>
        </div>
      </div>
      
      <nav className="hidden lg:flex items-center gap-8 bg-white/50 backdrop-blur-2xl px-10 py-3.5 rounded-full shadow-lg border border-white/50">
        {['About', 'Facility', 'Pharmacy', 'Emergency', 'Staff'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">
            {item}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button className="w-11 h-11 bg-white/80 backdrop-blur-xl rounded-[20px] flex items-center justify-center shadow-sm border border-white/50 text-slate-500 active:scale-95 transition-all">
          <Bell size={18} />
        </button>
        <button className="hidden sm:flex px-6 py-3 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-[20px] shadow-xl hover:bg-emerald-500 transition-colors">
          Console
        </button>
      </div>
    </div>
  </header>
);

const MobileNav = ({ active, set }: { active: string, set: (s: string) => void }) => (
  <nav className="fixed bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-18 bg-white/90 backdrop-blur-3xl z-50 flex lg:hidden items-center justify-around px-4 rounded-[32px] border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
     {[
       { id: 'home', icon: Home, label: 'Hub' },
       { id: 'fac', icon: Layers, label: 'Nodes' },
       { id: 'sos', icon: Zap, label: 'SOS' },
       { id: 'docs', icon: User, label: 'Staff' }
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
           className="relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300"
         >
           <motion.div 
             animate={isActive ? { scale: [1, 1.1, 1], y: -2 } : { scale: 1, y: 0 }}
             className={`flex items-center justify-center w-12 h-8 rounded-full mb-1 transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-600' : 'text-slate-400'}`}
           >
              <item.icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
           </motion.div>
           <span className={`text-[8px] font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
             {item.label}
           </span>
           {isActive && (
             <motion.div 
               layoutId="pill" 
               className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full" 
             />
           )}
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
                  <div className="neu-flat p-12 rounded-[60px] aspect-square flex items-center justify-center">
                     <div className="w-full h-full glass rounded-[40px] flex items-center justify-center border-white/50">
                        <Smile size={100} className="text-emerald-500/30" />
                     </div>
                  </div>
                  <div>
                    <h3 className="text-4xl font-display font-bold text-slate-900 mb-8 uppercase leading-tight">Decades of <br /><span className="text-emerald-500">Human Care</span> Reimagined</h3>
                    <p className="text-lg text-slate-500 font-light leading-relaxed mb-10">
                      Located near the Old Post Office in Gangashahar, Divyam stands as a beacon of advanced medical integration. 
                      Our multi-specialty approach combines the wisdom of senior experts with the precision of Nexus autonomous systems.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="neu-inset p-6 rounded-3xl">
                         <div className="text-3xl font-display font-bold text-emerald-500">20+</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Specialists</div>
                      </div>
                      <div className="neu-inset p-6 rounded-3xl">
                         <div className="text-3xl font-display font-bold text-emerald-500">50k+</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Bikaner Patients</div>
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 px-4 lg:px-0">
                    {section.items?.map((doc, i) => (
                      <motion.div 
                        key={i} 
                        className="glass-glossy p-6 lg:p-8 text-center group cursor-pointer rounded-[40px] flex flex-col items-center"
                      >
                        <div className="relative w-24 lg:w-32 h-24 lg:h-32 mb-6">
                           <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" />
                           <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:border-emerald-500 transition-colors">
                              {doc.image ? (
                                <img 
                                  src={doc.image} 
                                  alt={doc.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                                   <User size={48} />
                                </div>
                              )}
                           </div>
                           <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 scale-0 group-hover:scale-100 transition-transform">
                              <Plus size={12} strokeWidth={3} />
                           </div>
                        </div>
                        
                        <h4 className="font-display text-sm lg:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight leading-none mb-2">{doc.name}</h4>
                        <p className="text-[8px] lg:text-[10px] font-bold uppercase text-emerald-600/40 tracking-[0.2em] mb-4">{doc.role}</p>
                        
                        <div className="flex justify-center gap-0.5 text-yellow-400/60 group-hover:text-yellow-400 mb-8 transition-colors">
                           {[1,2,3,4,5].map(j => <Star key={j} size={8} fill="currentColor" stroke="none" />)}
                        </div>
                        
                        <div className="w-full mt-auto">
                           <button className="w-full py-3.5 bg-white/20 backdrop-blur-md rounded-2xl text-[9px] font-bold uppercase tracking-widest border border-white/50 text-slate-900 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm">
                             Connect Node
                           </button>
                           <div className="flex items-center justify-center gap-2 mt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">Active Relay</span>
                           </div>
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

        {/* Static Map & Hub Location */}
        <section className="section-width py-12 lg:py-24 mb-24 lg:mb-0 relative overflow-hidden">
           <div className="grid lg:grid-cols-3 gap-8 px-4 lg:px-0">
              <div className="lg:col-span-2 android-card bg-emerald-50/30 min-h-[400px] relative group overflow-hidden">
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-200 p-10 text-center">
                    <MapPin size={80} className="mb-6 opacity-40 animate-bounce" />
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-600">Bikaner Location Hub</p>
                    <p className="text-xs mt-4 max-w-xs text-slate-400">Connected to the Gangashahar medical node next to Old Post Office.</p>
                 </div>
                 
                 <div className="absolute bottom-6 lg:bottom-8 left-6 lg:left-8 right-6 lg:right-8 flex flex-col sm:flex-row gap-6 items-center justify-between">
                    <div className="bg-white/80 backdrop-blur-3xl px-8 py-6 rounded-[32px] border border-white shadow-xl w-full sm:w-auto">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <h5 className="font-bold text-slate-900 text-lg">Divyam Hospital</h5>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Near Old Post Office, Gangashahar, Bikaner</p>
                        <div className="flex gap-6 mt-6 pt-6 border-t border-slate-100">
                           <a href="https://www.google.com/search?q=Divyam+Hospital+Bikaner" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 uppercase hover:text-emerald-700 transition-colors">
                              <Search size={14}/> Google
                           </a>
                           <a href="https://www.justdial.com/Bikaner/Divyam-Hospital-Near-Old-Post-Office-Gangashahar/9999PX151.X151.180215161042.Z1G3" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-bold text-blue-600 uppercase hover:text-blue-700 transition-colors">
                              <Zap size={14}/> Hub Node
                           </a>
                        </div>
                    </div>
                    <div className="flex -space-x-4">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-emerald-50 flex items-center justify-center shadow-lg overflow-hidden relative">
                            <User size={20} className="text-emerald-300" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                         </div>
                       ))}
                       <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-900 text-white flex items-center justify-center shadow-lg text-[10px] font-bold">+12</div>
                    </div>
                 </div>
              </div>
              <div className="android-card p-10 flex flex-col justify-between bg-white/60 backdrop-blur-md border-white">
                 <div>
                    <div className="w-14 h-14 bg-emerald-500 rounded-[20px] flex items-center justify-center text-white mb-10 shadow-xl shadow-emerald-500/20">
                       <Database size={28} />
                    </div>
                    <h3 className="text-4xl font-display font-bold uppercase mb-10 leading-[0.9] tracking-tighter text-slate-900">Nexus <br />Command <br /><span className="text-emerald-500 italic">Live</span></h3>
                    <div className="space-y-6">
                       {[
                         { l: 'Node Latency', v: '0.02ms', c: 'text-emerald-500' },
                         { l: 'Capacity', v: '94%', c: 'text-blue-500' },
                         { l: 'Accuracy', v: '99.9%', c: 'text-emerald-500' }
                       ].map(i => (
                         <div key={i.l} className="flex justify-between items-center border-b border-slate-50 pb-4">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">{i.l}</span>
                            <span className={`text-[10px] font-bold uppercase ${i.c}`}>{i.v}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <button className="w-full h-18 bg-slate-900 text-white font-bold uppercase tracking-[0.2em] rounded-[24px] shadow-2xl hover:bg-emerald-500 active:scale-95 transition-all text-[10px] mt-12">
                    Enter Console
                 </button>
              </div>
           </div>
        </section>

        {/* FAQ Section */}
        <SectionWrapper id="faq" title="Nexus Inquiries" subtitle="Got questions about our relay systems?" index={sections.length}>
           <div className="max-w-3xl mx-auto space-y-4 px-4 lg:px-0">
              {[
                { q: 'What is Divyam Nexus?', a: 'A multi-specialty clinical workflow designed to organize specialists and diagnostic streams into one autonomous hub.' },
                { q: 'Is emergency dispatch available 24/7?', a: 'Yes, our Bikaner dispatch unit is always active with an average 5-minute response time.' },
                { q: 'How can I manage my data?', a: 'Through the Nexus Console, you have full transparency over your medical records and specialist input.' }
              ].map((faq, i) => (
                <div key={i} className="android-card p-8 bg-white/60 backdrop-blur-md border-white/40">
                   <h5 className="font-bold text-slate-800 flex items-center gap-3">
                      <HelpCircle size={18} className="text-emerald-500" />
                      {faq.q}
                   </h5>
                   <p className="mt-4 text-sm text-slate-500 font-light leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </SectionWrapper>
      </main>

      {/* Footer (Hiding on Mobile as requested) */}
      <footer className="hidden lg:block bg-slate-900 pt-32 pb-20 px-6 lg:px-20 text-white rounded-t-[80px] relative z-10">
         <div className="section-width grid grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="col-span-2">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <Plus size={24} className="stroke-[3px]" />
                  </div>
                  <h2 className="text-3xl font-display font-bold tracking-tighter">DIVYAM NEXUS</h2>
               </div>
               <p className="text-slate-400 text-sm max-w-sm font-light leading-relaxed mb-10">
                  Tomorrow's health architecture, serving Bikaner today. Autonomous specialists 
                  integrated with human compassion.
               </p>
            </div>
            {['Nexus', 'Service', 'Legal'].map(cat => (
               <div key={cat}>
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-8">{cat}</h5>
                  <ul className="space-y-4 text-slate-400 text-sm font-light">
                     <li>Console</li>
                     <li>Doctors</li>
                     <li>Privacy</li>
                  </ul>
               </div>
            ))}
         </div>
      </footer>

      <MobileNav active={mobileTab} set={setMobileTab} />
    </div>
  );
}
