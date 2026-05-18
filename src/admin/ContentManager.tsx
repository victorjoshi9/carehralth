import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ChevronRight, 
  Database,
  Search,
  Layout,
  Layers,
  Users,
  MessageSquare,
  Activity
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

interface ContentManagerProps {
  collectionName: string;
  title: string;
  schema: any;
}

const ContentManager = ({ collectionName, title, schema }: ContentManagerProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [collectionName]);

  const handleSave = async (id?: string) => {
    try {
      if (id) {
        await updateDoc(doc(db, collectionName, id), formData);
        setIsEditing(null);
      } else {
        const newDocRef = doc(collection(db, collectionName));
        await setDoc(newDocRef, {
          ...formData,
          createdAt: new Date().toISOString(),
          order: items.length
        });
        setIsAdding(false);
      }
      setFormData({});
    } catch (err) {
      console.error("Error saving doc:", err);
      alert("Permission denied or validation failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Confirm decommissioning of this ${collectionName} unit?`)) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  const startEdit = (item: any) => {
    setFormData(item);
    setIsEditing(item.id);
    setIsAdding(false);
  };

  const filteredItems = items.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-5xl font-display font-medium text-slate-900 tracking-tighter uppercase">{title}</h2>
          <p className="text-slate-400 font-light text-sm uppercase tracking-widest mt-2">{collectionName} units deployment manager</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-neu px-6 py-3 bg-white/40 border-white/60 flex items-center gap-4">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter units..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest text-slate-700 w-32" 
            />
          </div>
          <button 
            onClick={() => { setIsAdding(true); setFormData({}); setIsEditing(null); }}
            className="glass-neu-red px-8 py-3 !rounded-2xl shadow-xl flex items-center gap-3 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="text-[11px] font-bold uppercase tracking-widest">New Unit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unit List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-neu p-6 lg:p-8 flex items-center justify-between transition-all group ${isEditing === item.id ? 'bg-white shadow-2xl border-rose-200' : 'bg-white/40 border-white/60'}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 glass-neu-red flex items-center justify-center text-white scale-90 shrink-0">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{item.title || item.name || item.id}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">
                      ID: {item.id.substring(0, 8)}... | Order: {item.order || 0}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="p-3 glass-neu text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-xl">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-3 glass-neu text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredItems.length === 0 && (
            <div className="p-20 text-center glass-neu bg-slate-50 opacity-40">
               <Activity size={40} className="mx-auto mb-4" />
               <p className="text-[10px] font-bold uppercase tracking-widest">No matching units found</p>
            </div>
          )}
        </div>

        {/* Editor Side */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {(isEditing || isAdding) ? (
              <motion.div
                key={isEditing || 'adding'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-neu p-8 lg:p-12 bg-white shadow-3xl border-white sticky top-8"
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-display font-medium text-slate-900 tracking-tighter uppercase">
                      {isEditing ? 'Sync Parameters' : 'Deploy New Unit'}
                    </h3>
                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1">Manual Bypass Active</p>
                  </div>
                  <button onClick={() => { setIsEditing(null); setIsAdding(false); }} className="p-2 text-slate-400 hover:text-slate-900">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.keys(schema).map((key) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{key}</label>
                      {schema[key].type === 'textarea' ? (
                        <textarea 
                          className="w-full bg-slate-50 border border-slate-100/50 p-4 rounded-2xl text-slate-900 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all placeholder:opacity-30 min-h-[120px]"
                          placeholder={`Enter ${key}...`}
                          value={formData[key] || ''}
                          onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                        />
                      ) : schema[key].type === 'boolean' ? (
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
                            className={`w-14 h-8 rounded-full transition-all relative ${formData[key] ? 'bg-rose-500' : 'bg-slate-200'}`}
                          >
                             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData[key] ? 'left-7' : 'left-1'}`} />
                          </button>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                             {formData[key] ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ) : schema[key].type === 'number' ? (
                        <input 
                          type="number"
                          className="w-full bg-slate-50 border border-slate-100/50 p-4 rounded-2xl text-slate-900 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all placeholder:opacity-30"
                          placeholder={`Enter ${key}...`}
                          value={formData[key] === undefined ? '' : formData[formData[key]]}
                          onChange={e => setFormData({ ...formData, [key]: Number(e.target.value) })}
                        />
                      ) : (
                        <input 
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100/50 p-4 rounded-2xl text-slate-900 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all placeholder:opacity-30"
                          placeholder={`Enter ${key}...`}
                          value={formData[key] || ''}
                          onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => handleSave(isEditing || undefined)}
                    className="glass-neu-red w-full !py-5 mt-10 shadow-2xl flex items-center justify-center gap-4 group"
                  >
                    <Save size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Commit to Nexus</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-neu p-12 bg-white/20 border-white/40 border-dashed text-center h-full min-h-[500px] flex flex-col items-center justify-center">
                 <div className="w-20 h-20 glass-neu-red bg-rose-500/5 !text-rose-500/20 flex items-center justify-center rounded-3xl mb-8">
                    <Layout size={40} />
                 </div>
                 <h3 className="text-xl font-display font-medium text-slate-400 uppercase tracking-widest">Awaiting Command</h3>
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-4">Select a unit to modify its parameters</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
