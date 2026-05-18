import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Plus, Heart, Zap, Stethoscope, Microscope, MapPin, 
  ChevronRight, Activity, Phone, Search, Bell, User, 
  Menu, X, ShieldCheck, Clock, Smile, Baby, Camera,
  MessageSquare, HelpCircle, Star, Settings, Layout,
  Layers, Database, Play, Thermometer, LogOut, ArrowRight,
  History, CreditCard, Wallet, Share2, Pill, Ambulance,
  UserPlus, CheckCircle2, ChevronLeft, Scissors, Home
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import firebaseConfig from '../firebase-applet-config.json';
import { collection, onSnapshot, query, orderBy, setDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { supabase } from './lib/supabase';
import NexusSpinner from './components/NexusSpinner';
import AdminPanel from './admin/AdminPanel';

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

const GlobalBackground = () => {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FDFDFD]">
      <motion.div 
        style={{ rotate, scale }}
        className="absolute inset-0 bg-radial-[circle_at_50%_50%] from-rose-500/5 via-transparent to-transparent opacity-40" 
      />
      
      {/* Flying Medical Items */}
      <div className="absolute inset-0">
         {[
           { icon: Ambulance, color: 'text-rose-500/20' },
           { icon: Pill, color: 'text-indigo-500/20' },
           { icon: Heart, color: 'text-red-500/20' },
           { icon: Stethoscope, color: 'text-slate-500/10' },
           { icon: Plus, color: 'text-rose-600/10' },
           { icon: Microscope, color: 'text-blue-500/15' },
           { icon: Activity, color: 'text-emerald-500/10' },
         ].map((item, i) => (
           <FlyingMedicalBrand key={i} icon={item.icon} color={item.color} i={i} />
         ))}
      </div>

      {/* 3D Background Elements Rotation */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
         <motion.div 
           style={{ rotateY: rotate, rotateX: rotate }}
           className="w-[800px] h-[800px] border-[40px] border-rose-500 rounded-[100px] blur-3xl"
         />
      </div>
    </div>
  );
};

const FlyingMedicalBrand = ({ icon: Icon, color, i }: { icon: any, color: string, i: number }) => (
  <motion.div
    initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100, y: Math.random() * 1000 }}
    animate={{ 
      opacity: [0, 0.4, 0.4, 0],
      x: [i % 2 === 0 ? -100 : 1100, i % 2 === 0 ? 1100 : -100],
      y: [Math.random() * 800, Math.random() * 800],
      rotate: [0, 360],
      scale: [0.8, 1.2, 0.8]
    }}
    transition={{ 
      duration: 30 + i * 5, 
      repeat: Infinity, 
      ease: "linear",
      delay: i * 2 
    }}
    className={`absolute pointer-events-none ${color}`}
  >
    <Icon size={40 + (i % 3) * 20} />
  </motion.div>
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
      <div className="w-full h-full bg-gradient-to-br from-rose-500/5 to-indigo-500/5 flex items-center justify-center">
        <div className="text-center p-8">
          <Activity size={40} className="text-rose-500/20 mx-auto mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nexus Visualizer Offline</p>
        </div>
      </div>
    );
  }

  return <Spline {...props} />;
};

const HealthcareElement = ({ icon: Icon, i }: { icon: any, i: number }) => {
  const isCapsule = i % 3 === 0;
  const isTablet = i % 3 === 1;
  const isPill = i % 3 === 2;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 0 }}
      animate={{ 
        opacity: [0, 0.6, 0.4, 0],
        y: [0, -300, -600],
        x: [0, Math.sin(i) * 50, Math.sin(i + 1) * 100],
        rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{ 
        duration: 25 + i * 10, 
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 3
      }}
      className="absolute pointer-events-none"
      style={{
        left: `${(i * 12) % 95}%`,
        bottom: "-150px",
        zIndex: 5
      }}
    >
      <div className={`
        ${isCapsule ? 'w-12 h-26 rounded-full' : isTablet ? 'w-16 h-16 rounded-full' : 'w-20 h-10 rounded-full'} 
        glass-neu border-white/60 flex items-center justify-center shadow-2xl relative overflow-hidden group
      `}>
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-white/40 pointer-events-none" />
        
        {/* Internal Glow */}
        <div className={`absolute inset-[10%] rounded-full ${i % 2 === 0 ? 'bg-rose-500/10' : 'bg-slate-200/50'} blur-md animate-pulse`} />
        
        <Icon size={isCapsule ? 22 : 18} className={`text-rose-500 transition-all duration-1000 ${i % 2 === 0 ? 'opacity-30' : 'opacity-20'}`} />
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
          viewport={{ once: true }}
          className="w-12 lg:w-20 h-1.5 bg-rose-500 mb-6 lg:mx-auto rounded-full shadow-[0_0_20px_rgba(244,63,94,0.4)]"
        />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-7xl font-display font-medium text-slate-900 uppercase tracking-tighter leading-none mb-4 text-3d px-1"
        >
          {title.split(' ').map((word, j) => (
             <span key={j} className={j === 1 ? 'text-rose-500 italic text-3d-red' : ''}>{word}{' '}</span>
          ))}
        </motion.h2>
        {subtitle && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 glass-glossy rounded-full"
          >
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[8px] lg:text-[10px]">{subtitle}</p>
          </motion.div>
        )}
      </div>
      {children}
    </div>
  </section>
);

