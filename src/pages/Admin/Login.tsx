import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { demoService } from '../../lib/demo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/rech-admin/dashboard');
    }
    checkAuth();
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/rech-admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-navy-900 py-10 px-4">
      {/* Dynamic Background inspired by image 4 */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 opacity-50" />
         <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-gold-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        <div className="premium-card bg-white/90 ios-blur border-white/20 p-8 md:p-16 shadow-2xl flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 border border-navy-50">
             <img src="/logo-rech.png.png" alt="RECH" className="w-full h-full object-contain p-3" />
          </div>
          <div className="text-center space-y-2 mb-12">
            <span className="font-black text-4xl tracking-tighter text-navy-900 uppercase">RECH NEGÓCIOS</span>
            <p className="text-xs font-bold text-navy-400 uppercase tracking-[0.2em]">Painel do Corretor</p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest px-1">E-mail Profissional</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-200 group-focus-within:text-navy-900 transition-colors" size={20} />
                  <input 
                    type="email" 
                    placeholder="corretor@rechnegocios.com.br" 
                    className="w-full pl-16 pr-6 py-5 bg-navy-50/50 border border-navy-100/50 rounded-2xl outline-none focus:bg-white focus:border-navy-900 transition-all font-bold text-navy-900 placeholder:text-navy-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Senha de Acesso</label>
                  <button type="button" className="text-[10px] font-black text-navy-300 uppercase tracking-widest hover:text-navy-900 transition-colors">Esqueceu a senha?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-200 group-focus-within:text-navy-900 transition-colors" size={20} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full pl-16 pr-6 py-5 bg-navy-50/50 border border-navy-100/50 rounded-2xl outline-none focus:bg-white focus:border-navy-900 transition-all font-bold text-navy-900 placeholder:text-navy-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-navy-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-navy-800 active:scale-[0.98] shadow-xl shadow-navy-900/30 disabled:opacity-50"
            >
              {loading ? 'Acessando...' : 'Acessar Dashboard'}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>
          
          <div className="mt-12 flex items-center gap-2 text-navy-300">
             <ShieldCheck size={16} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Acesso Restrito e Monitorado</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
