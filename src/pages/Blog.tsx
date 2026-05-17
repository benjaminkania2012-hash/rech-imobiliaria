import { motion } from 'framer-motion';
import { Search, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { BLOG_POSTS } from '../lib/blog-data';

const CATEGORIES = ['Todos', 'Imóveis Caixa', 'Leilões', 'Financiamento', 'Dicas'];

export default function Blog() {
  const featuredPost = BLOG_POSTS[0];
  const sidePosts = BLOG_POSTS.slice(1, 3);
  const otherPosts = BLOG_POSTS;

  return (
    <div className="pt-40 pb-32 space-y-20">
      <section className="max-w-7xl mx-auto px-6 space-y-8 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-black text-navy-900 tracking-tighter leading-tight">
            Insights do Mercado.
          </h1>
          <p className="text-xl text-navy-400 max-w-2xl font-medium leading-relaxed">
            Análises profundas, guias de financiamento e as melhores oportunidades em leilões e imóveis Caixa para investidores de alto padrão.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
          {CATEGORIES.map((cat, i) => (
            <button 
              key={cat}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all border",
                i === 0 ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-400 border-navy-100 hover:border-navy-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <Link to={`/blog/${featuredPost.slug}`} className="premium-card aspect-video relative group block overflow-hidden">
              <img 
                src={featuredPost.image} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                alt={featuredPost.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/20 to-transparent p-12 flex flex-col justify-end">
                <span className="bg-gold-500 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit mb-4">{featuredPost.category}</span>
                <h2 className="text-4xl font-bold text-white mb-4 max-w-2xl">{featuredPost.title}</h2>
                <p className="text-navy-100 text-lg max-w-xl font-medium">{featuredPost.excerpt}</p>
              </div>
            </Link>
          </motion.div>

          <div className="space-y-6">
            <div className="premium-card p-8 bg-navy-50/50 border-none h-full flex flex-col justify-center gap-6">
              {sidePosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group space-y-2 block first:pb-6 first:border-b first:border-navy-100">
                  <span className="text-gold-500 text-[10px] font-bold uppercase tracking-widest">{post.category}</span>
                  <h3 className="text-2xl font-bold text-navy-900 group-hover:text-gold-500 transition-colors">{post.title}</h3>
                  <p className="text-navy-400 text-sm font-medium leading-relaxed line-clamp-2">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <h2 className="text-4xl font-black text-navy-900 tracking-tighter">Últimas Publicações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {otherPosts.map((post) => (
            <motion.div 
              key={post.id}
              whileHover={{ y: -10 }}
              className="premium-card group"
            >
              <Link to={`/blog/${post.slug}`} className="block">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} />
                </div>
                <div className="p-8 space-y-4">
                  <span className="text-gold-500 text-[10px] font-bold uppercase tracking-widest">{post.category}</span>
                  <h3 className="text-2xl font-bold text-navy-900 group-hover:text-gold-500 transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-navy-400 text-sm font-medium leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-navy-50">
                     <span className="text-navy-300 text-[10px] font-bold uppercase tracking-widest">Ler artigo completo</span>
                     <ArrowRight size={18} className="text-navy-900 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center pt-10">
           <button className="btn-secondary px-12">Carregar Mais Artigos</button>
        </div>
      </section>
    </div>
  );
}

