import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Camera, 
  X, 
  ImageIcon, 
  Link as LinkIcon,
  Search,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const GalleryManager = () => {
  const [images, setImages] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newImage, setNewImage] = useState({ url: '', caption: '' });
  const [search, setSearch] = useState('');

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('order', { ascending: true });
    
    if (data) {
      setImages(data);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAdd = async () => {
    if (!newImage.url) return;
    const { error } = await supabase
      .from('gallery')
      .insert([{
        ...newImage,
        order: images.length
      }]);
    
    if (error) {
      alert("Asset deployment failed");
    } else {
      setNewImage({ url: '', caption: '' });
      setIsAdding(false);
      fetchGallery();
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Eject this visual asset?')) {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchGallery();
      }
    }
  };

  const filteredImages = images.filter(img => 
    img.caption?.toLowerCase().includes(search.toLowerCase()) || 
    img.url?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl lg:text-6xl font-display font-medium text-slate-900 tracking-tighter uppercase">Visual Assets</h2>
          <p className="text-slate-500 font-light text-lg">Facility gallery and marketing assets management.</p>
        </div>
        <div className="flex gap-4">
           <div className="glass-neu px-6 py-3 bg-white/40 border-white/60 flex items-center gap-4">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter assets..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest text-slate-700 w-32" 
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="glass-neu-red px-10 py-4 !rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <Camera size={20} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Capture Asset</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        <AnimatePresence>
          {filteredImages.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="glass-neu aspect-square bg-slate-100 overflow-hidden relative border-white/80 transition-all group-hover:shadow-3xl">
                {img.url ? (
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(img.id)}
                    className="w-14 h-14 glass-neu !bg-red-600 text-white flex items-center justify-center rounded-full hover:scale-110 transition-transform"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
              <div className="mt-4 px-2">
                <div className="text-[10px] font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{img.caption || 'Untitled Asset'}</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Node {img.id.substring(0,6)}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-0">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsAdding(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="w-full max-w-xl glass-neu bg-white p-10 lg:p-16 relative z-10 border-white shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
             >
                <div className="flex items-center justify-between mb-12">
                   <div>
                      <h3 className="text-3xl font-display font-medium text-slate-900 uppercase tracking-tighter">New Asset Deployment</h3>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2">Visual Core Integration</p>
                   </div>
                   <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-900">
                      <X size={32} />
                   </button>
                </div>

                <div className="space-y-8">
                   <div className="flex gap-4">
                      <div className="w-20 h-20 glass-neu bg-slate-50 flex items-center justify-center shrink-0 border-dashed border-rose-200">
                         {newImage.url ? <img src={newImage.url} className="w-full h-full object-cover rounded-xl" /> : <LinkIcon className="text-rose-200" />}
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Asset URL</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/..." 
                          className="w-full bg-slate-50 border border-slate-100/50 p-5 rounded-2xl text-slate-900 text-sm outline-none focus:ring-2 focus:ring-rose-500/10"
                          value={newImage.url}
                          onChange={e => setNewImage({...newImage, url: e.target.value})}
                        />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Asset Caption</label>
                      <input 
                        type="text" 
                        placeholder="ICU Interior Alpha Node" 
                        className="w-full bg-slate-50 border border-slate-100/50 p-5 rounded-2xl text-slate-900 text-sm outline-none focus:ring-2 focus:ring-rose-500/10"
                        value={newImage.caption}
                        onChange={e => setNewImage({...newImage, caption: e.target.value})}
                      />
                   </div>

                   <motion.button 
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handleAdd}
                     className="glass-neu-red w-full !py-6 mt-8 shadow-3xl flex items-center justify-center gap-4 group"
                   >
                     <Zap size={20} className="group-hover:rotate-12 transition-transform" />
                     <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Authorize Deployment</span>
                   </motion.button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryManager;