const GallerySection = ({ index = 0 }: { index?: number }) => (
  <SectionWrapper id="gallery" title="Facility Gallery" subtitle="Take a look inside our Bikaner unit" index={index}>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 px-4 lg:px-0">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -8, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-neu aspect-square flex items-center justify-center relative group cursor-pointer border-white/40 bg-white/40"
        >
          <div className="absolute inset-4 glass-glossy rounded-[32px] flex items-center justify-center bg-rose-50/20">
            <Camera size={28} className="opacity-20 group-hover:scale-125 group-hover:opacity-100 transition-all text-rose-600" />
          </div>
          <div className="absolute inset-x-0 bottom-8 text-center text-[8px] lg:text-[10px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-all text-rose-600">Scan Node {i}</div>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

const TestimonialSection = ({ index = 0 }: { index?: number }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <SectionWrapper id="testimonials" title="Patient Pulse" subtitle="What the Bikaner community says" index={index}>
      <div className="relative group">
        <div 
          ref={containerRef}
          className="grid grid-flow-col auto-cols-[calc(100%-48px)] md:auto-cols-[calc(33.33%-32px)] gap-6 lg:gap-10 overflow-x-auto no-scrollbar pb-16 px-6 lg:px-0 scroll-smooth content-stretch"
        >
          {[
            { name: 'Rajesh K.', text: 'Expert treatment and high-tech facility. Gangashahar hub is a lifesaver.' },
            { name: 'Suman V.', text: 'The nexus pharmacy dispatch is incredibly fast. Best care for kids.' },
            { name: 'Amit S.', text: 'Autonomous diagnosis saved us 2 hours of travel. Truly revolutionary.' },
            { name: 'Priya M.', text: 'Digital records are so easy to access. Best hospital in Bikaner.' },
            { name: 'Sunil J.', text: 'The staff is very friendly and the node technology is amazing.' },
            { name: 'Mehta Ji', text: 'OPD registration was smooth and the wait times were minimal.' }
          ].map((t, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              transition={{ delay: i * 0.1 }}
              className="glass-neu p-8 lg:p-10 flex flex-col justify-between border-white/80 bg-white/60 shadow-xl self-stretch cursor-default"
            >
               <div>
                 <div className="flex gap-1 text-yellow-500 mb-6">
                    {[1,2,3,4,5].map(j => <Star key={j} size={14} fill="currentColor" stroke="none" />)}
                 </div>
                 <p className="text-slate-600 italic font-light leading-relaxed mb-8 text-base line-clamp-4">"{t.text}"</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 glass-neu !bg-rose-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg !border-none shrink-0">
                     {t.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{t.name}</span>
                    <span className="text-[8px] uppercase tracking-widest text-rose-600 font-bold opacity-70">Verified</span>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
        
        {/* Animated Scroll Arrow */}
        <motion.div 
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex w-12 h-12 glass-neu-red items-center justify-center rounded-full shadow-2xl cursor-pointer"
          onClick={() => containerRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
        >
          <ArrowRight size={24} />
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

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
             <motion.button 
               whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#dc2626" }}
               whileTap={{ scale: 0.95 }}
               className="glass-neu w-full sm:w-auto px-12 py-6 bg-white text-red-600 font-bold text-xs lg:text-sm shadow-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-4 !rounded-full"
             >
                Call SOS Node <Phone size={20} />
             </motion.button>
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
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="glass-neu-red w-full py-6 mt-12 text-white text-[11px] font-bold uppercase tracking-widest shadow-2xl transition-all !rounded-full"
        >
          Refill Prescription
        </motion.button>
      </div>
      <div className="grid grid-cols-2 gap-6 lg:gap-8">
        {[
          { t: 'Rapid Dispatch', d: 'Bikaner 15min', i: Zap, c: 'text-rose-500' },
          { t: 'Direct Supply', d: 'Nexus Verified', i: ShieldCheck, c: 'text-rose-500' },
          { t: 'Cold Chain', d: 'Managed Hubs', i: Database, c: 'text-slate-900' },
          { i: MessageSquare, t: 'AI Guide', d: 'Dosage Support', c: 'text-indigo-500' }
        ].map((item, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5, backgroundColor: "rgba(255, 241, 242, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            className="glass-neu p-8 bg-white/40 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 glass-neu-red rounded-2xl flex items-center justify-center mb-6 shadow-sm !rounded-xl">
               <item.i size={24} className="text-white group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-bold text-sm lg:text-base mb-2 text-slate-900 uppercase tracking-tight">{item.t}</h4>
            <p className="text-[10px] text-slate-400 leading-tight uppercase font-bold tracking-widest opacity-60">{item.d}</p>
          </motion.div>
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
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="glass-neu-red px-12 py-5 font-bold uppercase tracking-widest text-[10px] transition-all !rounded-full"
            >
              Book Analysis
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="glass-neu !bg-white/10 !text-white px-12 py-5 border border-white/20 font-bold uppercase tracking-widest text-[10px] !rounded-full"
            >
              Results Hub
            </motion.button>
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
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ y: -12, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-neu p-8 lg:p-12 text-center flex flex-col items-center group cursor-pointer"
        >
          <div className="w-16 h-16 lg:w-24 lg:h-24 bg-rose-50 rounded-full mb-6 lg:mb-8 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 glass-neu !shadow-sm">
            <User size={36} />
          </div>
          <h5 className="font-bold text-slate-800 text-sm lg:text-lg whitespace-nowrap uppercase tracking-tight">{staff.name}</h5>
          <p className="text-[8px] lg:text-[10px] font-bold text-rose-600/60 uppercase tracking-[0.2em] mt-2">{staff.role}</p>
          <div className="mt-4 px-4 py-1.5 glass-glossy rounded-full text-[7px] lg:text-[9px] font-bold text-rose-600 uppercase tracking-widest">
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
    { n: 'Dental', i: ShieldCheck, c: 'text-rose-500' },
    { n: 'Labs', i: Microscope, c: 'text-indigo-500' },
    { n: 'Vision', i: Camera, c: 'text-orange-500' }
  ];
  return (
    <div className="lg:hidden px-6 mb-6 mt-4 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
        {cats.map((c, i) => (
          <motion.div 
            key={c.n} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
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

const Hero = ({ config, banners = [] }: { config: AppSection, banners?: any[] }) => {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setActiveBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const currentBanner = banners[activeBanner] || {
    title: "Healthcare",
    subtitle: "Redefined",
    description: "Precision diagnostics & world-class care, integrated into Bikaner's most advanced autonomous node."
  };

  return (
    <section id="hero" className="relative min-h-screen bg-[#FDFDFD] overflow-hidden flex flex-col lg:flex-row">
      {/* Animated Background Stroke */}
      <div className="absolute inset-x-0 top-0 h-screen pointer-events-none opacity-5">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M0,500 Q250,200 500,500 T1000,500" fill="none" stroke="#ef4444" strokeWidth="20" className="animated-stroke" />
        </svg>
      </div>

      {/* Left Content Side */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-24 py-24 lg:py-0 relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-4 mb-8 lg:mb-12">
              <div className="w-12 h-12 lg:w-14 lg:h-14 glass-neu-red flex items-center justify-center text-white shadow-2xl !rounded-2xl shrink-0">
                <Plus className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={4} />
              </div>
              <div className="px-4 lg:px-5 py-1.5 lg:py-2 glass-glossy rounded-full border border-red-100/50">
                 <span className="text-[8px] lg:text-[10px] font-bold text-rose-500 uppercase tracking-[0.4em]">Nexus Core Active</span>
              </div>
            </div>

            <div className="relative mb-6 lg:mb-8 h-[80px] lg:h-[180px] w-full">
               <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                 <text 
                   x="0" 
                   y="150" 
                   className="font-display font-bold text-[80px] lg:text-[150px] uppercase tracking-tighter stroke-rose-500/30 fill-transparent animated-stroke"
                   strokeWidth="2"
                 >
                   DIVYAM
                 </text>
                 <text 
                   x="5" 
                   y="150" 
                   className="font-display font-bold text-[80px] lg:text-[150px] uppercase tracking-tighter fill-slate-900"
                 >
                   DIVYAM
                 </text>
               </svg>
            </div>

            <h1 className="text-5xl lg:text-[100px] font-display font-medium leading-[0.85] text-[#1D1D1F] mb-10 lg:mb-12 tracking-tighter text-3d px-1 relative">
               <motion.span 
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="block"
               >
                 {currentBanner.title}
               </motion.span>
               <motion.span 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="text-3d-red italic"
               >
                 {currentBanner.subtitle}
               </motion.span>
            </h1>

            <p className="text-lg lg:text-2xl text-slate-500 max-w-lg mb-12 lg:mb-16 font-light leading-relaxed opacity-80">
              {currentBanner.description}
            </p>

            {/* Horizontal Layout for Mobile Buttons */}
            <div className="flex flex-row lg:flex-wrap gap-4 lg:gap-8 mb-16 lg:mb-32 overflow-x-auto no-scrollbar py-4 px-1">
              <motion.button 
                whileHover={{ scale: 1.05, y: -4, boxShadow: "0 25px 60px rgba(239, 68, 68, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}
                className="glass-neu-red flex-shrink-0 !py-4 lg:!py-7 px-8 lg:!px-16 text-[9px] lg:!text-xs !font-bold !uppercase !tracking-widest !rounded-full shadow-lg lg:shadow-[0_20px_50px_rgba(239,68,68,0.3)] transition-all"
              >
                {currentBanner.button1 || "Access Care"}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -4, backgroundColor: "rgba(255, 255, 255, 1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('emergency')?.scrollIntoView({ behavior: 'smooth' })}
                className="glass-neu flex-shrink-0 !py-4 lg:!py-7 px-8 lg:!px-16 text-[9px] lg:!text-xs !font-bold !uppercase !tracking-widest !rounded-full flex items-center gap-3 lg:gap-4 text-slate-900 border border-slate-100 transition-all shadow-md lg:shadow-xl"
              >
                {currentBanner.button2 || "緊急 SOS"} <Phone className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5 text-rose-500" />
              </motion.button>
            </div>

            {/* Banner Indicators */}
            {banners.length > 1 && (
              <div className="flex gap-2 mb-8">
                {banners.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveBanner(i)}
                    className={`h-1 rounded-full transition-all duration-500 ${activeBanner === i ? 'w-8 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'w-4 bg-slate-200'}`} 
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between lg:justify-start lg:gap-20 border-t border-slate-100 pt-10 lg:pt-12">
               <div className="glass-neu p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] bg-white/40 group hover:bg-white transition-colors">
                  <div className="text-[8px] lg:text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 lg:mb-2 opacity-60">Status: Operational</div>
                  <div className="text-xl lg:text-3xl font-display font-medium text-slate-900 tracking-tighter">12 Active Hubs</div>
               </div>
               <div className="flex items-center gap-4 lg:gap-6 group cursor-pointer">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full glass-neu-red flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-xl">
                     <Play className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" />
                  </div>
                  <span className="text-[9px] lg:text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em]">Overview</span>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Spline Side / Banner Flip Card for Mobile */}
      <div className="flex-1 relative min-h-[450px] lg:min-h-screen bg-[#F5F5F7] lg:rounded-l-[120px] overflow-hidden border-l border-white/50 shadow-inner">
         <div className="lg:hidden absolute inset-0 flex items-center justify-center p-6 perspective-1000">
            <motion.div 
               whileTap={{ rotateY: 180 }}
               transition={{ duration: 0.6, type: 'spring' }}
               className="w-full aspect-[4/5] relative preserve-3d"
               style={{ transformStyle: 'preserve-3d' }}
            >
               {/* Front */}
               <div className="absolute inset-0 backface-hidden rounded-[40px] overflow-hidden shadow-3xl bg-slate-900 border-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent" />
                  <SafeSpline 
                     scene="https://prod.spline.design/WG1dWYKv2NAjdcbA/scene.splinecode" 
                  />
                  <div className="absolute bottom-10 left-10">
                     <p className="text-rose-500 font-bold uppercase tracking-[0.3em] text-[10px]">Tap to Flip Info</p>
                     <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Nexus v3.0</h3>
                  </div>
               </div>
               {/* Back */}
               <div className="absolute inset-0 backface-hidden rounded-[40px] bg-white p-10 flex flex-col justify-center border border-rose-100 shadow-3xl" style={{ transform: 'rotateY(180deg)' }}>
                  <div className="w-14 h-14 glass-neu-red rounded-2xl flex items-center justify-center mb-8">
                     <Activity size={32} />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-slate-900 mb-6 uppercase">Node Health</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between border-b pb-2">
                        <span className="text-[10px] font-bold text-slate-400">UPTIME</span>
                        <span className="text-rose-500 font-bold">99.9%</span>
                     </div>
                     <div className="flex justify-between border-b pb-2">
                        <span className="text-[10px] font-bold text-slate-400">LATENCY</span>
                        <span className="text-slate-900 font-bold">0.4ms</span>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>

         <div className="hidden lg:block w-full h-full scale-110">
            <SafeSpline 
               scene="https://prod.spline.design/WG1dWYKv2NAjdcbA/scene.splinecode" 
            />
         </div>
         
         <div className="hidden lg:flex absolute inset-x-10 bottom-14 lg:bottom-20 p-12 glass-neu border border-white shadow-3xl items-center justify-between group hover:-translate-y-4 transition-transform bg-white/60">
            <div>
               <div className="text-[11px] font-bold text-rose-500 uppercase tracking-[0.5em] mb-3">Live Bio-Feed</div>
               <div className="text-3xl lg:text-5xl font-display font-medium text-slate-900 tracking-tighter text-3d px-1">Gangashahar Node</div>
            </div>
            <div className="w-20 h-20 glass-neu-red rounded-3xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
               <Activity size={40} className="animate-pulse" />
            </div>
         </div>
      </div>
    </section>
  );
};

const FacilitySection = ({ config, index = 0 }: { config: AppSection, index?: number }) => {
  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('pediatrics')) return <Baby size={32} />;
    if (t.includes('gyna')) return <Heart size={32} />;
    if (t.includes('pharmacy')) return <Pill size={32} />;
    if (t.includes('lab')) return <Microscope size={32} />;
    if (t.includes('icu') || t.includes('critical')) return <Activity size={32} />;
    if (t.includes('theatre') || t.includes('surgical')) return <Scissors size={32} />;
    return <Layers size={32} />;
  };

  return (
    <SectionWrapper id="facilities" title="Core Facilities" subtitle="Advanced technology at your service" index={index}>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-12 px-4 lg:px-0">
        {config.items?.map((item, i) => (
          <motion.div
             key={i}
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: i * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
             whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.4 } }}
             className="glass-neu p-4 lg:p-12 aspect-square lg:aspect-auto group border-white/80 bg-white/40 overflow-hidden relative shadow-all flex flex-col justify-between"
          >
            {/* Native app hint label */}
            <div className="absolute top-4 right-4 opacity-10 font-bold text-[8px] uppercase tracking-tighter">Nexus Module</div>
            
            <div className="w-12 h-12 lg:w-24 lg:h-24 glass-neu-red flex items-center justify-center text-white mb-2 lg:mb-10 group-hover:rotate-12 transition-all duration-700 !shadow-2xl !rounded-[20px] lg:!rounded-[28px] shrink-0">
              <div className="lg:hidden scale-50">{getIcon(item.title)}</div>
              <div className="hidden lg:block scale-110">{getIcon(item.title)}</div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-[10px] lg:text-3xl font-display font-medium mb-1 lg:mb-6 text-slate-900 uppercase tracking-tighter text-3d px-1 leading-tight">{item.title}</h3>
              <p className="text-slate-500 text-[8px] lg:text-xl leading-tight lg:leading-relaxed font-light opacity-80 mb-2 lg:mb-8 line-clamp-2 lg:line-clamp-none">{item.desc}</p>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2 lg:pt-6 border-t border-rose-100/30">
               <div className="flex items-center gap-1.5 lg:gap-3">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <span className="text-[7px] lg:text-[10px] font-bold uppercase tracking-widest text-rose-500/60">Live Node</span>
               </div>
               <motion.div 
                whileHover={{ x: 5 }}
                className="w-6 h-6 lg:w-14 lg:h-14 glass-neu bg-white/90 rounded-full flex items-center justify-center text-rose-500 shadow-xl border-white group-hover:bg-rose-500 group-hover:text-white transition-colors"
               >
                  <ChevronRight className="scale-50 lg:scale-100" />
               </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

const Navbar = () => (
  <>
    {/* Android Style Top Bar - Mobile Only */}
    <div className="android-top-bar flex lg:hidden !bg-white/40 !backdrop-blur-3xl !border-white/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 glass-neu !bg-rose-500 rounded-xl flex items-center justify-center text-white">
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
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 glass-neu flex items-center justify-center text-slate-500 transition-all !rounded-2xl"
          >
            <Bell size={22} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "#e11d48" }}
            whileTap={{ scale: 0.95 }}
            className="glass-neu px-10 py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest transition-colors !rounded-2xl shadow-3xl"
          >
            Nexus Console
          </motion.button>
        </div>
      </div>
    </header>
  </>
);

const MobileNav = ({ active, set }: { active: string, set: (s: string) => void }) => (
  <nav className="fixed bottom-0 inset-x-0 h-20 bg-white/95 backdrop-blur-3xl z-50 flex lg:hidden items-center justify-around px-2 border-t border-rose-50 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] pb-safe">
     {[
       { id: 'home', icon: Home, label: 'Home' },
       { id: 'fac', icon: Layers, label: 'Labs' },
       { id: 'pharm', icon: Pill, label: 'Store' },
       { id: 'sos', icon: Zap, label: 'SOS' },
       { id: 'profile', icon: User, label: 'Profile' }
     ].map(item => {
       const isActive = active === item.id;
       return (
         <button 
           key={item.id} 
           onClick={() => {
             set(item.id);
             const targets: Record<string, string> = {
               home: 'hero',
               fac: 'facilities',
               pharm: 'pharmacy',
               sos: 'emergency',
               profile: 'hero' 
             };
             if (item.id !== 'profile') {
               const el = document.getElementById(targets[item.id]);
               el?.scrollIntoView({ behavior: 'smooth' });
             }
           }}
           className="relative flex flex-col items-center justify-center w-full h-full transition-all duration-300"
         >
           <div className="relative mb-1">
             {isActive && (
               <motion.div 
                 layoutId="nav-pill" 
                 className="absolute inset-x-[-12px] inset-y-[-4px] bg-rose-100 rounded-full -z-10" 
                 transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
               />
             )}
             <item.icon 
               size={24} 
               className={`transition-colors duration-300 ${isActive ? 'text-rose-900 stroke-[2.5px]' : 'text-slate-500 opacity-60'}`} 
             />
           </div>
           <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-rose-900' : 'text-slate-400'}`}>
             {item.label}
           </span>
         </button>
       );
     })}
  </nav>
);

export default function App() {
  const [sections, setSections] = useState<AppSection[]>([]);
  const [mobileTab, setMobileTab] = useState('home');
  const [loading, setLoading] = useState(true);
  
  // Auth & Profile State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [regData, setRegData] = useState({ name: '', opd: '', mobile: '' });
  const [ipdData, setIpdData] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "banners"), (snap) => {
      setHeroBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
          checkSupabaseData(userDoc.data().opd);
        } else {
          setIsRegModalOpen(true);
        }
      } else {
        setProfile(null);
        setIpdData([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const checkSupabaseData = async (opd: string) => {
    if (!opd) return;
    const { data, error } = await supabase
      .from('patients_ipd')
      .select('*')
      .eq('opd_number', opd);
    
    if (data) {
      setIpdData(data);
    }
  };

  const handlePhoneLogin = async () => {
    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setIsOTPModalOpen(true);
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP. Check console.');
    }
  };

  const handleOTPSubmit = async () => {
    try {
      await confirmationResult?.confirm(otp);
      setIsOTPModalOpen(false);
    } catch (err) {
      alert('Invalid OTP');
    }
  };

  const handleRegistrationSubmit = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      ...regData,
      uid: user.uid,
      createdAt: new Date().toISOString()
    });
    setProfile(regData);
    checkSupabaseData(regData.opd);
    setIsRegModalOpen(false);
  };

  useEffect(() => {
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
     return <NexusSpinner />;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-rose-100 selection:text-rose-900">
      <GlobalBackground />
      <Navbar />
      
      <main className="relative z-10 no-scrollbar scroll-smooth">
        {sections.filter(s => s.enabled).map((section, i) => (
          <React.Fragment key={section.id}>
            {section.type === 'hero' && (
              <>
                <Hero config={section} banners={heroBanners} />
                <CategoryScroll />
              </>
            )}
            {section.type === 'about' && (
              <SectionWrapper id="about" title="About Nexus" subtitle="The Bikaner medical legacy" index={i}>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="glass-neu p-16 rounded-[80px] aspect-square flex items-center justify-center bg-white/40">
                     <div className="w-full h-full glass-glossy rounded-[60px] flex items-center justify-center border-white/50">
                        <Smile size={120} className="text-rose-500/40 animate-pulse" />
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
                           <div className="absolute inset-[-10px] glass-neu !rounded-full !bg-rose-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                  <div className="w-full h-full bg-rose-50 flex items-center justify-center text-rose-500">
                                     <User size={48} />
                                  </div>
                                )}
                              </div>
                           </div>
                           <div className="absolute bottom-2 right-2 w-10 h-10 glass-neu !bg-rose-500 rounded-full border-4 border-white flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-xl">
                              <Plus size={16} strokeWidth={4} />
                           </div>
                        </div>
                        
                        <h4 className="font-display text-lg lg:text-2xl font-bold text-slate-900 leading-tight mb-2 uppercase tracking-tighter text-3d px-1">{doc.name}</h4>
                        <p className="text-[10px] lg:text-[12px] font-bold uppercase text-rose-600/60 tracking-widest mb-6 opacity-80">{doc.role}</p>
                        
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
              <div className="lg:col-span-2 glass-neu bg-rose-50/30 min-h-[500px] relative group overflow-hidden border-none shadow-3xl">
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-200 p-10 text-center opacity-40">
                    <MapPin size={100} className="mb-8 animate-bounce" />
                    <p className="text-lg font-bold uppercase tracking-[0.4em] text-rose-600">Bikaner Location Hub</p>
                 </div>
                 
                 <div className="absolute bottom-10 lg:bottom-12 left-10 lg:left-12 right-10 lg:right-12 flex flex-col lg:flex-row gap-10 items-center justify-between">
                    <div className="glass-neu bg-white/80 backdrop-blur-3xl px-10 py-8 border-white shadow-2xl w-full lg:w-auto">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                           <h5 className="font-bold text-slate-900 text-2xl uppercase tracking-tighter text-3d px-1">Divyam Node</h5>
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Near Old Post Office, Gangashahar, Bikaner</p>
                        <div className="flex gap-8 mt-10 pt-8 border-t border-slate-100">
                           <a href="https://www.google.com/search?q=Divyam+Hospital+Bikaner" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[10px] font-bold text-rose-600 uppercase hover:text-rose-700 transition-colors">
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
                    <div className="w-16 h-16 glass-neu !bg-rose-500 rounded-[28px] flex items-center justify-center text-white mb-12 shadow-xl shadow-rose-500/30 !border-none">
                       <Database size={32} />
                    </div>
                    <h3 className="text-5xl font-display font-bold uppercase mb-12 leading-[0.9] tracking-tighter text-slate-900 text-3d px-1">Nexus <br />Command <br /><span className="text-rose-500 text-3d-red">Live</span></h3>
                    <div className="space-y-8">
                       {[
                         { l: 'Node Latency', v: '0.02ms', c: 'text-rose-500 text-3d-red' },
                         { l: 'Capacity', v: '94%', c: 'text-blue-500' },
                         { l: 'Accuracy', v: '99.9%', c: 'text-rose-500' }
                       ].map(i => (
                         <div key={i.l} className="flex justify-between items-center border-b border-slate-100 pb-5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{i.l}</span>
                            <span className={`text-[11px] font-bold uppercase ${i.c}`}>{i.v}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <button className="glass-neu w-full h-20 bg-slate-900 text-white font-bold uppercase tracking-[0.2em] rounded-full shadow-2xl hover:!bg-rose-500 active:scale-95 transition-all text-xs mt-16 !border-none">
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
                <div key={i} className="glass-neu p-10 bg-white/60 border-white/40 group hover:bg-rose-50/30 transition-colors">
                   <h5 className="font-bold text-slate-800 flex items-center gap-4 text-lg lg:text-xl uppercase tracking-tighter text-3d px-1">
                      <div className="w-10 h-10 glass-neu !bg-rose-50 flex items-center justify-center text-rose-500 !shadow-sm">
                         <HelpCircle size={20} />
                      </div>
                      {faq.q}
                   </h5>
                   <p className="mt-6 text-base text-slate-500 font-light leading-relaxed pl-14 opacity-80">{faq.a}</p>
                </div>
              ))}
           </div>
        </SectionWrapper>

        {/* --- Modals & Overlays --- */}
        <AnimatePresence>
          {isAuthModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setIsAuthModalOpen(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="relative glass-neu p-10 w-full max-w-md bg-white border-none shadow-[0_32px_64px_rgba(0,0,0,0.2)]"
              >
                <div className="w-16 h-16 glass-neu-red flex items-center justify-center mb-8 mx-auto shadow-xl">
                  <User size={32} />
                </div>
                <h3 className="text-3xl font-display font-bold text-slate-900 text-center mb-2 uppercase tracking-tighter">Nexus Login</h3>
                <p className="text-slate-500 text-center text-xs mb-10 font-bold uppercase tracking-widest opacity-60">Enter phone for relay access</p>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                      <input 
                        type="text" 
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+91 99999 99999"
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold"
                      />
                   </div>
                   <button 
                    onClick={handlePhoneLogin}
                    className="glass-neu-red w-full !py-5 !rounded-2xl font-bold uppercase tracking-widest text-xs"
                   >
                     Send OTP
                   </button>
                   <div id="recaptcha-container"></div>
                </div>
              </motion.div>
            </div>
          )}

          {isOTPModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="relative glass-neu p-10 w-full max-w-md bg-white border-none"
              >
                <h3 className="text-3xl font-display font-bold text-slate-900 text-center mb-8 uppercase">Verify OTP</h3>
                <input 
                  type="text" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center text-2xl font-display tracking-[1em] mb-8"
                />
                <button 
                  onClick={handleOTPSubmit}
                  className="glass-neu-red w-full !py-5 !rounded-2xl font-bold uppercase tracking-widest text-xs"
                >
                  Confirm Node
                </button>
              </motion.div>
            </div>
          )}

          {isRegModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div 
                className="relative glass-neu p-10 w-full max-w-md bg-white"
              >
                <h3 className="text-3xl font-display font-bold text-slate-900 mb-8 uppercase">Nexus Register</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400">FULL NAME</label>
                    <input type="text" onChange={e => setRegData({...regData, name: e.target.value})} className="w-full bg-slate-50 p-4 border border-slate-100 rounded-2xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400">OPD NUMBER</label>
                    <input type="text" onChange={e => setRegData({...regData, opd: e.target.value})} className="w-full bg-slate-50 p-4 border border-slate-100 rounded-2xl" placeholder="e.g. 12345" />
                  </div>
                  <button onClick={handleRegistrationSubmit} className="glass-neu-red w-full !py-5">Activate Profile</button>
                </div>
              </motion.div>
            </div>
          )}

          {mobileTab === 'profile' && user && profile && (
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed inset-0 z-[120] bg-white flex flex-col pt-12"
            >
              <div className="px-6 flex items-center justify-between mb-8">
                <button onClick={() => setMobileTab('home')} className="w-12 h-12 glass-neu flex items-center justify-center"><ChevronLeft /></button>
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-display font-bold uppercase" onClick={() => {
                    // Hidden trigger for admin
                    if (profile.opd === '511083') setIsAdminMode(true);
                  }}>Nexus Profile</h2>
                </div>
                <button onClick={() => auth.signOut()} className="w-12 h-12 glass-neu flex items-center justify-center text-rose-500"><LogOut /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-32">
                 <div className="glass-neu p-10 bg-slate-900 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl" />
                    <div className="w-20 h-20 glass-neu-red rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                      <User size={40} />
                    </div>
                    <h4 className="text-3xl font-display font-medium text-white mb-1 uppercase tracking-tighter">{profile.name}</h4>
                    <p className="text-rose-400 font-bold text-[10px] uppercase tracking-widest">Nexus Node: {profile.opd}</p>
                 </div>

                 {/* IPD Data from Supabase */}
                 <div className="space-y-6">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Live Relay Status</h5>
                    {ipdData.length > 0 ? ipdData.map((ipd, idx) => (
                      <div key={idx} className="glass-neu p-8 bg-white border-rose-50">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                               <div className="text-[9px] font-bold text-rose-500 uppercase mb-1">IPD RELAY</div>
                               <div className="text-xl font-bold text-slate-900">Bed: {ipd.bed_number}</div>
                            </div>
                            <div className="px-3 py-1 bg-rose-500 text-white rounded-full text-[8px] font-bold">ACTIVE</div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                               <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">ADMISSION</div>
                               <div className="text-xs font-bold">{ipd.admission_date}</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                               <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">CONDITION</div>
                               <div className="text-xs font-bold text-rose-500 uppercase">{ipd.status}</div>
                            </div>
                         </div>
                      </div>
                    )) : (
                      <div className="glass-neu p-10 text-center bg-slate-50/50">
                        <Activity className="mx-auto mb-4 text-slate-200" size={40} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active IPD Relay Found</p>
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button className="glass-neu p-8 flex flex-col items-center gap-4">
                       <History size={24} className="text-rose-500" />
                       <span className="text-[9px] font-bold uppercase">History</span>
                    </button>
                    <button className="glass-neu p-8 flex flex-col items-center gap-4">
                       <CreditCard size={24} className="text-rose-500" />
                       <span className="text-[9px] font-bold uppercase">Billing</span>
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {isAdminMode && (
             <AdminPanel onClose={() => setIsAdminMode(false)} />
          )}
        </AnimatePresence>
      </main>

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

      <MobileNav active={mobileTab} set={(s) => {
        if (s === 'profile' && !user) {
          setIsAuthModalOpen(true);
        } else {
          setMobileTab(s);
        }
      }} />
    </div>
  );
}

const Home = ({ ...props }) => <Layout {...props} />;
