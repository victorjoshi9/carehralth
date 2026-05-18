import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Layers, 
  Image as ImageIcon, 
  Users, 
  MessageSquare, 
  Plus, 
  LogOut,
  Settings,
  ChevronLeft,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClose: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, onClose }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sections', label: 'App Sections', icon: Layers },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
    { id: 'doctors', label: 'Care Staff', icon: Users },
    { id: 'testimonials', label: 'Patient Pulse', icon: MessageSquare },
    { id: 'gallery', label: 'Facility Gallery', icon: ImageIcon },
    { id: 'preview', label: 'Live Preview', icon: Layout },
    { id: 'settings', label: 'System Config', icon: Settings },
  ];

  return (
    <div className="w-full lg:w-80 h-full glass-neu bg-white/60 border-r border-white/50 flex flex-col p-6 lg:p-10 relative">
      <div className="flex items-center justify-between mb-12 lg:mb-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass-neu-red flex items-center justify-center rounded-2xl shadow-lg">
            <Plus className="text-white w-6 h-6" strokeWidth={4} />
          </div>
          <div>
            <h1 className="text-lg font-display font-medium text-slate-900 tracking-tighter">Nexus Admin</h1>
            <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest opacity-60">Control Console v3.1</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden w-10 h-10 glass-neu flex items-center justify-center text-slate-500">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-3 lg:space-y-4">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group ${
                isActive 
                  ? 'glass-neu bg-white shadow-xl text-slate-900' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon size={22} className={isActive ? 'text-rose-600' : 'opacity-60'} />
              <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1.5 h-6 bg-rose-500 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-auto pt-10 border-t border-slate-100/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full flex items-center gap-4 px-6 py-5 glass-neu !bg-slate-900 text-white rounded-2xl shadow-2xl transition-all group"
        >
          <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Logout Hub</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
