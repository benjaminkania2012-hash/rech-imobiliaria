import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, MessageCircle, Search, Globe, Instagram, Youtube, User, ChevronDown, SlidersHorizontal, Star, Home as HomeIcon, Menu, X, ArrowRight } from 'lucide-react';
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import PropertyForm from './pages/Admin/PropertyForm';
import { demoService } from './lib/demo';
import { cn } from './lib/utils';

import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(scrollPos > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.type) params.set('type', filters.type);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
    params.set('scroll', 'true');
    
    if (!isHome) {
      navigate(`/?${params.toString()}`);
    } else {
      setSearchParams(params);
    }
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
  };

  const navTextColor = (scrolled || !isHome) ? "text-navy-900" : "text-white";
  const navLinkColor = (scrolled || !isHome) ? "text-navy-900/70 hover:text-navy-900" : "text-white/70 hover:text-white";

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6",
      scrolled ? "py-4 bg-white shadow-lg border-b border-navy-100/20" : "py-8 bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-500">
            <img src="/logo-rech.png.png" alt="RECH" className="w-full h-full object-contain p-2" />
          </div>
          <span className={cn("font-black text-4xl tracking-tighter uppercase transition-colors duration-500", navTextColor)}>RECH</span>
        </Link>

        {/* Global Property Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {[
            { id: 'comprar', label: 'Comprar', hasMenu: true, category: 'venda' },
            { id: 'alugar', label: 'Alugar', hasMenu: true, category: 'aluguel' },
            { id: 'empreendimento', label: 'Empreendimentos', category: 'empreendimento' },
            { id: 'blog', label: 'Blog', to: '/blog' },
            { id: 'contato', label: 'Contato', isExternal: true }
          ].map((item) => (
            <div key={item.id} className="relative group">
              {item.to ? (
                <Link
                  to={item.to}
                  className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap", navLinkColor)}
                >
                  {item.label}
                </Link>
              ) : item.isExternal ? (
                <a
                  href="https://wa.me/555499123455"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap", navLinkColor)}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  onMouseEnter={() => item.hasMenu && setActiveMegaMenu(item.id)}
                  onClick={() => item.category && handleNavClick({ category: item.category })}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                    activeMegaMenu === item.id ? "bg-navy-900 text-white" : navLinkColor
                  )}
                >
                  {item.label}
                  {item.hasMenu && <ChevronDown size={14} className={cn("transition-transform", activeMegaMenu === item.id && "rotate-180")} />}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Mega Menu Portal */}
        <AnimatePresence>
          {activeMegaMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onMouseLeave={() => setActiveMegaMenu(null)}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[1000px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-navy-50 overflow-hidden z-50 p-12"
            >
              <div className="grid grid-cols-5 gap-10">
                <div className="space-y-6">
                  <button onClick={() => handleNavClick({ category: 'empreendimento' })} className="block text-left w-full text-[10px] font-black text-navy-300 hover:text-gold-500 uppercase tracking-[0.3em] transition-colors">Lançamentos</button>
                  <ul className="space-y-3">
                    {['Em construção', 'Lançamentos'].map(label => (
                      <li key={label}>
                        <button onClick={() => handleNavClick({ category: 'empreendimento' })} className="text-sm font-bold text-navy-900 hover:text-gold-500 transition-colors flex items-center gap-2 group">
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-100 group-hover:bg-gold-500 transition-colors" />
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6">
                    <h4 className="text-[10px] font-black text-navy-300 uppercase tracking-[0.3em] mb-4">Negociação</h4>
                    <button onClick={() => handleNavClick({ category: 'permuta' })} className="text-sm font-bold text-navy-900 hover:text-gold-500 transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy-100 group-hover:bg-gold-500 transition-colors" />
                      Aceita Permuta
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <button onClick={() => handleNavClick({ type: 'apartment', category: activeMegaMenu === 'comprar' ? 'venda' : 'aluguel' })} className="block text-left w-full text-[10px] font-black text-navy-300 hover:text-gold-500 uppercase tracking-[0.3em] transition-colors">Apartamentos</button>
                  <ul className="space-y-3">
                    {[
                      { label: 'Kitinetes', type: 'apartment' },
                      { label: '01 Dorm.', type: 'apartment', bedrooms: 1 },
                      { label: '02 Dorm.', type: 'apartment', bedrooms: 2 },
                      { label: '03 Dorm.', type: 'apartment', bedrooms: 3 },
                      { label: '04 Dorm.', type: 'apartment', bedrooms: 4 },
                      { label: '05 Dorm. ou +', type: 'apartment', bedrooms: 5 },
                      { label: 'Studio', type: 'apartment' },
                      { label: 'Duplex', type: 'apartment' },
                      { label: 'Coberturas', type: 'apartment' }
                    ].map(item => (
                      <li key={item.label}>
                        <button onClick={() => handleNavClick({ ...item, category: activeMegaMenu === 'comprar' ? 'venda' : 'aluguel' })} className="text-sm font-bold text-navy-900 hover:text-gold-500 transition-colors flex items-center gap-2 group text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-100 group-hover:bg-gold-500 transition-colors" />
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <button onClick={() => handleNavClick({ type: 'house', category: activeMegaMenu === 'comprar' ? 'venda' : 'aluguel' })} className="block text-left w-full text-[10px] font-black text-navy-300 hover:text-gold-500 uppercase tracking-[0.3em] transition-colors">Casas</button>
                  <ul className="space-y-3">
                    {[
                      { label: '01 Dorm.', type: 'house', bedrooms: 1 },
                      { label: '02 Dorm.', type: 'house', bedrooms: 2 },
                      { label: '03 Dorm.', type: 'house', bedrooms: 3 },
                      { label: '04 Dorm.', type: 'house', bedrooms: 4 },
                      { label: '05 Dorm. ou +', type: 'house', bedrooms: 5 }
                    ].map(item => (
                      <li key={item.label}>
                        <button onClick={() => handleNavClick({ ...item, category: activeMegaMenu === 'comprar' ? 'venda' : 'aluguel' })} className="text-sm font-bold text-navy-900 hover:text-gold-500 transition-colors flex items-center gap-2 group text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-100 group-hover:bg-gold-500 transition-colors" />
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <button onClick={() => handleNavClick({ type: 'commercial', category: activeMegaMenu === 'comprar' ? 'venda' : 'aluguel' })} className="block text-left w-full text-[10px] font-black text-navy-300 hover:text-gold-500 uppercase tracking-[0.3em] transition-colors">Comercial</button>
                  <ul className="space-y-3">
                    {[
                      'Salas Superiores', 'Salas Térreas', 'Prédios / Casas', 
                      'Negócios Diversos', 'Pavilhões', 'Ponto Comercial'
                    ].map(label => (
                      <li key={label}>
                        <button onClick={() => handleNavClick({ type: 'commercial', category: activeMegaMenu === 'comprar' ? 'venda' : 'aluguel' })} className="text-sm font-bold text-navy-900 hover:text-gold-500 transition-colors flex items-center gap-2 group text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-100 group-hover:bg-gold-500 transition-colors" />
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <button onClick={() => handleNavClick({ type: 'land', category: activeMegaMenu === 'comprar' ? 'venda' : 'aluguel' })} className="block text-left w-full text-[10px] font-black text-navy-300 hover:text-gold-500 uppercase tracking-[0.3em] transition-colors">Terrenos</button>
                  <ul className="space-y-3">
                    {[
                      'Áreas Rurais', 'Chácaras / Sítios', 'Terrenos Residenciais', 
                      'Terrenos Comerciais', 'Terreno em Condomínio', 'Loteamento'
                    ].map(label => (
                      <li key={label}>
                        <button onClick={() => handleNavClick({ type: 'land', category: activeMegaMenu === 'comprar' ? 'venda' : 'aluguel' })} className="text-sm font-bold text-navy-900 hover:text-gold-500 transition-colors flex items-center gap-2 group text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-100 group-hover:bg-gold-500 transition-colors" />
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <div className={cn(
            "hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-500",
            (scrolled || !isHome) ? "bg-navy-50/50 border-navy-100/50" : "bg-white/10 border-white/20 backdrop-blur-sm"
          )}>
            <Search className={(scrolled || !isHome) ? "text-navy-300" : "text-white/50"} size={18} />
            <input 
              type="text" 
              placeholder="Buscar..."
              className={cn(
                "bg-transparent border-none outline-none text-sm font-medium w-24 focus:w-40 transition-all placeholder:transition-colors",
                (scrolled || !isHome) ? "text-navy-900 placeholder:text-navy-300" : "text-white placeholder:text-white/50"
              )}
            />
          </div>
          <Link to="/rech-admin" className={cn(
            "hidden md:block px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all whitespace-nowrap",
            (scrolled || !isHome) ? "bg-navy-900 text-white shadow-navy-900/20 hover:bg-navy-800" : "bg-white text-navy-900 shadow-white/10 hover:bg-navy-50"
          )}>
            Portal do Corretor
          </Link>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "lg:hidden p-2 rounded-xl transition-all",
              (scrolled || !isHome) ? "text-navy-900 hover:bg-navy-50" : "text-white hover:bg-white/10"
            )}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-white lg:hidden overflow-y-auto"
          >
            <div className="p-6 space-y-8 pb-32">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center shrink-0">
                    <img src="/logo-rech.png.png" alt="RECH" className="w-8 h-8 object-contain" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter text-navy-900 uppercase">RECH</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-navy-50 rounded-xl text-navy-900">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'comprar', label: 'Comprar', icon: Building2, category: 'venda' },
                  { id: 'alugar', label: 'Alugar', icon: HomeIcon, category: 'aluguel' },
                  { id: 'permuta', label: 'Aceita Permuta', category: 'permuta', icon: SlidersHorizontal },
                  { id: 'empreendimento', label: 'Empreendimentos', category: 'empreendimento', icon: Star },
                  { id: 'blog', label: 'Blog', to: '/blog', icon: Globe }
                ].map((item) => (
                  <div key={item.id} className="space-y-2">
                    <button 
                      onClick={() => {
                        if (item.to) { 
                          navigate(item.to); 
                          setMobileMenuOpen(false); 
                        } else if (item.id === 'comprar' || item.id === 'alugar') {
                          setActiveMegaMenu(activeMegaMenu === item.id ? null : item.id);
                        } else if (item.category) {
                          handleNavClick({ category: item.category });
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 bg-navy-50 rounded-2xl font-bold text-navy-900"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className="text-navy-400" />
                        {item.label}
                      </div>
                      {(item.id === 'comprar' || item.id === 'alugar') && <ChevronDown className={cn("transition-transform", activeMegaMenu === item.id && "rotate-180")} size={18} />}
                    </button>
                    
                    <AnimatePresence>
                      {(item.id === 'comprar' || item.id === 'alugar') && activeMegaMenu === item.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-white rounded-2xl border border-navy-50"
                        >
                          <div className="p-6 space-y-8">
                            <div className="col-span-2 pb-4 border-b border-navy-50">
                              <button 
                                onClick={() => handleNavClick({ category: item.id === 'comprar' ? 'venda' : 'aluguel' })}
                                className="w-full text-left text-sm font-black text-navy-900 flex items-center justify-between"
                              >
                                Ver todos os imóveis para {item.label.toLowerCase()}
                                <ArrowRight size={16} />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <p className="text-[10px] font-black text-navy-300 uppercase tracking-widest">Apartamentos</p>
                              <ul className="space-y-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <li key={n}>
                                    <button 
                                      onClick={() => handleNavClick({ type: 'apartment', bedrooms: n, category: item.id === 'comprar' ? 'venda' : 'aluguel' })}
                                      className="text-xs font-bold text-navy-600 hover:text-navy-900"
                                    >
                                      {n === 5 ? '05 Dorm. ou +' : `0${n} Dormitórios`}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <p className="text-[10px] font-black text-navy-300 uppercase tracking-widest">Casas</p>
                              <ul className="space-y-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <li key={n}>
                                    <button 
                                      onClick={() => handleNavClick({ type: 'house', bedrooms: n, category: item.id === 'comprar' ? 'venda' : 'aluguel' })}
                                      className="text-xs font-bold text-navy-600 hover:text-navy-900"
                                    >
                                      {n === 5 ? '05 Dorm. ou +' : `0${n} Dormitórios`}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="pt-8 space-y-4">
                <a 
                  href="https://wa.me/555499123455" 
                  target="_blank" 
                  className="flex items-center justify-center gap-3 p-5 bg-navy-900 text-white rounded-2xl font-bold w-full shadow-xl shadow-navy-900/20"
                >
                  <MessageCircle size={20} />
                  Falar com Corretor
                </a>
                <Link 
                  to="/rech-admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center p-5 bg-navy-50 text-navy-900 rounded-2xl font-bold w-full"
                >
                  Acesso Restrito
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  const location = useLocation();
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const isAdmin = location.pathname.startsWith('/rech-admin');

  return (
    <div className="min-h-screen selection:bg-navy-900 selection:text-white">
      {!isAdmin && <Navbar />}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/rech-admin" element={<Login />} />
            <Route path="/rech-admin/dashboard" element={<Dashboard />} />
            <Route path="/rech-admin/add" element={<PropertyForm />} />
            <Route path="/rech-admin/edit/:id" element={<PropertyForm />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </main>
      
      {!isAdmin && (
        <footer className="bg-navy-50/50 pt-24 pb-12 px-6 border-t border-navy-100/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="col-span-1 md:col-span-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/logo-rech.png.png" alt="RECH" className="w-full h-full object-contain p-2" />
                  </div>
                  <span className="font-black text-4xl tracking-tighter text-navy-900 uppercase">RECH</span>
                </div>
                <p className="text-navy-400 text-sm leading-relaxed font-medium">
                  Negócios imobiliários com excelência e transparência. Encontre o imóvel dos seus sonhos com a RECH.
                  <br /><br />
                  <strong className="text-navy-900 block">RECH NEGÓCIOS IMOBILIÁRIOS LTDA</strong>
                  CRECI 27076J
                </p>
              </div>
              
              <div className="space-y-6 lg:pt-3">
                <h4 className="text-navy-900 font-bold tracking-tight">Links Úteis</h4>
                <ul className="space-y-4 text-sm font-medium text-navy-400">
                  <li><Link to="/" className="hover:text-navy-900 transition-colors">Início</Link></li>
                  <li><a href="#imoveis" className="hover:text-navy-900 transition-colors">Imóveis</a></li>
                  <li><Link to="/rech-admin" className="hover:text-navy-900 transition-colors">Corretor</Link></li>
                </ul>
              </div>

              <div className="space-y-6 lg:pt-3">
                <h4 className="text-navy-900 font-bold tracking-tight">Contato</h4>
                <ul className="space-y-4 text-sm font-medium text-navy-400">
                  <li className="flex items-start gap-2">
                    <MapPin size={20} className="text-navy-900 shrink-0 mt-0.5" />
                    <div className="flex flex-col items-start gap-1">
                      <span className="leading-snug">GALERIA ATMOSFERA - Av. Sete de Setembro, 345 - SALA 15 - Centro, Erechim - RS, 99700-032</span>
                      <a 
                        href="https://www.google.com/maps/dir/?api=1&destination=GALERIA+ATMOSFERA,+Av.+Sete+de+Setembro,+345+-+Centro,+Erechim+-+RS" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-navy-900 hover:text-gold-500 uppercase tracking-widest transition-colors"
                      >
                        Como chegar <ArrowRight size={12} />
                      </a>
                    </div>
                  </li>
                  <li>
                    <a href="https://wa.me/555499123455" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-navy-900 transition-colors">
                      <Phone size={18} className="text-navy-900" />
                      <span>(54) 9912-3455</span>
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-6 lg:pt-3">
                <h4 className="text-navy-900 font-bold tracking-tight text-right md:text-left">Siga-nos</h4>
                <div className="flex justify-end md:justify-start gap-3">
                   <a href="#" className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center hover:bg-navy-900 hover:text-white transition-all">
                     <Globe size={18} />
                   </a>
                    <a href="https://www.instagram.com/jrech12/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center hover:bg-navy-900 hover:text-white transition-all">
                      <Instagram size={18} />
                    </a>
                   <a href="#" className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center hover:bg-navy-900 hover:text-white transition-all">
                     <Youtube size={18} />
                   </a>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-navy-50 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-navy-300 uppercase tracking-[0.2em]">
              <p>© 2024 RECH NEGÓCIOS IMOBILIÁRIOS LTDA • CRECI 27076J. TODOS OS DIREITOS RESERVADOS.</p>
              <div className="flex items-center gap-8">
                 <button onClick={() => setLegalModal('terms')} className="hover:text-navy-900 transition-colors">Termos de Uso</button>
                 <button onClick={() => setLegalModal('privacy')} className="hover:text-navy-900 transition-colors">Política de Privacidade</button>
                 <div className="flex items-center gap-2">
                    <Globe size={14} />
                    <span>Internacional</span>
                 </div>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Legal Modal */}
      <AnimatePresence>
        {legalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegalModal(null)}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-12 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-navy-900 tracking-tighter uppercase">
                    {legalModal === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
                  </h2>
                  <button onClick={() => setLegalModal(null)} className="p-3 bg-navy-50 rounded-2xl text-navy-900 hover:bg-navy-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="h-[400px] overflow-y-auto pr-4 scroll-hide space-y-6 text-navy-600 font-medium leading-relaxed text-sm">
                  {legalModal === 'terms' ? (
                    <>
                      <p>Estes Termos de Uso regem o seu uso do site da RECH Negócios Imobiliários. Ao acessar este site, você concorda em cumprir estes termos.</p>
                      <h3 className="font-bold text-navy-900">1. Uso do Conteúdo</h3>
                      <p>Todo o conteúdo deste site, incluindo textos, imagens e logotipos, é de propriedade exclusiva da RECH ou de seus parceiros e está protegido por leis de direitos autorais.</p>
                      <h3 className="font-bold text-navy-900">2. Responsabilidade</h3>
                      <p>A RECH esforça-se para manter as informações de imóveis atualizadas, porém não garante a disponibilidade imediata ou precisão absoluta de todos os dados, que podem sofrer alterações sem aviso prévio.</p>
                      <h3 className="font-bold text-navy-900">3. Comunicação</h3>
                      <p>Ao utilizar nossos canais de contato, você concorda em fornecer informações verídicas para que possamos prestar a melhor assessoria possível.</p>
                    </>
                  ) : (
                    <>
                      <p>Sua privacidade é fundamental para nós. Esta política explica como coletamos e protegemos seus dados.</p>
                      <h3 className="font-bold text-navy-900">1. Coleta de Dados</h3>
                      <p>Coletamos informações básicas de contato (nome, e-mail, telefone) quando você solicita informações sobre um imóvel para fornecer o atendimento especializado solicitado.</p>
                      <h3 className="font-bold text-navy-900">2. Uso de Cookies</h3>
                      <p>Utilizamos cookies para melhorar sua experiência de navegação, entender como você usa nosso site e otimizar nossas ofertas imobiliárias.</p>
                      <h3 className="font-bold text-navy-900">3. Segurança</h3>
                      <p>Implementamos medidas técnicas rigorosas para garantir que seus dados não sejam acessados, alterados ou divulgados sem autorização.</p>
                      <h3 className="font-bold text-navy-900">4. Seus Direitos</h3>
                      <p>Conforme a LGPD, você tem o direito de solicitar a exclusão ou alteração de seus dados a qualquer momento através de nossos canais oficiais.</p>
                    </>
                  )}
                </div>

                <div className="pt-4">
                  <button onClick={() => setLegalModal(null)} className="w-full py-4 bg-navy-900 text-white rounded-2xl font-bold hover:bg-navy-800 transition-all">
                    Compreendo e Aceito
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
