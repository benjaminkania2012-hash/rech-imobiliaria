import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ChevronLeft, Upload, X, Save, 
  MapPin, Home as HomeIcon, Layout, DollarSign,
  Maximize, Bed, Bath, Car, Star, Trash2, 
  ArrowRight, Info, Image as ImageIcon, Check,
  Camera, Map, FileText, Settings
} from 'lucide-react';
import { supabase, type Property } from '../../lib/supabase';
import { demoService } from '../../lib/demo';
import { cn } from '../../lib/utils';

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    description: '',
    price: 0,
    market_value: 0,
    city: '',
    neighborhood: '',
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    parking_spots: 0,
    area: 0,
    type: 'house',
    status: 'available',
    category: 'venda',
    featured: false,
    images: [],
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/rech-admin'); return; }
      if (id) fetchProperty();
    }
    checkAuth();
  }, [id, navigate]);

  async function fetchProperty() {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (data) setFormData(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        const { error } = await supabase.from('properties').update(formData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('properties').insert([formData]);
        if (error) throw error;
      }
      navigate('/rech-admin/dashboard');
    } catch (err: any) {
      alert(`Erro ao salvar imóvel: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas não disponível'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Falha na conversão para WebP'));
              return;
            }
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], fileName, {
              type: "image/webp",
              lastModified: Date.now()
            });
            resolve(webpFile);
          }, 'image/webp', 0.8);
        };
        img.onerror = (error) => reject(error);
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages = [...(formData.images || [])];

    for (let i = 0; i < files.length; i++) {
      try {
        const originalFile = files[i];
        const webpFile = await convertToWebP(originalFile);
        const fileName = `${Math.random()}-${webpFile.name}`;
        
        const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, webpFile);
        
        if (uploadError) {
          alert(`Erro ao subir imagem: ${uploadError.message}`);
          console.error(uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(fileName);
          newImages.push(publicUrl);
        }
      } catch (err: any) {
        alert(`Erro ao processar imagem: ${err.message}`);
      }
    }
    setFormData(prev => ({ ...prev, images: newImages }));
    setUploading(false);
  }

  const steps = [
    { id: 1, label: 'Informações Básicas', icon: FileText },
    { id: 2, label: 'Localização & Preço', icon: Map },
    { id: 3, label: 'Especificações', icon: Settings },
    { id: 4, label: 'Galeria & Preview', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Header */}
      <div className="bg-navy-900 pt-12 pb-32 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
           <div className="flex items-center justify-between">
              <Link to="/rech-admin/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white font-bold transition-all group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/logo-rech.png.png" alt="RECH" className="w-full h-full object-contain p-2" />
                 </div>
                 <span className="text-white font-black tracking-tighter uppercase">RECH NEGÓCIOS IMOBILIÁRIOS</span>
              </div>
           </div>
           <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                 {id ? 'Editar Patrimônio.' : 'Novo Ativo.'}
              </h1>
              <p className="text-white/40 font-medium">Configure os detalhes técnicos e visuais do anúncio premium.</p>
           </div>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="max-w-5xl mx-auto -mt-20 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Navigation Steps */}
           <div className="lg:col-span-1 space-y-2">
              {steps.map((step) => (
                <button 
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all text-left",
                    activeStep === step.id 
                      ? "bg-navy-900 text-white shadow-xl shadow-navy-900/20" 
                      : "bg-white text-navy-400 hover:bg-navy-50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    activeStep === step.id ? "bg-white/10" : "bg-navy-50"
                  )}>
                     <step.icon size={16} />
                  </div>
                  <span>{step.label}</span>
                  {activeStep > step.id && <Check size={16} className="ml-auto text-green-500" />}
                </button>
              ))}
           </div>

           {/* Form Section */}
           <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-8">
                 <AnimatePresence mode="wait">
                    {activeStep === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="premium-card p-6 md:p-10 bg-white space-y-10"
                      >
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-navy-300 uppercase tracking-widest px-1">Título da Propriedade</label>
                               <input 
                                 type="text" 
                                 placeholder="Ex: Mansão Suspensa Itaim Bibi"
                                 className="w-full px-6 py-4 bg-navy-50 rounded-2xl border-2 border-transparent focus:border-navy-900 focus:bg-white transition-all outline-none font-bold text-navy-900"
                                 value={formData.title}
                                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                 required
                               />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-navy-300 uppercase tracking-widest px-1">Tipo de Imóvel</label>
                                  <select 
                                    className="w-full px-6 py-4 bg-navy-50 rounded-2xl border-2 border-transparent focus:border-navy-900 focus:bg-white transition-all outline-none font-bold text-navy-900 appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                  >
                                    <option value="house">Casa</option>
                                    <option value="apartment">Apartamento</option>
                                    <option value="land">Terreno</option>
                                    <option value="commercial">Comercial</option>
                                  </select>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-navy-300 uppercase tracking-widest px-1">Negócio</label>
                                  <select 
                                    className="w-full px-6 py-4 bg-navy-50 rounded-2xl border-2 border-transparent focus:border-navy-900 focus:bg-white transition-all outline-none font-bold text-navy-900 appearance-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                  >
                                    <option value="venda">Venda</option>
                                    <option value="aluguel">Aluguel</option>
                                    <option value="permuta">Permuta</option>
                                    <option value="empreendimento">Empreendimento</option>
                                  </select>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-navy-300 uppercase tracking-widest px-1">Status</label>
                                  <select 
                                    className="w-full px-6 py-4 bg-navy-50 rounded-2xl border-2 border-transparent focus:border-navy-900 focus:bg-white transition-all outline-none font-bold text-navy-900 appearance-none"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                  >
                                    <option value="available">Disponível</option>
                                    <option value="sold">Vendido</option>
                                    <option value="rented">Alugado</option>
                                  </select>
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-navy-300 uppercase tracking-widest px-1">Descrição Comercial</label>
                               <textarea 
                                 rows={6}
                                 placeholder="Fale sobre os acabamentos, localização e o estilo de vida..."
                                 className="w-full px-6 py-4 bg-navy-50 rounded-2xl border-2 border-transparent focus:border-navy-900 focus:bg-white transition-all outline-none font-medium text-navy-700 leading-relaxed resize-none"
                                 value={formData.description}
                                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                 required
                               />
                            </div>
                         </div>
                         <div className="flex justify-end">
                            <button type="button" onClick={() => setActiveStep(2)} className="btn-primary px-10 flex items-center gap-2">Próximo Passo <ArrowRight size={18} /></button>
                         </div>
                      </motion.div>
                    )}

                    {activeStep === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                         <div className="premium-card p-6 md:p-10 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-navy-300 uppercase tracking-widest px-1">Valor de Venda (R$)</label>
                               <input 
                                 type="number" 
                                 className="w-full px-6 py-4 bg-navy-50 rounded-2xl border-2 border-transparent focus:border-navy-900 focus:bg-white transition-all outline-none font-black text-2xl text-navy-900"
                                 value={formData.price}
                                 onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                 required
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-navy-300 uppercase tracking-widest px-1">Avaliação de Mercado</label>
                               <input 
                                 type="number" 
                                 className="w-full px-6 py-4 bg-navy-50 rounded-2xl border-2 border-transparent focus:border-navy-900 focus:bg-white transition-all outline-none font-bold text-navy-400"
                                 value={formData.market_value}
                                 onChange={(e) => setFormData({ ...formData, market_value: Number(e.target.value) })}
                               />
                            </div>
                         </div>
                         <div className="premium-card p-6 md:p-10 bg-white space-y-6">
                            <h3 className="font-black text-navy-900 flex items-center gap-2"><MapPin size={20} /> Localização Detalhada</h3>
                            <div className="grid grid-cols-2 gap-6">
                               <input type="text" placeholder="Cidade" className="w-full px-6 py-4 bg-navy-50 rounded-2xl font-bold" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                               <input type="text" placeholder="Bairro" className="w-full px-6 py-4 bg-navy-50 rounded-2xl font-bold" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} required />
                            </div>
                            <input type="text" placeholder="Endereço Completo" className="w-full px-6 py-4 bg-navy-50 rounded-2xl font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                         </div>
                         <div className="flex justify-between">
                            <button type="button" onClick={() => setActiveStep(1)} className="btn-secondary px-8">Voltar</button>
                            <button type="button" onClick={() => setActiveStep(3)} className="btn-primary px-10 flex items-center gap-2">Próximo Passo <ArrowRight size={18} /></button>
                         </div>
                      </motion.div>
                    )}

                    {activeStep === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="premium-card p-10 bg-white space-y-10"
                      >
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                               { label: 'Área (m²)', key: 'area', icon: Maximize },
                               { label: 'Dormitórios', key: 'bedrooms', icon: Bed },
                               { label: 'Banheiros', key: 'bathrooms', icon: Bath },
                               { label: 'Vagas', key: 'parking_spots', icon: Car },
                            ].map(spec => (
                              <div key={spec.key} className="space-y-2">
                                 <label className="text-[10px] font-black text-navy-300 uppercase tracking-widest">{spec.label}</label>
                                 <div className="flex items-center gap-3 px-4 py-3 bg-navy-50 rounded-xl">
                                    <spec.icon size={18} className="text-navy-300" />
                                    <input type="number" className="bg-transparent outline-none w-full font-black text-navy-900" value={formData[spec.key as keyof Property] as number} onChange={e => setFormData({...formData, [spec.key]: Number(e.target.value)})} />
                                 </div>
                              </div>
                            ))}
                         </div>
                         <div className="p-8 bg-navy-900 rounded-[2rem] flex items-center justify-between group cursor-pointer" onClick={() => setFormData({...formData, featured: !formData.featured})}>
                            <div className="space-y-1">
                               <h4 className="text-white font-bold flex items-center gap-2">
                                  <Star size={18} fill={formData.featured ? "#EAB308" : "none"} className={formData.featured ? "text-yellow-500" : "text-white/20"} />
                                  Destaque RECH NEGÓCIOS
                               </h4>
                               <p className="text-white/40 text-xs">Ativos em destaque possuem prioridade no marketplace.</p>
                            </div>
                            <div className={cn("w-12 h-6 rounded-full transition-all relative p-1", formData.featured ? "bg-gold-500" : "bg-white/10")}>
                               <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-md", formData.featured ? "translate-x-6" : "translate-x-0")} />
                            </div>
                         </div>
                         <div className="flex justify-between">
                            <button type="button" onClick={() => setActiveStep(2)} className="btn-secondary px-8">Voltar</button>
                            <button type="button" onClick={() => setActiveStep(4)} className="btn-primary px-10 flex items-center gap-2">Próximo Passo <ArrowRight size={18} /></button>
                         </div>
                      </motion.div>
                    )}

                    {activeStep === 4 && (
                      <motion.div 
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                         <div className="premium-card p-6 md:p-10 bg-white space-y-10">
                            <div className="flex items-center justify-between">
                               <div className="space-y-1">
                                  <h3 className="text-2xl font-black text-navy-900 tracking-tighter">Galeria de Ativos</h3>
                                  <p className="text-sm text-navy-400">Arraste as fotos ou clique para carregar.</p>
                               </div>
                               <label className="btn-primary flex items-center gap-2 cursor-pointer py-3 px-6">
                                  <Upload size={18} /> Upload de Fotos
                                  <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                               </label>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                               {formData.images?.map((url, idx) => (
                                 <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden group shadow-xl">
                                    <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" />
                                    <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <button type="button" onClick={() => {
                                         const imgs = [...(formData.images || [])];
                                         imgs.splice(idx, 1);
                                         setFormData({...formData, images: imgs});
                                       }} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
                                          <Trash2 size={18} />
                                       </button>
                                    </div>
                                    {idx === 0 && <div className="absolute top-3 left-3 bg-navy-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Capa</div>}
                                 </div>
                               ))}
                               {uploading && <div className="aspect-square rounded-3xl border-2 border-dashed border-navy-100 bg-navy-50 animate-pulse flex items-center justify-center text-navy-300 font-bold text-[10px] uppercase">Processando...</div>}
                            </div>
                         </div>

                         <div className="flex flex-col md:flex-row gap-4 pt-8">
                            <button type="button" onClick={() => setActiveStep(3)} className="btn-secondary flex-1 py-5">Voltar</button>
                            <button 
                              type="submit" 
                              disabled={loading || uploading}
                              className="btn-primary flex-[2] py-5 text-xl font-black tracking-tight shadow-2xl shadow-navy-900/20 flex items-center justify-center gap-3"
                            >
                               {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full" /> : <Save size={24} />}
                               {id ? 'Salvar Alterações' : 'Publicar no Marketplace'}
                            </button>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
}
