import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Move, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, cn } from '../lib/utils';
import type { Property } from '../lib/supabase';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isAuction = property.type === 'auction';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card group"
    >
      <Link to={`/property/${property.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={cn(
            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20",
            isAuction ? "bg-navy-900/60 text-white" : "bg-white/80 text-navy-900"
          )}>
            {isAuction ? 'Leilão Judicial' : 'Venda Direta'}
          </span>
          {property.featured && (
            <span className="bg-gold-500/90 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
              Oportunidade
            </span>
          )}
        </div>

        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-navy-900/40 backdrop-blur-md flex items-center justify-center text-white transition-all hover:bg-white hover:text-red-500 shadow-lg border border-white/10 group/heart">
          <Heart size={18} className="transition-all" />
        </button>

        {/* Discount Badge if available */}
        {property.featured && (
          <div className="absolute bottom-4 right-4 bg-yellow-100/90 text-yellow-800 px-2 py-1 rounded text-[10px] font-bold">
            -15% OFF
          </div>
        )}
      </Link>

      <div className="p-8">
        <div className="space-y-4 mb-8">
          <Link to={`/property/${property.id}`}>
            <h3 className="text-2xl font-bold text-navy-900 line-clamp-1 group-hover:text-navy-700 transition-colors tracking-tight">
              {property.title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 text-navy-400 font-medium text-sm">
            <MapPin size={16} />
            <span>{property.neighborhood}, {property.city}</span>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-navy-500">
              <Move size={18} className="text-navy-300" />
              <span className="text-sm font-bold">{property.area} m²</span>
            </div>
            <div className="flex items-center gap-2 text-navy-500">
              <Bed size={18} className="text-navy-300" />
              <span className="text-sm font-bold">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-2 text-navy-500">
              <Bath size={18} className="text-navy-300" />
              <span className="text-sm font-bold">{property.bathrooms}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-navy-50">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-navy-300 uppercase tracking-widest">
              {isAuction ? 'Lance Atual' : 'Avaliação: ' + formatPrice(property.price * 1.2)}
            </p>
            <p className="text-2xl font-black text-navy-900 tracking-tight">
              {formatPrice(property.price)}
            </p>
          </div>
          
          <Link 
            to={`/property/${property.id}`}
            className="w-14 h-14 rounded-full bg-navy-900 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-navy-900/20"
          >
            <ArrowRight size={24} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
