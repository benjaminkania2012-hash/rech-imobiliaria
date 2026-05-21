import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Move, Car, ChevronLeft, Share2, Heart, MessageCircle, Phone, Calendar } from 'lucide-react';
import { supabase, type Property } from '../lib/supabase';
import { demoService } from '../lib/demo';
import { formatPrice, cn } from '../lib/utils';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProperty() {
      try {
        if (!id) return;
        
        const isDemoLogged = localStorage.getItem('imobi_demo_logged') === 'true';
        if (demoService.isDemoMode() || isDemoLogged) {
          const p = demoService.getPropertyById(id);
          if (p) setProperty(p);
          else throw new Error("Not found");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
        if (error) throw error;
        setProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 min-h-screen">
        <div className="h-96 bg-navy-50 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center min-h-screen">
        <h2 className="text-2xl font-bold">Imóvel não encontrado.</h2>
        <Link to="/" className="text-blue-600 underline mt-4 block">Voltar para a página inicial</Link>
      </div>
    );
  }

  const images = property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'];

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-navy-400 hover:text-navy-900 font-bold transition-colors uppercase tracking-tight group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Lista
        </Link>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-navy-100 flex items-center justify-center text-navy-400 hover:bg-navy-50 transition-all shadow-sm">
            <Share2 size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-navy-100 flex items-center justify-center text-navy-400 hover:text-red-500 hover:bg-navy-50 transition-all shadow-sm">
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 aspect-video rounded-3xl overflow-hidden shadow-2xl relative bg-slate-100"
        >
          <img 
            src={images[activeImage]} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {property.featured && (
            <span className="absolute top-6 left-6 bg-blue-600 text-white text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-xl">
              Imóvel em Destaque
            </span>
          )}
        </motion.div>
        
        <div className="lg:col-span-1 grid grid-cols-3 lg:grid-cols-1 gap-4 overflow-y-auto max-h-[500px] pr-2 scroll-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={cn(
                "aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all shadow-sm",
                activeImage === index ? "border-blue-600" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={img} className="w-full h-full object-cover" alt={`Thumb ${index}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Side: Info */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{property.type === 'house' ? 'Casa' : 'Apartamento'}</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                property.status === 'available' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {property.status === 'available' ? 'Disponível' : 'Vendido'}
              </span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-900 tracking-tight leading-tight">{property.title}</h1>
              <div className="flex items-center gap-2 text-navy-400 font-medium text-lg">
                <MapPin size={20} className="text-navy-900" />
                <span>{property.address}, {property.neighborhood}, {property.city}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-inner">
                <Bed size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quartos</p>
                <p className="font-bold text-slate-900">{property.bedrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-inner">
                <Bath size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Banheiros</p>
                <p className="font-bold text-slate-900">{property.bathrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-inner">
                <Car size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vagas</p>
                <p className="font-bold text-slate-900">{property.parking_spots}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-inner">
                <Move size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Área Total</p>
                <p className="font-bold text-slate-900">{property.area} m²</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-navy-900">Sobre o Imóvel</h3>
            <p className="text-navy-400 leading-relaxed text-lg whitespace-pre-wrap">{property.description}</p>
          </div>
        </div>

        {/* Right Side: Price Card */}
        <div className="lg:sticky lg:top-32 space-y-6">
          <div className="apple-card p-8 space-y-8 bg-white border-2 border-blue-50/50 shadow-2xl">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Valor do Investimento</p>
              <h2 className="text-4xl font-bold text-blue-600">{formatPrice(property.price)}</h2>
              {property.market_value && (
                <p className="text-sm text-slate-500 font-medium">Abaixo do valor de mercado: <span className="line-through">{formatPrice(property.market_value)}</span></p>
              )}
            </div>

            <div className="space-y-4">
               <button className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg">
                 <Phone size={20} />
                 Ligar para Corretor
               </button>
               <button className="w-full btn-secondary flex items-center justify-center gap-3 py-4 text-lg border-green-200 text-green-700 hover:bg-green-50">
                 <MessageCircle size={20} />
                 WhatsApp
               </button>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                 <img 
                   src={`https://ui-avatars.com/api/?name=Rech+Imobiliaria&background=2563eb&color=fff&bold=true`} 
                   className="w-full h-full rounded-full"
                   alt="Avatar"
                 />
              </div>
              <div>
                <p className="font-bold text-slate-900">Equipe Rech Imobiliária</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">CRECI 12345-J</p>
              </div>
            </div>
          </div>
          
          <div className="apple-card p-6 bg-slate-50/50 border-dashed border-2 border-slate-200 flex items-center gap-4 group cursor-pointer hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Agendar Visita</p>
              <p className="text-xs text-slate-500">Escolha o melhor horário para você.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
