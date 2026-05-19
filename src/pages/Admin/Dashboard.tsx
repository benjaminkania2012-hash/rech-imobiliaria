import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, 
  TrendingUp, Home as HomeIcon, CheckCircle2, 
  Clock, LogOut, ChevronRight, LayoutDashboard,
  Building2, Users, BarChart3, Settings, HelpCircle,
  MoreVertical, Eye, Heart, SlidersHorizontal, ChevronLeft,
  Bell, MessageSquare, Star, User, MousePointer2, Phone,
  ArrowUpRight, ArrowDownRight, Calendar, Filter, Download,
  Mail, Shield, Globe, Camera, Save, Key, Palette, Moon, Sun,
  BadgeCheck, MapPin, Briefcase, Menu, X
} from 'lucide-react';
import { supabase, type Property } from '../../lib/supabase';
import { demoService } from '../../lib/demo';
import { formatPrice, cn } from '../../lib/utils';

// --- MOCK DATA FOR ANALYTICS ---
const ACTIVITY_LOG = [];

// --- HELPER COMPONENTS ---
const Sparkline = ({ color }: { color: string }) => (
  <svg className="w-20 h-8 opacity-50" viewBox="0 0 100 40" fill="none">
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      d="M0 30 Q 10 10, 20 25 T 40 15 T 60 35 T 80 10 T 100 25"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('geral');
  const [isSidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 1024 : true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [darkMode, setDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Settings State
  const [settings, setSettings] = useState({
    siteName: 'RECH Negócios Imobiliários',
    whatsapp: '5511999999999',
    email: 'contato@rech.com.br',
    brokerName: 'Corretor Rech',
    autoReply: true,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/rech-admin'); return; }
        setUserEmail(session.user.email || '');
        await fetchProperties();
        setAuthLoading(false);
      } catch (err) {
        navigate('/rech-admin');
      }
    }

    async function fetchProperties() {
      try {
        const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setProperties(data || []);
      } finally { setLoading(false); }
    }
    checkUser();
  }, [navigate]);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      alert('Erro ao excluir imóvel.');
    }
  }

  async function toggleFeatured(property: Property) {
    const newFeatured = !property.featured;
    try {
      const { error } = await supabase.from('properties').update({ featured: newFeatured }).eq('id', property.id);
      if (error) throw error;
      setProperties(properties.map(p => p.id === property.id ? { ...p, featured: newFeatured } : p));
    } catch (err) {
      alert('Erro ao atualizar destaque.');
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/rech-admin');
  };

  const handleSaveSettings = async () => {
    if (activeTab === 'seguranca') {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) {
        alert(`Erro ao atualizar senha: ${error.message}`);
      } else {
        alert('Senha atualizada com sucesso!');
        setPasswordData({ newPassword: '', confirmPassword: '' });
      }
      return;
    }

    alert('Configurações salvas com sucesso!');
  };

  const stats = [
    { label: 'Imóveis Ativos', value: properties.length, trend: '0%', up: true, color: '#051C39', icon: Building2 },
    { label: 'Visualizações', value: '0', trend: '0%', up: true, color: '#8B5CF6', icon: Eye },
    { label: 'Conversões', value: '0', trend: '0%', up: true, color: '#D97706', icon: MousePointer2 },
  ];

  const handleExportCSV = () => {
    if (properties.length === 0) {
      alert('Nenhum imóvel para exportar.');
      return;
    }

    const headers = ['ID', 'Título', 'Cidade', 'Bairro', 'Tipo', 'Preço', 'Área', 'Dormitórios', 'Banheiros', 'Status', 'Visualizações'];
    const csvRows = [
      headers.join(','),
      ...properties.map(p => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.city}"`,
        `"${p.neighborhood}"`,
        p.type,
        p.price,
        p.area,
        p.bedrooms,
        p.bathrooms,
        p.status,
        p.views || 0
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-imoveis-rech-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) return <div className="h-screen bg-navy-950 flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full" /></div>;

  return (
    <div className={cn(
      "min-h-screen flex selection:bg-gold-500 selection:text-white transition-colors duration-500",
      darkMode ? "bg-navy-950" : "bg-navy-50/50"
    )}>
      {/* SIDEBAR - Linear Style */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isMobile ? (isSidebarOpen ? 280 : 0) : (isSidebarOpen ? 280 : 88),
          x: isMobile && !isSidebarOpen ? -280 : 0
        }}
        className={cn(
          "bg-navy-900 h-screen fixed left-0 top-0 z-[60] flex flex-col border-r border-white/5 shadow-2xl overflow-hidden",
          isMobile && "z-[70]"
        )}
      >
        <div className="p-6 flex items-center justify-between h-32 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-white/10 shadow-lg">
               <img src="/logo-rech.png.png" alt="RECH" className="w-full h-full object-contain p-2" />
            </div>
            {(isSidebarOpen || !isMobile) && <span className="font-black text-white text-2xl tracking-tighter uppercase truncate">RECH</span>}
          </div>
          {isMobile && isSidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-white/50 hover:text-white">
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scroll-hide">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'imoveis', label: 'Imóveis', icon: Building2 },
              { id: 'add', label: 'Adicionar Imóvel', icon: Plus, link: '/rech-admin/add' },
              { id: 'config', label: 'Configurações', icon: Settings },
            ].map((item) => (
              item.link ? (
                <Link 
                  key={item.id} 
                  to={item.link}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-white/50 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <item.icon size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              ) : (
                <button 
                  key={item.id} 
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all relative group",
                    activeView === item.id ? "bg-white text-navy-900" : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    </>
                  )}
                </button>
              )
            ))}
        </nav>

        <div className="p-4 mt-auto">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all group"
           >
             <LogOut size={20} className="shrink-0 group-hover:translate-x-1 transition-transform" />
             {isSidebarOpen && <span>Encerrar Sessão</span>}
           </button>
        </div>
      </motion.aside>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-[65]"
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen w-full",
        !isMobile ? (isSidebarOpen ? "ml-[280px]" : "ml-[88px]") : "ml-0"
      )}>
        {/* TOP HEADER - Glassmorphism */}
        <header className={cn(
          "h-20 lg:h-24 px-4 lg:px-12 ios-blur border-b sticky top-0 z-40 flex items-center justify-between transition-colors duration-500",
          darkMode ? "bg-navy-900/50 border-white/5" : "bg-white/50 border-navy-100/30"
        )}>
           <div className="flex items-center gap-8 flex-1">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  darkMode ? "bg-white/5 text-white" : "bg-navy-50 text-navy-900"
                )}
              >
                 {!isSidebarOpen || isMobile ? <Menu size={20} /> : <ChevronLeft size={20} className="transition-transform duration-500" />}
              </button>
              <div className="relative w-full max-w-md hidden md:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" size={18} />
                 <input 
                   type="text" 
                   placeholder="Procurar imóveis ou ativos..."
                   className={cn(
                     "w-full pl-12 pr-4 py-3 rounded-2xl outline-none transition-all text-sm font-medium",
                     darkMode ? "bg-white/5 focus:bg-white/10 text-white" : "bg-navy-50/50 focus:bg-white text-navy-900"
                   )}
                 />
              </div>
           </div>

           <div className="flex items-center gap-6">
              <Link to="/" className={cn(
                "hidden sm:flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all group mr-4",
                darkMode ? "text-white/40 hover:text-white" : "text-navy-400 hover:text-navy-900"
              )}>
                 Ver Site
                 <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-2">
                 <button className={cn(
                   "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative",
                   darkMode ? "bg-white/5 border-white/10 text-white/40 hover:text-white" : "bg-white border-navy-100 text-navy-400 hover:text-navy-900"
                 )}>
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full" />
                 </button>
                 <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={cn(
                   "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                   darkMode ? "bg-gold-500 text-white" : "bg-navy-900 text-white"
                 )}>
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                 </button>
              </div>
              
              <div className="h-10 w-px bg-navy-100 opacity-20" />

              <div className="flex items-center gap-4 group cursor-pointer pl-2">
                 <div className="text-right hidden sm:block">
                    <p className={cn("text-sm font-black leading-tight", darkMode ? "text-white" : "text-navy-900")}>Olá!</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center border-2 border-white shadow-xl shadow-navy-900/5 text-navy-300">
                    <User size={24} />
                 </div>
              </div>
           </div>
        </header>

        {/* DASHBOARD VIEWS */}
        <div className="p-4 lg:p-12 space-y-8 lg:space-y-12 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div 
                key="dash"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Greeting & Quick Action */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6">
                   <div className="space-y-1">
                      <h1 className={cn("text-3xl md:text-4xl font-black tracking-tighter", darkMode ? "text-white" : "text-navy-900")}>Visão Geral.</h1>
                      <p className={cn("text-sm", darkMode ? "text-white/40" : "text-navy-400")}>Aqui está o que está acontecendo com sua carteira hoje.</p>
                   </div>
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        onClick={handleExportCSV}
                        className={cn(
                          "flex-1 sm:flex-none px-4 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all text-sm",
                          darkMode 
                            ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                            : "bg-white border-navy-200 text-navy-900 hover:bg-navy-50 shadow-sm"
                        )}
                      >
                         <Download size={18} className={darkMode ? "text-white" : "text-navy-400"} /> Relatórios
                      </button>
                      <Link to="/rech-admin/add" className="btn-primary flex-1 sm:flex-none px-6 py-4 flex items-center justify-center gap-2 text-sm">
                         <Plus size={20} /> Novo Anúncio
                      </Link>
                   </div>
                </div>

                {/* Stats Grid - Apple Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                   {stats.map((stat, i) => (
                     <motion.div 
                       key={i}
                       whileHover={{ y: -5, scale: 1.02 }}
                       className={cn(
                         "premium-card p-6 lg:p-8 flex flex-col gap-4 lg:gap-8 group transition-colors duration-500",
                         darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                       )}
                     >
                        <div className="flex items-center justify-between">
                           <div className={cn(
                             "w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center transition-all",
                                                           darkMode ? "bg-white/10 text-white" : "bg-navy-900 text-white"

                           )}>
                              <stat.icon size={20} className="lg:w-6 lg:h-6" />
                           </div>
                           <Sparkline color={stat.color} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-navy-300 uppercase tracking-widest">{stat.label}</p>
                           <div className="flex items-end gap-2 lg:gap-3">
                              <span className={cn("text-3xl lg:text-4xl font-black tracking-tighter", darkMode ? "text-white" : "text-navy-900")}>{stat.value}</span>
                              <span className={cn(
                                "flex items-center text-[10px] font-black px-2 py-1 rounded-lg mb-1",
                                stat.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                              )}>
                                 {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                 {stat.trend}
                              </span>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>

                {/* Second Row: Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center justify-between">
                         <h2 className={cn("text-2xl font-black tracking-tighter", darkMode ? "text-white" : "text-navy-900")}>Resumo de Atividades</h2>
                      </div>
                      <div className={cn(
                        "premium-card p-12 flex flex-col items-center justify-center text-center space-y-4",
                        darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                      )}>
                         <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-200">
                            <Clock size={32} />
                         </div>
                         <p className={darkMode ? "text-white/40" : "text-navy-400"}>As atividades recentes aparecerão aqui conforme você gerencia seus ativos.</p>
                      </div>
                   </div>

                   {/* Activity Timeline */}
                   <div className="space-y-6">
                      <h2 className={cn("text-2xl font-black tracking-tighter", darkMode ? "text-white" : "text-navy-900")}>Atividade Recente</h2>
                      <div className={cn(
                        "premium-card p-8 space-y-8",
                        darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                      )}>
                         <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                            <Clock size={32} className={cn("mb-2", darkMode ? "text-white" : "text-navy-900")} />
                            <p className={cn("text-xs font-bold uppercase tracking-widest", darkMode ? "text-white" : "text-navy-900")}>Nenhuma atividade registrada</p>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeView === 'imoveis' && (
              <motion.div 
                key="imoveis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                 <div className="flex items-center justify-between">
                    <h1 className={cn("text-4xl font-black tracking-tighter", darkMode ? "text-white" : "text-navy-900")}>Gerenciar Portfólio.</h1>
                    <Link to="/rech-admin/add" className="btn-primary px-8 flex items-center gap-2">
                       <Plus size={20} /> Novo Anúncio
                    </Link>
                 </div>

                 {/* Filters Bar */}
                 <div className={cn(
                   "premium-card p-4 flex items-center gap-6",
                   darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                 )}>
                    <div className="flex-1 relative">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-300" size={20} />
                       <input 
                         type="text" 
                         placeholder="Buscar por ID, endereço, nome..."
                         className={cn(
                           "w-full pl-14 pr-6 py-4 bg-transparent outline-none text-sm font-bold placeholder:text-navy-200",
                           darkMode ? "text-white" : "text-navy-900"
                         )}
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                 </div>

                 {/* Properties Table */}
                 <div className={cn(
                   "premium-card overflow-hidden shadow-2xl shadow-navy-900/5",
                   darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                 )}>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className={darkMode ? "bg-white/5" : "bg-navy-50/30"}>
                                <th className="px-10 py-6 text-[10px] font-black text-navy-300 uppercase tracking-widest">Imóvel</th>
                                <th className="px-10 py-6 text-[10px] font-black text-navy-300 uppercase tracking-widest text-center">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-navy-300 uppercase tracking-widest text-center">Negócio</th>
                                <th className="px-10 py-6 text-[10px] font-black text-navy-300 uppercase tracking-widest">Valor</th>
                                <th className="px-10 py-6 text-[10px] font-black text-navy-300 uppercase tracking-widest text-center">Views</th>
                                <th className="px-10 py-6 text-[10px] font-black text-navy-300 uppercase tracking-widest text-right">Ações</th>
                             </tr>
                          </thead>
                          <tbody className={cn("divide-y", darkMode ? "divide-white/5" : "divide-navy-50")}>
                             {properties.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                               <tr key={p.id} className={cn("transition-colors group", darkMode ? "hover:bg-white/5" : "hover:bg-navy-50/20")}>
                                  <td className="px-10 py-8">
                                     <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                                           <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div>
                                           <p className={cn("text-lg font-black", darkMode ? "text-white" : "text-navy-900")}>{p.title}</p>
                                           <p className="text-xs font-bold text-navy-300 uppercase tracking-widest mt-1">{p.city} • {p.area}m²</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-10 py-8 text-center">
                                     <span className={cn(
                                       "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2",
                                       p.status === 'available' ? (darkMode ? "bg-white/10 text-white" : "bg-navy-50 text-navy-900") : "bg-amber-50 text-amber-600"
                                     )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", p.status === 'available' ? (darkMode ? "bg-white" : "bg-navy-900") : "bg-amber-600")} />
                                        {p.status === 'available' ? 'Ativo' : 'Vendido'}
                                     </span>
                                  </td>
                                  <td className="px-10 py-8 text-center">
                                     <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg", darkMode ? "text-white/40 bg-white/5" : "text-navy-400 bg-navy-50")}>
                                        {p.category}
                                     </span>
                                  </td>
                                  <td className="px-10 py-8">
                                     <p className={cn("text-lg font-bold", darkMode ? "text-white" : "text-navy-900")}>{formatPrice(p.price)}</p>
                                  </td>
                                  <td className="px-10 py-8 text-center">
                                     <p className={cn("text-sm font-bold", darkMode ? "text-white/40" : "text-navy-400")}>{p.views || 0}</p>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                    <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all translate-x-0 lg:translate-x-4 group-hover:translate-x-0">
                                       <Link to={`/rech-admin/edit/${p.id}`} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", darkMode ? "bg-white/5 text-white hover:bg-white" : "bg-navy-50 text-navy-900 hover:bg-navy-900 hover:text-white")}>
                                          <Edit2 size={18} />
                                       </Link>
                                       <button 
                                         onClick={() => toggleFeatured(p)}
                                         className={cn(
                                           "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                           p.featured ? "bg-gold-500 text-white" : (darkMode ? "bg-white/5 text-white hover:bg-white" : "bg-navy-50 text-navy-900 hover:bg-navy-900 hover:text-white")
                                         )}
                                       >
                                          <Star size={18} fill={p.featured ? "white" : "none"} />
                                       </button>
                                       <button 
                                         onClick={() => handleDelete(p.id)}
                                         className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                       >
                                          <Trash2 size={18} />
                                       </button>
                                    </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeView === 'config' && (
              <motion.div 
                key="config"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 pb-20"
              >
                 <div className="flex items-center justify-between">
                    <h1 className={cn("text-4xl font-black tracking-tighter", darkMode ? "text-white" : "text-navy-900")}>Configurações Gerais.</h1>
                    <button onClick={handleSaveSettings} className="btn-primary px-8 flex items-center gap-2">
                       <Save size={20} /> Salvar Alterações
                    </button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Navigation */}
                    <div className="lg:col-span-1 space-y-4">
                       {[
                         { id: 'geral', label: 'Informações do Site', icon: Globe },
                         { id: 'contato', label: 'Contato & WhatsApp', icon: Phone },
                         { id: 'seguranca', label: 'Segurança & Senha', icon: Shield },
                         { id: 'aparencia', label: 'Personalização', icon: Palette },
                       ].map(tab => (
                         <button 
                           key={tab.id} 
                           onClick={() => setActiveTab(tab.id)}
                           className={cn(
                             "w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left shadow-sm font-bold text-sm",
                             activeTab === tab.id 
                               ? "bg-navy-900 border-navy-900 text-white" 
                               : (darkMode ? "bg-navy-900/50 border-white/5 text-white/50 hover:bg-white/5" : "bg-white border-navy-100/50 text-navy-900 hover:bg-navy-50")
                           )}
                         >
                            <tab.icon size={20} className={activeTab === tab.id ? "text-white" : "text-navy-300"} />
                            {tab.label}
                         </button>
                       ))}
                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-2">
                       <AnimatePresence mode="wait">
                          {activeTab === 'geral' && (
                            <motion.div 
                              key="geral"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className={cn(
                                "premium-card p-10 space-y-8",
                                darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                              )}
                            >
                               <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-900">
                                     <Building2 size={24} />
                                  </div>
                                  <div>
                                     <h3 className={cn("font-black uppercase tracking-tighter text-xl", darkMode ? "text-white" : "text-navy-900")}>Identidade da Imobiliária</h3>
                                     <p className="text-xs text-navy-300 font-bold uppercase tracking-widest">Informações públicas do site</p>
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 gap-6">
                                  <div className="space-y-2">
                                     <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", darkMode ? "text-white/40" : "text-navy-900")}>Nome Fantasia</label>
                                     <input 
                                       type="text" 
                                       className={cn(
                                         "w-full px-6 py-4 rounded-2xl outline-none border transition-all font-bold",
                                         darkMode ? "bg-white/5 border-white/10 text-white focus:border-white" : "bg-navy-50/50 border-navy-100/50 text-navy-900 focus:bg-white focus:border-navy-900"
                                       )}
                                       value={settings.siteName}
                                       onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", darkMode ? "text-white/40" : "text-navy-900")}>URL do Logotipo (PNG ou SVG)</label>
                                     <div className="flex gap-4">
                                        <input 
                                          type="text" 
                                          placeholder="https://sua-logo.com/logo.png"
                                          className={cn(
                                            "flex-1 px-6 py-4 rounded-2xl outline-none border transition-all font-bold",
                                            darkMode ? "bg-white/5 border-white/10 text-white focus:border-white" : "bg-navy-50/50 border-navy-100/50 text-navy-900 focus:bg-white focus:border-navy-900"
                                          )}
                                        />
                                        <button className={cn(
                                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                          darkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-navy-50 text-navy-900 hover:bg-navy-100"
                                        )}>
                                           <Camera size={20} />
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            </motion.div>
                          )}

                          {activeTab === 'contato' && (
                            <motion.div 
                              key="contato"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className={cn(
                                "premium-card p-10 space-y-8",
                                darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                              )}
                            >
                               <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-900">
                                     <Phone size={24} />
                                  </div>
                                  <div>
                                     <h3 className={cn("font-black uppercase tracking-tighter text-xl", darkMode ? "text-white" : "text-navy-900")}>Canais de Contato</h3>
                                     <p className="text-xs text-navy-300 font-bold uppercase tracking-widest">Onde os leads serão direcionados</p>
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                     <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", darkMode ? "text-white/40" : "text-navy-900")}>WhatsApp Principal</label>
                                     <input 
                                       type="text" 
                                       placeholder="5511999999999"
                                       className={cn(
                                         "w-full px-6 py-4 rounded-2xl outline-none border transition-all font-bold",
                                         darkMode ? "bg-white/5 border-white/10 text-white focus:border-white" : "bg-navy-50/50 border-navy-100/50 text-navy-900 focus:bg-white focus:border-navy-900"
                                       )}
                                       value={settings.whatsapp}
                                       onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", darkMode ? "text-white/40" : "text-navy-900")}>E-mail de Recebimento</label>
                                     <input 
                                       type="email" 
                                       placeholder="contato@rech.com.br"
                                       className={cn(
                                         "w-full px-6 py-4 rounded-2xl outline-none border transition-all font-bold",
                                         darkMode ? "bg-white/5 border-white/10 text-white focus:border-white" : "bg-navy-50/50 border-navy-100/50 text-navy-900 focus:bg-white focus:border-navy-900"
                                       )}
                                       value={settings.email}
                                       onChange={(e) => setSettings({...settings, email: e.target.value})}
                                     />
                                  </div>
                               </div>
                            </motion.div>
                          )}

                          {activeTab === 'seguranca' && (
                            <motion.div 
                              key="seguranca"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className={cn(
                                "premium-card p-10 space-y-8",
                                darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                              )}
                            >
                               <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-900">
                                     <Shield size={24} />
                                  </div>
                                  <div>
                                     <h3 className={cn("font-black uppercase tracking-tighter text-xl", darkMode ? "text-white" : "text-navy-900")}>Segurança da Conta</h3>
                                     <p className="text-xs text-navy-300 font-bold uppercase tracking-widest">Alterar credenciais de acesso</p>
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                     <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", darkMode ? "text-white/40" : "text-navy-900")}>Nova Senha</label>
                                     <input 
                                       type="password" 
                                       className={cn(
                                         "w-full px-6 py-4 rounded-2xl outline-none border transition-all font-bold",
                                         darkMode ? "bg-white/5 border-white/10 text-white focus:border-white" : "bg-navy-50/50 border-navy-100/50 text-navy-900 focus:bg-white focus:border-navy-900"
                                       )}
                                       value={passwordData.newPassword}
                                       onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", darkMode ? "text-white/40" : "text-navy-900")}>Confirmar Senha</label>
                                     <input 
                                       type="password" 
                                       className={cn(
                                         "w-full px-6 py-4 rounded-2xl outline-none border transition-all font-bold",
                                         darkMode ? "bg-white/5 border-white/10 text-white focus:border-white" : "bg-navy-50/50 border-navy-100/50 text-navy-900 focus:bg-white focus:border-navy-900"
                                       )}
                                       value={passwordData.confirmPassword}
                                       onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                     />
                                  </div>
                               </div>
                            </motion.div>
                          )}

                          {activeTab === 'aparencia' && (
                            <motion.div 
                              key="aparencia"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className={cn(
                                "premium-card p-10 space-y-8",
                                darkMode ? "bg-navy-900 border-white/5" : "bg-white border-navy-100/50"
                              )}
                            >
                               <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-900">
                                     <Palette size={24} />
                                  </div>
                                  <div>
                                     <h3 className={cn("font-black uppercase tracking-tighter text-xl", darkMode ? "text-white" : "text-navy-900")}>Personalização Visual</h3>
                                     <p className="text-xs text-navy-300 font-bold uppercase tracking-widest">Estética do painel e site</p>
                                  </div>
                               </div>

                               <div className="space-y-6">
                                  <div 
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={cn(
                                      "flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer group",
                                      darkMode ? "bg-white/5 border-white/10" : "bg-navy-50/30 border-navy-100/50 hover:bg-navy-50"
                                    )}
                                  >
                                     <div>
                                        <p className={cn("font-bold", darkMode ? "text-white" : "text-navy-900")}>Modo Premium Noturno</p>
                                        <p className="text-[10px] text-navy-300 font-bold uppercase tracking-widest">Ativar tons escuros no painel</p>
                                     </div>
                                     <div className={cn(
                                       "w-14 h-8 rounded-full relative p-1 transition-colors duration-500",
                                       darkMode ? "bg-gold-500" : "bg-navy-900"
                                     )}>
                                        <motion.div 
                                          animate={{ x: darkMode ? 24 : 0 }}
                                          className="w-6 h-6 bg-white rounded-full shadow-lg" 
                                        />
                                     </div>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
              </motion.div>
            )}

            {(activeView === 'analises' || activeView === 'mensagens') && (
               <motion.div 
                 key="coming"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
               >
                  <div className="w-32 h-32 bg-navy-50 rounded-[3rem] flex items-center justify-center text-navy-200">
                     <Clock size={64} />
                  </div>
                  <div className="space-y-2">
                     <h2 className={cn("text-4xl font-black tracking-tighter uppercase", darkMode ? "text-white" : "text-navy-900")}>Intelligence <span className="text-navy-300">Hub.</span></h2>
                     <p className={cn("font-medium max-w-sm mx-auto", darkMode ? "text-white/40" : "text-navy-400")}>Esta seção ({activeView}) está sendo integrada ao novo ecossistema RECH NEGÓCIOS.</p>
                  </div>
                  <button onClick={() => setActiveView('dashboard')} className="btn-secondary px-12 border-navy-100">Voltar ao Dashboard</button>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Helpers
function ChevronDown({ size, className }: { size: number, className?: string }) {
  return <ChevronRight size={size} className={cn("rotate-90", className)} />;
}
function SettingsIcon({ size, className }: { size: number, className?: string }) {
  return <Settings size={size} className={className} />;
}
