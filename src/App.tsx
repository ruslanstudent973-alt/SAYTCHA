import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  ShoppingBag, 
  Users, 
  Megaphone, 
  Settings, 
  Send, 
  Image as ImageIcon, 
  Video, 
  X, 
  Clock, 
  Hash,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Type,
  Package,
  Calendar
} from 'lucide-react';
import axios from 'axios';

const PRESETS = [
  { title: "EDIKO KEPKA", subtitle: "Flash Sale: Doimiy chegirmalar olami!", description: "Bizning kanalda siz sevimli mahsulotlaringizni eng foydali narxlarda xarid qilishingiz mumkin. 'Flash Sale' aksiyalari – bu chegaralangan vaqt davomida amal qiladigan takliflar bo'lib, ular sizga pulingizni tejash imkonini beradi." },
  { title: "SMART SOAT", subtitle: "Yangi texnologiyalar olami!", description: "Eng so'nggi rusumdagi smart soatlar endi hamyonbop narxlarda. Sifat va kafolat bizning ustuvorligimizdir." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'orders' | 'customers' | 'broadcast' | 'settings' | 'stats'>('create');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [groupIds, setGroupIds] = useState('');
  const [productId, setProductId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [stock, setStock] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [bonusMessage, setBonusMessage] = useState('Sizga maxsus bonus taqdim etildi! 🎁\nKeyingi xaridingiz uchun 10% chegirma: BONUS10');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  
  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  
  // Settings state
  const [paymentInfo, setPaymentInfo] = useState('');

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
    if (activeTab === 'customers') {
      fetchCustomers();
    }
    if (activeTab === 'create') {
      fetchScheduled();
    }
    if (activeTab === 'stats') {
      fetchStats();
    }
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const fetchScheduled = async () => {
    try {
      const response = await axios.get('/api/scheduled');
      setScheduled(response.data.scheduled);
    } catch (err) {
      console.error('Failed to fetch scheduled:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data.customers);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const handleSendBonus = async (userId: string) => {
    if (!bonusMessage) return;
    setLoading(true);
    try {
      await axios.post('/api/customers/bonus', { userId, message: bonusMessage });
      setStatus({ type: 'success', message: 'Bonus yuborildi!' });
      setSelectedCustomer(null);
    } catch (err) {
      setStatus({ type: 'error', message: 'Bonus yuborishda xato!' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setPaymentInfo(response.data.paymentInfo);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.post('/api/orders/status', { orderId, status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/broadcast', { message: broadcastMessage });
      setStatus({ type: 'success', message: `${res.data.count} ta foydalanuvchiga yuborildi!` });
      setBroadcastMessage('');
    } catch (err) {
      setStatus({ type: 'error', message: 'Reklama yuborishda xato!' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/settings', { paymentInfo });
      setStatus({ type: 'success', message: 'Sozlamalar saqlandi!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Saqlashda xato!' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      alert("Maksimal 5 ta rasm yuklash mumkin.");
      return;
    }

    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupIds || !productId || !description || (images.length === 0 && !video)) {
      setStatus({ type: 'error', message: 'Iltimos, barcha majburiy maydonlarni to\'ldiring.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post('/api/send-post', {
        groupIds: groupIds.split(',').map(id => id.trim()),
        productId,
        title,
        subtitle,
        description,
        price,
        discountPrice,
        duration: parseInt(duration),
        stock,
        scheduledAt,
        images,
        video
      });

      if (response.data.success) {
        setStatus({ 
          type: 'success', 
          message: response.data.scheduled ? 'Postlar rejalashtirildi!' : 'Postlar muvaffaqiyatli yuborildi!' 
        });
        if (response.data.scheduled) {
          fetchScheduled();
        }
        // Reset form
        setTitle('');
        setSubtitle('');
        setProductId('');
        setDescription('');
        setPrice('');
        setDiscountPrice('');
        setStock('');
        setScheduledAt('');
        setImages([]);
        setVideo(null);
      } else {
        throw new Error(response.data.error || 'Noma\'lum xato');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: `Xato: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: any) => {
    setTitle(preset.title);
    setSubtitle(preset.subtitle);
    setDescription(preset.description);
  };

  const filteredOrders = orders.filter(order => 
    order.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans pb-24">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
        <header className="mb-6 text-center pt-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
          >
            RM SHOP
          </motion.h1>
          <p className="text-zinc-500 text-xs sm:text-sm italic">Premium Post Generator</p>
        </header>

        {activeTab === 'create' && (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5 bg-zinc-900/40 border border-zinc-800/50 p-5 sm:p-6 rounded-[2rem] backdrop-blur-md shadow-2xl"
          >
            {/* Group IDs & Product ID */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Hash size={12} /> Guruh IDlar (vergul bilan ajrating)
                </label>
                <input 
                  type="text" 
                  placeholder="-1001, -1002..."
                  value={groupIds}
                  onChange={(e) => setGroupIds(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Hash size={12} /> Mahsulot ID
                </label>
                <input 
                  type="text" 
                  placeholder="#ID-1"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <CheckCircle2 size={12} /> Shablonlar
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="whitespace-nowrap text-[11px] bg-zinc-800/50 hover:bg-zinc-700/50 px-4 py-2 rounded-full transition-all border border-zinc-700/30 active:scale-95"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Type size={12} /> Sarlavha
                </label>
                <input 
                  type="text" 
                  placeholder="EDIKO KEPKA"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Type size={12} /> Subtitr
                </label>
                <input 
                  type="text" 
                  placeholder="Flash Sale..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <Type size={12} /> Tavsif
              </label>
              <textarea 
                rows={3}
                placeholder="Tavsif yozing..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none placeholder:text-zinc-800"
              />
            </div>

            {/* Price & Discount Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <DollarSign size={12} /> Eski Narx
                </label>
                <input 
                  type="text" 
                  placeholder="30,000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <DollarSign size={12} /> Yangi Narx
                </label>
                <input 
                  type="text" 
                  placeholder="25,000"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            {/* Stock & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Package size={12} /> Ombor (soni)
                </label>
                <input 
                  type="number" 
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Clock size={12} /> Muddati (daqiqa)
                </label>
                <input 
                  type="number" 
                  placeholder="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <Calendar size={12} /> Rejalashtirish (Vaqt)
              </label>
              <input 
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-800"
              />
            </div>

            {/* Images & Video */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <ImageIcon size={12} /> Media (Maks 5 rasm + 1 video)
              </label>
              <div className="grid grid-cols-4 gap-2">
                <AnimatePresence>
                  {images.map((img, idx) => (
                    <motion.div 
                      key={`img-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 group shadow-lg"
                    >
                      <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/80 p-1.5 rounded-full shadow-xl active:scale-90"
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  ))}
                  {video && (
                    <motion.div 
                      key="video"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 group shadow-lg bg-zinc-950 flex items-center justify-center"
                    >
                      <div className="text-[10px] font-bold text-zinc-500">VIDEO</div>
                      <button 
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-1 right-1 bg-black/80 p-1.5 rounded-full shadow-xl active:scale-90"
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {images.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl hover:border-zinc-600 hover:bg-zinc-800/30 cursor-pointer transition-all active:scale-95">
                    <Plus size={20} className="text-zinc-600" />
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
                {!video && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl hover:border-zinc-600 hover:bg-zinc-800/30 cursor-pointer transition-all active:scale-95">
                    <Megaphone size={20} className="text-zinc-600" />
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {status && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium ${
                    status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.97] ${
                loading 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  {scheduledAt ? 'Postni Rejalashtirish' : 'Postni Yuborish'}
                </>
              )}
            </button>

            {/* Scheduled Posts List */}
            {scheduled.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-zinc-800/30">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Clock size={12} /> Rejalashtirilgan Postlar ({scheduled.length})
                </label>
                <div className="space-y-2">
                  {scheduled.map((p, idx) => (
                    <div key={idx} className="bg-zinc-950/50 border border-zinc-800/50 p-3 rounded-xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-white">{p.productId} - {p.title || 'Nomsiz'}</div>
                        <div className="text-[9px] text-zinc-500">{new Date(p.scheduledAt).toLocaleString()}</div>
                      </div>
                      <div className="text-[9px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                        Kutilmoqda
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.form>
        )}

        {activeTab === 'orders' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="ID yoki mijoz nomi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600"
              />
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-zinc-600">
                <div className="mb-2 flex justify-center opacity-20"><Hash size={48} /></div>
                Hech narsa topilmadi.
              </div>
            ) : (
              filteredOrders.map((order, idx) => (
                <div key={idx} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">{order.productId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      order.status === 'Bajarildi' ? 'bg-emerald-500/20 text-emerald-400' : 
                      order.status === 'Yetkazilmoqda' ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    Mijoz: <span className="text-zinc-200 font-semibold">{order.userName}</span>
                    {order.isLoyal && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 rounded-full font-bold">LOYAL</span>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Yetkazilmoqda')}
                      className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg font-bold"
                    >
                      Yetkazish
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Bajarildi')}
                      className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold"
                    >
                      Bajarildi
                    </button>
                  </div>
                  <div className="text-[10px] text-zinc-500 italic truncate bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/30">
                    {order.userLink}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'customers' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Mijozlar Bazasi</div>
            
            {/* Search Bar */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Mijoz nomi yoki username bo'yicha qidirish..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600"
              />
            </div>

            {customers.filter(c => 
              c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
              (c.username && c.username.toLowerCase().includes(customerSearchQuery.toLowerCase()))
            ).length === 0 ? (
              <div className="text-center py-20 text-zinc-600">
                <div className="mb-2 flex justify-center opacity-20"><Users size={48} /></div>
                Hozircha mijozlar yo'q.
              </div>
            ) : (
              customers.filter(c => 
                c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
                (c.username && c.username.toLowerCase().includes(customerSearchQuery.toLowerCase()))
              ).map((customer, idx) => (
                <div key={idx} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {customer.name}
                        {customer.isLoyal && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 rounded-full font-bold">LOYAL</span>}
                      </div>
                      <div className="text-[10px] text-zinc-500">@{customer.username || 'username_yoq'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-zinc-300">{customer.orderCount} ta buyurtma</div>
                      <div className="text-[10px] text-zinc-600">ID: {customer.id}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-zinc-800/30 flex justify-end">
                    <button 
                      onClick={() => setSelectedCustomer(selectedCustomer === customer.id ? null : customer.id)}
                      className="text-[10px] bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg font-bold border border-white/10 transition-all"
                    >
                      {selectedCustomer === customer.id ? 'Yopish' : 'Bonus Berish'}
                    </button>
                  </div>

                  {selectedCustomer === customer.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-2"
                    >
                      <textarea 
                        rows={3}
                        value={bonusMessage}
                        onChange={(e) => setBonusMessage(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
                      />
                      <button 
                        onClick={() => handleSendBonus(customer.id)}
                        disabled={loading}
                        className="w-full py-2 rounded-xl font-bold text-[10px] bg-amber-500 text-black hover:bg-amber-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Send size={12} /> Bonusni Yuborish
                      </button>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'broadcast' && (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleBroadcast}
            className="space-y-5 bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2rem] backdrop-blur-md shadow-2xl"
          >
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <Megaphone size={12} /> Reklama Xabari
              </label>
              <textarea 
                rows={5}
                placeholder="Barcha foydalanuvchilarga yuboriladigan xabar..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none placeholder:text-zinc-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !broadcastMessage}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-white text-black flex items-center justify-center gap-2 shadow-xl active:scale-[0.97] disabled:opacity-50"
            >
              <Send size={16} /> Reklamani Yuborish
            </button>
            {status && <div className="text-center text-xs text-zinc-400">{status.message}</div>}
          </motion.form>
        )}

        {activeTab === 'stats' && stats && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-3xl shadow-xl">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Jami Buyurtmalar</div>
                <div className="text-3xl font-bold text-white">{stats.totalOrders}</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-3xl shadow-xl">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Bajarilgan</div>
                <div className="text-3xl font-bold text-emerald-500">{stats.completedOrders}</div>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2.5rem] shadow-2xl">
              <div className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-amber-500" /> Top Mahsulotlar
              </div>
              <div className="space-y-4">
                {stats.topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        #{idx + 1}
                      </div>
                      <span className="text-sm text-zinc-200 font-medium">{p.id}</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                      {p.count} marta
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveSettings}
            className="space-y-5 bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2rem] backdrop-blur-md shadow-2xl"
          >
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <DollarSign size={12} /> To'lov Ma'lumotlari (Karta)
              </label>
              <textarea 
                rows={4}
                placeholder="💳 Karta: 8600...\n👤 Ism: ..."
                value={paymentInfo}
                onChange={(e) => setPaymentInfo(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none placeholder:text-zinc-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-white text-black flex items-center justify-center gap-2 shadow-xl active:scale-[0.97]"
            >
              <CheckCircle2 size={16} /> Sozlamalarni Saqlash
            </button>
            {status && <div className="text-center text-xs text-zinc-400">{status.message}</div>}
          </motion.form>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50 px-2 py-4 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'create' ? 'text-white' : 'text-zinc-600'}`}
        >
          <Plus size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Post</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'orders' ? 'text-white' : 'text-zinc-600'}`}
        >
          <Hash size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Buyurtma</span>
        </button>
        <button 
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'customers' ? 'text-white' : 'text-zinc-600'}`}
        >
          <Users size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Mijoz</span>
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'stats' ? 'text-white' : 'text-zinc-600'}`}
        >
          <TrendingUp size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Stat</span>
        </button>
        <button 
          onClick={() => setActiveTab('broadcast')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'broadcast' ? 'text-white' : 'text-zinc-600'}`}
        >
          <Megaphone size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Reklama</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'settings' ? 'text-white' : 'text-zinc-600'}`}
        >
          <Settings size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Sozlama</span>
        </button>
      </nav>
    </div>
  );
}
