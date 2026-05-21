import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Move, ArrowRight, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, cn } from '../lib/utils';
import type { Property } from '../lib/supabase';

interface HeroPropertyCardProps {
  property: Property;
}

export default function HeroPropertyCard({ property }: HeroPropertyCardProps) {
  const savings = property.market_value && property.market_value > property.price 
    ? property.market_value - property.price 
    : 0;
  const discount = property.market_value && property.market_value > property.price 
    ? Math.round((savings / property.market_value) * 100) 
    : 0;

  const isCaixa = property.title?.toLowerCase().includes('caixa') || 
                  property.description?.toLowerCase().includes('caixa') ||
                  property.title?.toLowerCase().includes('leilão') ||
                  property.description?.toLowerCase().includes('leilão');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full overflow-hidden bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-navy-100/60 shadow-[0_15px_35px_-15px_rgba(5,28,57,0.08)] transition-all flex flex-col h-full"
    >
      {/* Property Image Container */}
      <Link to={`/property/${property.id}`} className="relative aspect-[16/10] w-full overflow-hidden block">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Dynamic Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {isCaixa ? (
            <span className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-navy-900/90 text-white backdrop-blur-md border border-white/10 shadow-sm">
              Imóvel Caixa
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/90 text-navy-900 backdrop-blur-md shadow-sm">
              {property.category === 'venda' ? 'Venda Direta' : property.category === 'aluguel' ? 'Aluguel' : property.category === 'permuta' ? 'Permuta' : 'Lançamento'}
            </span>
          )}

          {discount > 0 && (
            <span className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gold-500 text-white shadow-sm flex items-center gap-1.5 animate-pulse">
              <TrendingDown size={12} />
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Small floating specs overlay on the bottom left of image */}
        <div className="absolute bottom-4 left-4 px-4 py-2 bg-navy-900/70 backdrop-blur-md rounded-2xl border border-white/10 text-white flex gap-4 text-xs font-bold shadow-sm">
          <div className="flex items-center gap-1">
            <Move size={12} className="text-navy-300" />
            <span>{property.area} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed size={12} className="text-navy-300" />
            <span>{property.bedrooms} Q</span>
          </div>
        </div>
      </Link>

      {/* Property Details */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-navy-400 font-bold text-xs uppercase tracking-wider">
            <MapPin size={14} className="text-navy-300 shrink-0" />
            <span className="line-clamp-1">{property.neighborhood}, {property.city}</span>
          </div>

          <Link to={`/property/${property.id}`} className="block group/title">
            <h3 className="text-xl font-bold text-navy-900 line-clamp-1 group-hover/title:text-navy-500 transition-colors tracking-tight">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Financial Highlights */}
        <div className="mt-5 pt-4 border-t border-navy-50 flex items-end justify-between">
          <div className="space-y-1">
            {property.market_value && property.market_value > property.price ? (
              <>
                <p className="text-[10px] font-bold text-navy-300 uppercase tracking-widest leading-none">
                  Avaliação: <span className="line-through">{formatPrice(property.market_value)}</span>
                </p>
                <p className="text-2xl font-black text-navy-900 tracking-tight leading-none pt-1">
                  {formatPrice(property.price)}
                </p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest pt-1 flex items-center gap-0.5">
                  Poupança de {formatPrice(savings)}
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold text-navy-300 uppercase tracking-widest leading-none">
                  Valor do Investimento
                </p>
                <p className="text-2xl font-black text-navy-900 tracking-tight leading-none pt-1">
                  {formatPrice(property.price)}
                </p>
              </>
            )}
          </div>

          <Link
            to={`/property/${property.id}`}
            className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-900 flex items-center justify-center transition-all hover:bg-navy-900 hover:text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 shrink-0"
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
