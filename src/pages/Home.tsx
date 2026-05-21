import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, ArrowRight, ChevronDown, ShieldCheck, Award, Users, Star, CheckCircle2, History, Scale, FileCheck, Landmark, MessageCircle, Briefcase, MapPin, Bed, Bath, Move } from 'lucide-react';
import { supabase, type Property } from '../lib/supabase';
import { demoService } from '../lib/demo';
import PropertyCard from '../components/PropertyCard';
import HeroPropertyCard from '../components/HeroPropertyCard';
import { cn, formatPrice } from '../lib/utils';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../lib/blog-data';

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterNeighborhood, setFilterNeighborhood] = useState('all');
  const [filterMinPrice, setFilterMinPrice] = useState(0);
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | 'all'>('all');
  const [filterBedrooms, setFilterBedrooms] = useState<number | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('venda');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [heroCardIndex, setHeroCardIndex] = useState(0);




  // Sync state with URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const bedrooms = searchParams.get('bedrooms');
    const shouldScroll = searchParams.get('scroll');

    // Reset specific filters if they are not in URL (coming from Navbar)
    if (category || type || bedrooms) {
      setFilterCategory(category || 'all');
      setFilterType(type || 'all');
      setFilterBedrooms(bedrooms === 'all' || !bedrooms ? 'all' : Number(bedrooms));
      
      // Reset location and price filters for Navbar searches
      setFilterCity('all');
      setFilterNeighborhood('all');
      setFilterMinPrice(0);
      setFilterMaxPrice('all');
    }

    if (shouldScroll === 'true') {
      const element = document.getElementById('imoveis');
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        
        // Remove the scroll param after scrolling
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('scroll');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams]);

  const handleSearch = (filters?: any) => {
    if (filters) {
      if (filters.type) setFilterType(filters.type);
      if (filters.category) setFilterCategory(filters.category);
      if (filters.bedrooms) setFilterBedrooms(filters.bedrooms);
    }
    
    setIsSearching(true);
    const element = document.getElementById('imoveis');
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setTimeout(() => setIsSearching(false), 1000);
  };

  useEffect(() => {
    // SEO Meta and Schema
    document.title = "RECH Negócios Imobiliários | Especialistas em Imóveis Caixa";
    
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Juliano Rech - Especialista em Negócios Imobiliários",
      "image": "https://rechnegocios.com.br/juliano-rech.jpg",
      "@id": "https://rechnegocios.com.br",
      "url": "https://rechnegocios.com.br",
      "telephone": "+555499123455",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Erechim, RS",
        "addressLocality": "Erechim",
        "addressRegion": "RS",
        "postalCode": "99700-000",
        "addressCountry": "BR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -27.634,
        "longitude": -52.274
      },
      "description": "Juliano Rech é corretor de imóveis especialista em venda direta e leilões da Caixa Econômica Federal em Erechim e região. CRECI 55348/RS.",
      "sameAs": [
        "https://www.instagram.com/jrech12/",
        "https://www.facebook.com/rechnegocios"
      ],
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
        ],
        "opens": "08:30",
        "closes": "18:00"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaMarkup);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Fetch all properties once on load to populate highlights and filters
  useEffect(() => {
    async function fetchAllProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setAllProperties(data || []);
      } catch (err) {
        console.error('Error fetching all properties:', err);
      } finally {
        setAllLoading(false);
      }
    }
    fetchAllProperties();
  }, []);


  useEffect(() => {
    async function fetchProperties() {
      try {
        let query = supabase.from('properties').select('*').order('created_at', { ascending: false });
        if (filterType !== 'all') query = query.eq('type', filterType);
        if (filterCity !== 'all') query = query.eq('city', filterCity);
        if (filterNeighborhood !== 'all') query = query.eq('neighborhood', filterNeighborhood);
        if (filterMinPrice > 0) query = query.gte('price', filterMinPrice);
        if (filterMaxPrice !== 'all' && filterMaxPrice > 0) query = query.lte('price', filterMaxPrice);
        if (filterCategory !== 'all') query = query.eq('category', filterCategory);
        if (filterBedrooms !== 'all') query = query.eq('bedrooms', filterBedrooms);

        const { data, error } = await query;
        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [filterType, filterCity, filterNeighborhood, filterMinPrice, filterMaxPrice, filterCategory, filterBedrooms]);

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // Get featured properties for the Hero carousel
  const getHeroProperties = () => {
    return allProperties.filter(p => p.featured);
  };

  const heroPropertiesList = getHeroProperties();
  const activeHeroProperty = heroPropertiesList[heroCardIndex];

  useEffect(() => {
    if (heroPropertiesList.length <= 1) return;
    const interval = setInterval(() => {
      setHeroCardIndex((prev) => (prev + 1) % heroPropertiesList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroPropertiesList.length]);



  return (
    <div className="space-y-32 pb-32">
      {/* Full-Width Carousel Hero Section */}
      <section 
        className="relative pt-24 pb-8 px-6 overflow-hidden h-[calc(100vh-1rem)] min-h-[600px] flex items-center rounded-b-[4rem] mx-2 mt-2 cursor-pointer group"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button, a')) return;
          if (activeHeroProperty) navigate(`/property/${activeHeroProperty.id}`);
        }}
      >
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0 bg-navy-900 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {activeHeroProperty && (
              <motion.img
                key={activeHeroProperty.id + '-bg'}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                src={activeHeroProperty.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1920'}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
              />
            )}
          </AnimatePresence>
          {/* Deep dark overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-between h-full min-h-[500px]">
          {/* Top CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] border border-white/10 backdrop-blur-md">
                <Star size={12} className="text-gold-500 fill-gold-500 shrink-0" />
                Oportunidades em Destaque
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3.5">
              <a 
                href="https://wa.me/555499123455?text=Olá!%20Gostaria%20de%20conversar%20com%20um%20especialista%20sobre%20as%20oportunidades%20imobiliárias%20da%20Caixa." 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 bg-white text-navy-900 hover:bg-navy-50 font-bold py-2.5 px-5 rounded-xl transition-all text-sm border border-white/20"
              >
                <MessageCircle size={16} className="text-navy-900" />
                Fale com Especialista
              </a>
              <button 
                onClick={() => {
                  const element = document.getElementById('imoveis');
                  if (element) {
                    const offset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                  }
                }}
                className="btn-secondary inline-flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold py-2.5 px-5 rounded-xl transition-all text-sm backdrop-blur-md"
              >
                Ver Catálogo
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Main Carousel Content */}
          <div className="flex-1 flex items-center py-12">
            <AnimatePresence mode="wait">
              {activeHeroProperty && (
                <motion.div
                  key={activeHeroProperty.id + '-content'}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="max-w-3xl space-y-8 cursor-pointer group"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, a')) return;
                    navigate(`/property/${activeHeroProperty.id}`);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gold-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                      {activeHeroProperty.type === 'auction' ? 'Leilão' : 'Venda Direta'}
                    </span>
                    <span className="flex items-center gap-1.5 text-navy-200 text-sm font-bold bg-navy-900/40 px-3 py-1 rounded-md backdrop-blur-sm border border-white/10">
                      <MapPin size={14} className="text-navy-300" />
                      {activeHeroProperty.neighborhood}, {activeHeroProperty.city}
                    </span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">
                    {activeHeroProperty.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-white bg-navy-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-fit">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Bed size={18} className="text-navy-300" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-navy-300 font-bold">Quartos</p>
                        <p className="text-xl font-black">{activeHeroProperty.bedrooms}</p>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Bath size={18} className="text-navy-300" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-navy-300 font-bold">Banheiros</p>
                        <p className="text-xl font-black">{activeHeroProperty.bathrooms}</p>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Move size={18} className="text-navy-300" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-navy-300 font-bold">Área</p>
                        <p className="text-xl font-black">{activeHeroProperty.area}m²</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-6 pt-4">
                    <div>
                      <p className="text-sm font-bold text-navy-300 uppercase tracking-widest mb-1">
                        Valor do Investimento
                      </p>
                      <p className="text-4xl md:text-6xl font-black text-white tracking-tight">
                        {formatPrice(activeHeroProperty.price)}
                      </p>
                    </div>
                    <Link 
                      to={`/property/${activeHeroProperty.id}`}
                      className="w-16 h-16 rounded-2xl bg-gold-500 text-navy-900 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-gold-500/20 shrink-0"
                    >
                      <ArrowRight size={28} />
                    </Link>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Carousel Controls */}
          {heroPropertiesList.length > 1 && (
            <div className="flex items-center gap-4 pb-6">
              <div className="flex gap-2">
                {heroPropertiesList.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroCardIndex(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all cursor-pointer",
                      idx === heroCardIndex ? "bg-gold-500 w-8" : "bg-white/30 hover:bg-white/50 w-3"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                 <button 
                   onClick={() => setHeroCardIndex((prev) => (prev - 1 + heroPropertiesList.length) % heroPropertiesList.length)}
                   className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10"
                 >
                   <ArrowRight size={18} className="rotate-180" />
                 </button>
                 <button 
                   onClick={() => setHeroCardIndex((prev) => (prev + 1) % heroPropertiesList.length)}
                   className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10"
                 >
                   <ArrowRight size={18} />
                 </button>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Main Grid */}
      <section id="imoveis" className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-navy-900 tracking-tighter">Oportunidades <span className="text-navy-300">do Momento</span></h2>
            <p className="text-navy-400 max-w-xl font-medium">Curadoria exclusiva de ativos imobiliários com alto potencial de ROI.</p>
          </div>
          

        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="premium-card aspect-[4/5] animate-pulse bg-navy-50" />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-6">
            <div className="w-24 h-24 bg-navy-50 rounded-[2rem] flex items-center justify-center mx-auto text-navy-200">
              <Search size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-navy-900">Nenhum ativo encontrado</h3>
              <p className="text-navy-400 font-medium">Tente ajustar seus filtros de busca.</p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setFilterType('all'); }} 
              className="btn-secondary"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        )}
        
        <div className="flex justify-center pt-10">
           <button className="btn-secondary">Carregar Mais Imóveis</button>
        </div>
      </section>
      
      {/* Institutional Section - Juliano Rech */}
      <section className="max-w-7xl mx-auto px-6 space-y-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="relative group">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative z-10"
             >
               <img 
                 src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1200" 
                 className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000" 
                 alt="Juliano Rech - Corretor de Imóveis" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
               
               {/* Floating CRECI Badge */}
               <div className="absolute bottom-10 left-10 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Registro Profissional</p>
                  <p className="text-xl font-black text-white tracking-tighter mt-1">CRECI 55348/RS</p>
               </div>
             </motion.div>
             <div className="absolute -top-12 -left-12 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
             <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-navy-900/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <span className="text-gold-500 font-bold uppercase tracking-[0.3em] text-xs">Sobre Juliano Rech</span>
              <h2 className="text-5xl md:text-7xl font-black text-navy-900 tracking-tighter leading-[0.9]">
                Expertise em <br /> <span className="text-navy-300">Imóveis Caixa.</span>
              </h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-xl text-navy-900 font-bold leading-tight">
                Juliano Ramon Rech é Especialista em Negócios Imobiliários credenciado pela Caixa Econômica Federal (CEVEN).
              </p>
              <p className="text-lg text-navy-400 font-medium leading-relaxed">
                Com atuação focada em Erechim e região, Juliano consolidou sua carreira como referência absoluta em assessoria para imóveis retomados, leilões e venda direta. Sua missão é guiar investidores e famílias através das oportunidades mais lucrativas do mercado bancário com total transparência e segurança jurídica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {[
                { icon: Landmark, title: 'Especialista Caixa', desc: 'Corretor credenciado CEVEN para assessoria completa em ativos bancários.' },
                { icon: Scale, title: 'Segurança Jurídica', desc: 'Análise técnica rigorosa de editais para garantir sua tranquilidade total.' },
                { icon: FileCheck, title: 'Assessoria 360°', desc: 'Do primeiro lance ao registro definitivo da sua nova propriedade.' },
                { icon: History, title: 'Experiência Real', desc: 'Anos de atuação dedicada exclusivamente ao mercado de leilões e retomadas.' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-all shadow-sm">
                    <item.icon size={24} />
                  </div>
                  <h4 className="font-bold text-navy-900 text-lg">{item.title}</h4>
                  <p className="text-sm text-navy-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <a 
                href="https://wa.me/555499123455" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary inline-flex items-center gap-4 px-10 py-6 text-lg"
              >
                Fale com Juliano Rech <MessageCircle size={24} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats & Credibility Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-20 border-y border-navy-50">
          {[
            { label: 'Clientes Atendidos', value: '500+', icon: Users },
            { label: 'Imóveis Negociados', value: '850+', icon: Building2 },
            { label: 'Oportunidades Caixa', value: '120+', icon: Landmark },
            { label: 'Satisfação Garantida', value: '99%', icon: Star }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-3"
            >
              <p className="text-5xl font-black text-navy-900 tracking-tighter">{stat.value}</p>
              <p className="text-xs font-bold text-navy-300 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-navy-950 py-32 px-6 rounded-[5rem] mx-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-gold-500/10 text-gold-500 text-[10px] font-black uppercase tracking-widest border border-gold-500/20">
              Diferenciais
            </span>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter">Por que escolher <br /><span className="text-navy-300">Juliano Rech?</span></h2>
            <p className="text-navy-200 font-medium text-lg">A segurança de quem domina o mercado de ativos retomados da rede bancária.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                title: 'Atendimento Próximo', 
                desc: 'Assessoria humanizada e personalizada para entender seus objetivos de investimento ou moradia.',
                icon: Users 
              },
              { 
                title: 'Especialização Caixa', 
                desc: 'Conhecimento profundo em venda direta, leilões e processos de retomada da Caixa Econômica Federal.',
                icon: Landmark 
              },
              { 
                title: 'Segurança no Processo', 
                desc: 'Transparência total e suporte jurídico para que você compre com tranquilidade e sem surpresas.',
                icon: ShieldCheck 
              }
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="ios-blur bg-white/5 border border-white/10 p-12 rounded-[3rem] space-y-6 hover:bg-white/10 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform">
                  <card.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                <p className="text-navy-200 leading-relaxed font-medium">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Trust Seals */}
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-40 pt-10 border-t border-white/5">
             {[
               { icon: CheckCircle2, text: 'CRECI Regularizado' },
               { icon: Award, text: 'Especialista Caixa' },
               { icon: ShieldCheck, text: 'Assessoria Jurídica' },
               { icon: Scale, text: 'Transparência Total' },
               { icon: Briefcase, text: 'Processo Profissional' }
             ].map((seal, i) => (
               <div key={i} className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default text-white">
                 <seal.icon size={18} />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{seal.text}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Featured Insights Preview - Inspired by Image 1 */}
      <section className="bg-navy-900 py-32 px-6 overflow-hidden relative rounded-[4rem] mx-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <span className="text-gold-500 font-bold uppercase tracking-[0.3em] text-xs">Intelligence Report</span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Insights do Mercado.</h2>
            </div>
            <Link to="/blog" className="text-white font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
              Ver Blog Completo <ArrowRight size={20} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <Link to={`/blog/${BLOG_POSTS[0].slug}`} className="lg:col-span-2 premium-card bg-navy-800 border-navy-700 aspect-video relative group cursor-pointer block overflow-hidden">
                <img src={BLOG_POSTS[0].image} className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
                <div className="absolute inset-0 p-12 flex flex-col justify-end">
                   <span className="bg-gold-500 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit mb-4">{BLOG_POSTS[0].category}</span>
                   <h3 className="text-3xl font-bold text-white mb-4">{BLOG_POSTS[0].title}</h3>
                   <p className="text-navy-200 text-sm max-w-lg">{BLOG_POSTS[0].excerpt}</p>
                </div>
             </Link>
             <div className="space-y-10">
                {BLOG_POSTS.slice(1, 3).map((post) => (
                   <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-6 group cursor-pointer">
                     <div className="w-32 h-32 rounded-3xl overflow-hidden shrink-0">
                       <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                     </div>
                     <div className="space-y-2">
                       <span className="text-gold-500 text-[10px] font-bold uppercase tracking-widest">{post.category}</span>
                       <h4 className="text-white font-bold group-hover:text-gold-500 transition-colors">
                         {post.title}
                       </h4>
                       <p className="text-navy-400 text-xs line-clamp-2 leading-relaxed">{post.excerpt}</p>
                     </div>
                   </Link>
                ))}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
