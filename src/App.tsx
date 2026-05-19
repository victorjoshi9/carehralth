import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Plus, Heart, Zap, Stethoscope, Microscope, MapPin, 
  ChevronRight, Activity, Phone, Search, Bell, User, 
  Menu, X, ShieldCheck, Clock, Smile, Baby, Camera,
  MessageSquare, HelpCircle, Star, Settings, Layout,
  Layers, Database, Play, Thermometer, LogOut, ArrowRight,
  History, CreditCard, Wallet, Share2, Pill, Ambulance,
  UserPlus, CheckCircle2, ChevronLeft, Scissors, Home as HomeIcon,
  GraduationCap, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import firebaseConfig from '../firebase-applet-config.json';
import { collection, onSnapshot, query, orderBy, setDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { supabase } from './lib/supabase';
import NexusSpinner from './components/NexusSpinner';
import AdminPanel from './admin/AdminPanel';
import { Ambulance3D, XRayMachine3D, Lift3D } from './components/MedicalGraphics3D';
const MapComponent = lazy(() => import('./components/MapComponent').then(m => ({ default: m.MapComponent })));

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
           { icon: Layers, color: 'text-slate-400/20' }, // Represents lift
           { icon: Zap, color: 'text-yellow-500/20' },   // X-ray
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Divyam Visualizer Offline</p>
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

const GallerySection = ({ index = 0 }: { index?: number }) => {
  const galleryImages = [
    { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', title: 'Modern OT' },
    { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800', title: 'Patient Recovery' },
    { url: 'https://images.unsplash.com/photo-1581595221477-9828d54d193d?auto=format&fit=crop&q=80&w=800', title: 'Pathology Lab' },
    { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800', title: 'Advanced Imaging' },
    { url: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&q=80&w=800', title: 'Consultation Room' },
    { url: 'https://images.unsplash.com/photo-1586773860418-d3b38230fb1c?auto=format&fit=crop&q=80&w=800', title: 'Main Entrance' },
    { url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800', title: 'Dental Suite' },
    { url: 'https://images.unsplash.com/photo-1538108119102-36a4393bcaf1?auto=format&fit=crop&q=80&w=800', title: 'Maternity Ward' }
  ];

  return (
    <SectionWrapper id="gallery" title="Facility Gallery" subtitle="Take a look inside Divyam Hospital" index={index}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 px-4 lg:px-0">
        {galleryImages.map((img, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-neu aspect-square flex items-center justify-center relative group cursor-pointer border-white/40 bg-white/40 overflow-hidden"
          >
            <img 
              src={img.url} 
              alt={img.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white mb-1">Facility Node {i + 1}</div>
              <div className="text-[12px] font-bold text-rose-400 uppercase tracking-widest">{img.title}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

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
          <div className="hidden lg:flex items-center justify-center relative scale-75">
             <div className="absolute w-[500px] h-[500px] border-[20px] border-white/5 rounded-full animate-ping" />
             <Ambulance3D />
          </div>
       </div>
    </div>
  </section>
);

const DoctorCard = ({ doc, index }: { doc: any, index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: isExpanded ? 0 : -10 }}
      layout
      className={`glass-neu p-4 lg:p-12 text-center group flex flex-col items-center transition-all duration-500 mb-4 ${isExpanded ? 'col-span-2 lg:col-span-2 row-span-2 overflow-visible border-rose-200 ring-2 ring-rose-500/20' : 'cursor-pointer hover:border-rose-100'}`}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      <motion.div layout className="relative w-28 lg:w-40 h-28 lg:h-40 mb-8 lg:mb-10">
         <div className="absolute inset-[-10px] glass-neu !rounded-full !bg-rose-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
         <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white glass-glossy !p-1 shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden">
              {doc.image ? (
                <img 
                  src={doc.image} 
                  alt={doc.name} 
                  loading="lazy"
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
         {isExpanded && (
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg"
           >
             <CheckCircle2 size={14} />
           </motion.div>
         )}
      </motion.div>
      
      <motion.h4 layout className="font-display text-lg lg:text-3xl font-bold text-slate-900 leading-tight mb-2 uppercase tracking-tighter text-3d px-1">{doc.name}</motion.h4>
      <motion.p layout className="text-[10px] lg:text-[12px] font-bold uppercase text-rose-600/60 tracking-widest mb-6 opacity-80">{doc.role}</motion.p>
      
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full text-left space-y-8 mt-4 border-t border-rose-100 pt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 glass-neu flex items-center justify-center text-rose-500">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Specialization</div>
                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{doc.specialization || doc.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 glass-neu flex items-center justify-center text-rose-500">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Experience</div>
                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{doc.experience || '10+ Years'}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expert Protocol</div>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50">
                  "{doc.bio || `Dr. ${doc.name.split(' ').pop()} is a leading expert in ${doc.role}, bringing advanced clinical precision and compassionate care to Divyam Hospital.`}"
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="flex-1 glass-neu py-4 bg-white text-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest border border-rose-100 hover:bg-rose-50 transition-colors"
              >
                Retract Intel
              </button>
              <button className="flex-1 glass-neu py-4 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                Connect Node
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div layout className="w-full mt-auto">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 setIsExpanded(true);
               }}
               className="glass-neu w-full py-4 bg-slate-900/5 text-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-500 group"
             >
               <span className="flex items-center justify-center gap-2">
                 View Node Intel <Plus size={12} className="group-hover:rotate-90 transition-transform" />
               </span>
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Doctors = ({ items }: { items?: any[] }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 px-6 lg:px-0 auto-rows-min">
      {items?.map((doc, i) => (
        <DoctorCard key={i} doc={doc} index={i} />
      ))}
    </div>
  );
};

const PharmacySection = ({ items, index = 0 }: { items?: any[], index?: number }) => (
  <SectionWrapper id="pharmacy" title="Divyam Pharmacy" subtitle="24/7 Medicine Relay" index={index}>
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
          { t: 'Direct Supply', d: 'Divyam Verified', i: ShieldCheck, c: 'text-rose-500' },
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
            Real-time biometric analysis synced to your Divyam profile. Automated collection active.
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
        <div className="aspect-square glass-glossy rounded-[60px] flex items-center justify-center border border-white/10 relative group bg-white/5 overflow-visible">
          <XRayMachine3D />
          <div className="absolute top-12 left-12 p-8 glass-neu bg-white/10 backdrop-blur-3xl border border-white/20 z-20">
             <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Live Sync</div>
             <div className="text-2xl font-display font-medium">99.8% Precision</div>
          </div>
        </div>
      </div>
    </div>
  </SectionWrapper>
);

const MissionVision = () => (
  <section className="section-width py-24 relative overflow-hidden bg-slate-900 rounded-[60px] my-24 border border-white/5">
    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent" />
    <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center px-10 lg:px-24">
      <div>
         <div className="w-16 h-16 glass-neu-red flex items-center justify-center mb-8">
            <Heart size={32} className="text-white" />
         </div>
         <h2 className="text-4xl lg:text-6xl font-display font-bold text-white uppercase tracking-tighter mb-8 italic">Our Mission</h2>
         <p className="text-xl text-slate-400 font-light leading-relaxed">
            To deliver accessible, affordable, and high-quality healthcare services with a patient-centric approach, ensuring comfort, dignity, and healing for all.
         </p>
      </div>
      <div>
         <div className="w-16 h-16 glass-neu !bg-blue-500/20 flex items-center justify-center mb-8 !border-blue-500/30">
            <ShieldCheck size={32} className="text-blue-400" />
         </div>
         <h2 className="text-4xl lg:text-6xl font-display font-bold text-white uppercase tracking-tighter mb-8 italic">Our Vision</h2>
         <p className="text-xl text-slate-400 font-light leading-relaxed">
            To become the most trusted healthcare destination in the region, recognized for clinical excellence, innovative treatments, and compassionate care.
         </p>
      </div>
    </div>
  </section>
);

const ComprehensiveServices = () => {
  const services = [
    { title: '24-Hour Services', items: ['Dialysis', 'Sample Collection', 'In-House Consultants', 'Emergency Service', 'ECG Service', 'Centralized Oxygen', 'Pharmacy'] },
    { title: 'Treatment Services', items: ['Viral Fever', 'Chickenpox', 'Diarrhea', 'Malaria', 'Typhoid', 'Dengue', 'Infectious Disease', 'Chronic Management'] },
    { title: 'Pediatric Services', items: ['Child Immunization', 'Vaccination', 'Newborn Care', 'Adolescent Health', 'Pediatric Emergency', 'Growth Monitoring'] },
    { title: 'Specialized Tech', items: ['Modular OT', 'NICU/PICU', 'Digital X-Ray', 'Ultrasound', '24h ECG', 'Pathology Lab'] }
  ];

  return (
    <SectionWrapper id="services" title="Divyam Care" subtitle="Comprehensive Medical Streams" index={8}>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 lg:px-0">
        {services.map((cat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-neu p-8 bg-white/40 border-white/60 hover:border-rose-200 transition-colors group"
          >
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-6 border-b border-rose-100 pb-2">{cat.title}</div>
            <ul className="space-y-4">
              {cat.items.map((item, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500/40 group-hover:bg-rose-500 transition-colors" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

const StaffSection = ({ items, index = 0 }: { items?: any[], index?: number }) => (
  <SectionWrapper id="staff" title="Care Staff" subtitle="The dedicated medical team at Divyam" index={index}>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-10 px-6 lg:px-0">
      {items?.map((staff, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ y: -12, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-neu p-4 lg:p-12 text-center flex flex-col items-center group cursor-pointer"
        >
          <div className="w-16 h-16 lg:w-24 lg:h-24 bg-rose-50 rounded-full mb-6 lg:mb-8 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 glass-neu !shadow-sm">
            <User size={36} />
          </div>
          <h5 className="font-bold text-slate-800 text-sm lg:text-lg whitespace-nowrap uppercase tracking-tight">{staff.name}</h5>
          <p className="text-[8px] lg:text-[10px] font-bold text-rose-600/60 uppercase tracking-[0.2em] mt-2">{staff.role}</p>
          <div className="mt-4 px-4 py-1.5 glass-glossy rounded-full text-[7px] lg:text-[9px] font-bold text-rose-600 uppercase tracking-widest">
             {staff.dept}
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
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]); // Moves slower than scroll for depth
  const textY = useTransform(scrollY, [0, 1000], [0, -150]); // Moves up faster for counter-parallax
  const opacity = useTransform(scrollY, [0, 500], [0.05, 0]); // Fade out as it leaves view

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
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-x-0 top-0 h-screen pointer-events-none"
      >
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M0,500 Q250,200 500,500 T1000,500" fill="none" stroke="#ef4444" strokeWidth="20" className="animated-stroke" />
        </svg>
      </motion.div>

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
                 <span className="text-[8px] lg:text-[10px] font-bold text-rose-500 uppercase tracking-[0.4em]">Divyam Core Active</span>
              </div>
            </div>

            <motion.div 
              style={{ y: textY }}
              className="relative mb-6 lg:mb-8 h-[80px] lg:h-[180px] w-full"
            >
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
            </motion.div>

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
                     <h3 className="text-2xl lg:text-4xl font-display font-bold text-white uppercase tracking-tighter">Divyam v1.0</h3>
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
            <div className="absolute top-4 right-4 opacity-10 font-bold text-[8px] uppercase tracking-tighter">Divyam Module</div>
            
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

const Navbar = ({ onAdminClick }: { onAdminClick: () => void }) => (
  <>
    {/* Android Style Top Bar - Mobile Only */}
    <div className="android-top-bar flex lg:hidden !bg-white/40 !backdrop-blur-3xl !border-white/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 glass-neu !bg-rose-500 rounded-xl flex items-center justify-center text-white">
          <Plus size={22} strokeWidth={4} />
        </div>
        <span className="font-display font-bold text-slate-900 tracking-tight text-lg">Divyam Hospital</span>
      </div>
      <div className="flex lg:hidden items-center gap-2">
        <button onClick={onAdminClick} className="w-10 h-10 glass-neu flex items-center justify-center text-rose-500">
           <Settings size={20} />
        </button>
      </div>
    </div>

    {/* Web Header - Desktop Only */}
    <header className="hidden lg:flex fixed top-0 inset-x-0 z-50 pointer-events-none p-10 px-24">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 lg:gap-5 glass-neu px-4 lg:px-8 py-2 lg:py-4 border-white/50 shadow-2xl bg-white/60">
          <div className="w-10 h-10 lg:w-14 lg:h-14 glass-neu-red flex items-center justify-center shadow-lg !border-none">
            <Plus className="text-white w-5 h-5 lg:w-7 lg:h-7 stroke-[4px]" />
          </div>
          <div>
            <h1 className="text-sm lg:text-xl font-display font-medium leading-none text-slate-900 tracking-tighter text-3d px-1">Divyam Hospital</h1>
            <p className="text-[7px] lg:text-[9px] font-bold text-rose-500 uppercase tracking-[0.5em] mt-1 lg:mt-1.5 opacity-80">Bikaner Care v1.0</p>
          </div>
        </div>
        
        <nav className="hidden xl:flex items-center gap-12 glass-neu px-16 py-5 border-white shadow-2xl bg-white/40">
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
            className="w-10 h-10 lg:w-14 lg:h-14 glass-neu flex items-center justify-center text-slate-500 transition-all !rounded-xl lg:!rounded-2xl"
          >
            <Bell size={18} className="lg:hidden" />
            <Bell size={22} className="hidden lg:block" />
          </motion.button>
        </div>
      </div>
    </header>
  </>
);

const MobileNav = ({ active, set }: { active: string, set: (s: string) => void }) => (
  <nav className="fixed bottom-0 inset-x-0 h-20 bg-white/95 backdrop-blur-3xl z-50 flex lg:hidden items-center justify-around px-2 border-t border-rose-50 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] pb-safe">
     {[
       { id: 'home', icon: HomeIcon, label: 'Home' },
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
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        // prepend default country code (India) if none provided
        formattedPhone = '+91' + formattedPhone;
      }
      
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
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
      { id: 'hero', type: 'hero', enabled: true, order: 0, title: 'Divyam Hospital' },
      { id: 'about', type: 'about', enabled: true, order: 0.5, title: 'Medical Excellence' },
      { id: 'facilities', type: 'facilities', enabled: true, order: 1, title: 'Core Facilities', items: [
        { title: 'Critical Care (ICU)', desc: '24/7 monitoring with advanced life-support and ventilators.' },
        { title: 'NICU & PICU', desc: 'Specialized care for newborns and children with expert neonatologists.' },
        { title: 'Modular OT', desc: 'Advanced surgical environments with modular design and sterilization.' },
        { title: 'Diagnosis Lab', desc: '24/7 pathology offering CBC, Biochemistry, and Hormone analysis.' },
        { title: 'Dialysis Unit', desc: 'Modern dialysis machines with expert nephrology support 24/7.' },
        { title: 'Maternity Suite', desc: 'Safe delivery with experienced gynecologists and neonatal support.' }
      ]},
      { id: 'departments', type: 'facilities', enabled: true, order: 1.2, title: 'Specialized Centers', items: [
        { title: 'Dental Center', desc: 'Cosmetic dentistry, implants, and painless root canal treatments.' },
        { title: 'Child Development', desc: 'Growth monitoring, vaccination centre, and pediatric consultation.' },
        { title: 'Diabetic Centre', desc: 'Specialized management for blood sugar and diet consultation.' },
        { title: 'Women Wellness', desc: 'Comprehensive antenatal and gynecological health screening.' },
        { title: 'Imaging Hub', desc: 'Digital X-Ray, Ultrasound, and 24-hour ECG services.' },
        { title: 'Trauma Center', desc: '24-hour accident care with rapid response medical teams.' }
      ]},
      { id: 'pharmacy', type: 'pharmacy', enabled: true, order: 1.5, title: 'Subhman Pharmacy' },
      { id: 'labs', type: 'labs', enabled: true, order: 1.6, title: 'Laboratory Hub' },
      { id: 'doctors', type: 'doctors', enabled: true, order: 2, title: 'Expert Doctors', items: [
        { 
          name: 'Dr. M.G. Choudhary', 
          role: 'Senior Child Specialist', 
          specialization: 'MBBS, MD (Pediatrics)',
          experience: '20+ Years',
          bio: 'Professor of Pediatrics at PBM Hospital with two decades of clinical and teaching experience in neonatal care and infectious diseases.',
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400' 
        },
        { 
          name: 'Dr. Nisha Choudhary', 
          role: 'Senior Dental Surgeon', 
          specialization: 'BDS, Member Indian Dental Association (MIDA)',
          experience: '10+ Years',
          bio: 'Expert in painless dental treatments, cosmetic dentistry, and root canal therapy with a focus on preventive dental care.',
          image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400' 
        },
        { 
          name: 'Dr. Ashish Dadhich', 
          role: 'Internal Medicine', 
          specialization: 'MBBS, MD (Internal Medicine), PGDCC',
          experience: '12+ Years',
          bio: 'Specialist in diabetes management, hypertension control, and chronic disease management with over 12 years of clinical expertise.',
          image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' 
        }
      ]},
      { id: 'staff', type: 'staff', enabled: true, order: 3, title: 'Dedicated Team', items: [
        { name: 'Ramprasad Dudi', role: 'Nursing Officer', dept: 'Medical' },
        { name: 'Amit Kumar Sigar', role: 'Pharmacist', dept: 'Pharmacy' },
        { name: 'Devkishan Gedhar', role: 'Lab Technician', dept: 'Labs' },
        { name: 'Madhusudan Joshi', role: 'Receptionist', dept: 'Admin' },
        { name: 'Khusboo', role: 'Dental Assistant', dept: 'Dental' }
      ]},
      { id: 'gallery', type: 'gallery', enabled: true, order: 4, title: 'Facility Gallery' },
      { id: 'location', type: 'location', enabled: true, order: 4.5, title: 'Divyam Geocode' },
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
      <Navbar onAdminClick={() => setIsAdminMode(true)} />
      
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
              <>
                <SectionWrapper id="about" title="About Divyam" subtitle="Premier multispeciality healthcare" index={i}>
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="glass-neu p-16 rounded-[80px] aspect-square flex items-center justify-center bg-white/40 overflow-visible relative">
                       <div className="absolute inset-0 flex items-center justify-center scale-110">
                          <Lift3D />
                       </div>
                       <div className="absolute top-8 right-8 z-10 glass-glossy rounded-3xl p-4 border-white/50 bg-white/40 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Vertical Capacity <br/><span className="text-slate-400">Node Hub</span></div>
                       </div>
                    </div>
                    <div>
                      <h2 className="text-5xl lg:text-7xl font-display font-medium text-slate-900 mb-10 uppercase leading-[0.85] tracking-tighter text-3d">COMPASSIONATE <br /><span className="text-rose-500 text-3d-red">HEALING</span></h2>
                      <p className="text-xl lg:text-2xl text-slate-500 font-light leading-relaxed mb-12 opacity-80">
                        Established in July 2024, Divyam Hospital is a premier multispeciality facility in Gangashahar, Bikaner. 
                        Our mission is to deliver accessible, affordable, and high-quality healthcare with clinical excellence.
                      </p>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="glass-neu p-10 rounded-[48px] bg-white/60 group hover:bg-rose-50 transition-colors">
                           <div className="text-5xl font-display font-medium text-rose-500 text-3d-red">10+</div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 opacity-60">Total Beds</div>
                        </div>
                        <div className="glass-neu p-10 rounded-[48px] bg-white/60 group hover:bg-rose-50 transition-colors">
                           <div className="text-5xl font-display font-medium text-rose-500 text-3d-red">4.7★</div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 opacity-60">Patient Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionWrapper>
                <MissionVision />
              </>
            )}
            {section.type === 'pharmacy' && <PharmacySection index={i} />}
            {section.type === 'labs' && <LaboratorySection index={i} />}
            {section.type === 'facilities' && (
              <>
                <FacilitySection config={section} index={i} />
                {section.id === 'departments' && <ComprehensiveServices />}
              </>
            )}
            {section.type === 'doctors' && (
               <SectionWrapper id="doctors" title="Expert Doctors" subtitle="Bikaner's leading medical input" index={i}>
                  <Doctors items={section.items} />

               </SectionWrapper>
            )}
            {section.type === 'staff' && <StaffSection items={section.items} index={i} />}
            {section.type === 'gallery' && <GallerySection index={i} />}
            {section.type === 'location' && (
              <section className="section-width py-20 lg:py-32 mb-24 lg:mb-0 relative overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-10 px-4 lg:px-0">
                  <div className="lg:col-span-2 min-h-[500px] relative group overflow-hidden rounded-[40px] shadow-3xl">
                    <Suspense fallback={
                      <div className="w-full h-full glass-neu bg-rose-50/30 flex items-center justify-center">
                        <NexusSpinner />
                      </div>
                    }>
                      <MapComponent />
                    </Suspense>
                  </div>
                  <div className="glass-neu p-12 flex flex-col justify-between bg-white/60 border-white shadow-3xl">
                    <div>
                        <div className="w-16 h-16 glass-neu !bg-rose-500 rounded-[28px] flex items-center justify-center text-white mb-12 shadow-xl shadow-rose-500/30 !border-none">
                          <MapPin size={32} />
                        </div>
                        <h3 className="text-5xl font-display font-bold uppercase mb-12 leading-[0.9] tracking-tighter text-slate-900 text-3d px-1">Location <br />Tracking <br /><span className="text-rose-500 text-3d-red">Live</span></h3>
                        <div className="space-y-8">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                            <h5 className="font-bold text-slate-900 text-xl uppercase tracking-tighter">Bikaner Hub</h5>
                          </div>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60 leading-relaxed">
                            10A, Mahabalipuram, Near Sampat Place,<br />
                            NYA Bus Stand, Nokha Road, Gangashahar,<br />
                            Bikaner, Rajasthan
                          </p>
                          <div className="flex gap-8 mt-10 pt-8 border-t border-slate-100">
                            <a href="https://www.google.com/search?q=Divyam+Hospital+Bikaner" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[10px] font-bold text-rose-600 uppercase hover:text-rose-700 transition-colors">
                              <Search size={18}/> Navigation
                            </a>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
                              <Clock size={18}/> 24/7 ACTIVE
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {section.type === 'testimonials' && <TestimonialSection index={i} />}
            {section.type === 'emergency' && <EmergencyControl index={i} />}
          </React.Fragment>
        ))}

        {/* FAQ Section */}
        <SectionWrapper id="faq" title="Common Inquiries" subtitle="Frequently asked questions about Divyam" index={sections.length}>
           <div className="max-w-4xl mx-auto space-y-6 px-4 lg:px-0">
              {[
                { q: 'What services does Divyam offer?', a: 'We are a multispeciality hospital offering 24/7 ICU, NICU, Dialysis, Operation Theatre, Pharmacy, and Laboratory services.' },
                { q: 'Is emergency dispatch available 24/7?', a: 'Yes, our Bikaner unit is always active. Contact us at +91 9413912974 for immediate assistance.' },
                { q: 'How can I book an appointment?', a: 'You can book through our online portal or call our 24/7 help desk directly.' }
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
                <h3 className="text-3xl font-display font-bold text-slate-900 text-center mb-2 uppercase tracking-tighter">Divyam Login</h3>
                <p className="text-slate-500 text-center text-xs mb-10 font-bold uppercase tracking-widest opacity-60">Enter phone for patient access</p>
                
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
                <h3 className="text-3xl font-display font-bold text-slate-900 mb-8 uppercase">Divyam Register</h3>
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
                  }}>Divyam Profile</h2>
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
                    <p className="text-rose-400 font-bold text-[10px] uppercase tracking-widest">OPD Node: {profile.opd}</p>
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
                  <h2 className="text-5xl font-display font-medium tracking-tighter text-3d text-white !shadow-slate-800 uppercase">DIVYAM HOSPITAL</h2>
               </div>
               <p className="text-slate-400 text-lg max-w-sm font-light leading-relaxed mb-12 opacity-80">
                  Providing accessible, affordable, and high-quality healthcare services with a patient-centric approach in Gangashahar, Bikaner.
               </p>
               <div className="space-y-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <p>📍 10A, Mahabalipuram, Nokha Road, Bikaner</p>
                  <p>📞 +91 9413912974</p>
                  <p>⏰ Open 24 Hours | 7 Days a Week</p>
               </div>
            </div>
            {['Services', 'Centers', 'Support'].map(cat => (
               <div key={cat}>
                  <h5 className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-500 mb-10">{cat}</h5>
                  <ul className="space-y-6 text-slate-400 text-sm font-light uppercase tracking-widest opacity-60">
                     <li className="hover:text-rose-500 cursor-pointer transition-colors">Emergency ER</li>
                     <li className="hover:text-rose-500 cursor-pointer transition-colors">Digital X-Ray</li>
                     <li className="hover:text-rose-500 cursor-pointer transition-colors">24/7 Pharmacy</li>
                  </ul>
               </div>
            ))}
         </div>
         <div className="section-width border-t border-white/5 mt-24 pt-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-600">© 2026 DIVYAM HOSPITAL • BIKANER HUB • EST. JULY 2024</p>
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
