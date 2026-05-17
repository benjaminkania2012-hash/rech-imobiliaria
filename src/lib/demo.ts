import { Property } from './supabase';

const DEMO_STORAGE_KEY = 'imobipremium_demo_properties_v2';

const INITIAL_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Cobertura Duplex no Centro',
    description: 'Espetacular cobertura com vista panorâmica, acabamento em mármore e automação completa.',
    price: 2500000,
    market_value: 2800000,
    city: 'Erechim',
    neighborhood: 'Centro',
    address: 'Rua Principal, 100',
    bedrooms: 3,
    bathrooms: 4,
    parking_spots: 2,
    area: 250,
    type: 'apartment',
    status: 'available',
    category: 'venda',
    featured: true,
    images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Casa Contemporânea em Condomínio',
    description: 'Arquitetura moderna, integrando natureza e luxo em um dos melhores condomínios da região.',
    price: 3200000,
    market_value: 3500000,
    city: 'Erechim',
    neighborhood: 'Bela Vista',
    address: 'Alameda das Flores, 500',
    bedrooms: 4,
    bathrooms: 5,
    parking_spots: 4,
    area: 450,
    type: 'house',
    status: 'available',
    category: 'venda',
    featured: true,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Apartamento Executivo Aluguel',
    description: 'Pronto para morar, mobiliado com móveis sob medida de alto padrão.',
    price: 4500,
    market_value: 4500,
    city: 'Erechim',
    neighborhood: 'Centro',
    address: 'Rua do Comércio, 250',
    bedrooms: 2,
    bathrooms: 2,
    parking_spots: 1,
    area: 85,
    type: 'apartment',
    status: 'available',
    category: 'aluguel',
    featured: false,
    images: ['https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=2000'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const demoService = {
  isDemoMode: () => {
    return !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
  },

  getProperties: (): Property[] => {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(INITIAL_PROPERTIES));
      return INITIAL_PROPERTIES;
    }
    return JSON.parse(stored);
  },

  getPropertyById: (id: string): Property | undefined => {
    return demoService.getProperties().find(p => p.id === id);
  },

  saveProperty: (property: Partial<Property>) => {
    const properties = demoService.getProperties();
    if (property.id) {
      const index = properties.findIndex(p => p.id === property.id);
      if (index !== -1) {
        properties[index] = { ...properties[index], ...property, updated_at: new Date().toISOString() } as Property;
      }
    } else {
      const newProperty = {
        ...property,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Property;
      properties.unshift(newProperty);
    }
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(properties));
  },

  deleteProperty: (id: string) => {
    const properties = demoService.getProperties().filter(p => p.id !== id);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(properties));
  }
};
