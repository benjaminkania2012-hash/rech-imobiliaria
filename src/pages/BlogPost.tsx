import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { BLOG_POSTS } from '../lib/blog-data';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  useEffect(() => {
    if (!post) {
      navigate('/blog');
      return;
    }

    // SEO Optimization
    document.title = `${post.title} | Blog RECH Negócios Imobiliários`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', post.excerpt);
    }

    // Schema.org BlogPosting Markup
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "image": [post.image],
      "datePublished": post.date,
      "author": [{
        "@type": "Person",
        "name": post.author
      }],
      "description": post.excerpt
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaMarkup);
    document.head.appendChild(script);

    window.scrollTo(0, 0);

    return () => {
      document.head.removeChild(script);
    };
  }, [post, navigate]);

  if (!post) return null;

  return (
    <div className="pt-32 pb-32">
      <article className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-navy-400 hover:text-navy-900 font-bold text-sm uppercase tracking-widest transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Voltar ao Blog
        </Link>

        {/* Header */}
        <header className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="bg-gold-500 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-navy-900 tracking-tighter leading-tight">
              {post.title}
            </h1>
          </motion.div>

          <div className="flex flex-wrap items-center gap-8 py-6 border-y border-navy-50 text-navy-300 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gold-500" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gold-500" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gold-500" />
              <span>{post.readTime} de leitura</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl"
        >
          <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
        </motion.div>

        {/* Content */}
        <div 
          className="prose prose-lg prose-navy max-w-none 
          prose-headings:text-navy-900 prose-headings:font-black prose-headings:tracking-tighter
          prose-p:text-navy-400 prose-p:leading-relaxed prose-p:font-medium
          prose-strong:text-navy-900 prose-strong:font-bold
          prose-ul:text-navy-400 prose-li:marker:text-gold-500"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer / Social Share */}
        <footer className="pt-12 border-t border-navy-50 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <span className="text-navy-300 text-[10px] font-bold uppercase tracking-widest">Compartilhar:</span>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-900 hover:bg-navy-900 hover:text-white transition-all">
                <Facebook size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-900 hover:bg-navy-900 hover:text-white transition-all">
                <Twitter size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-900 hover:bg-navy-900 hover:text-white transition-all">
                <MessageCircle size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-900 hover:bg-navy-900 hover:text-white transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <Link to="/blog" className="btn-secondary">
            Ver Mais Artigos
          </Link>
        </footer>
      </article>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <div className="bg-navy-900 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent pointer-events-none" />
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Pronto para investir com inteligência?</h2>
            <p className="text-navy-200 max-w-2xl mx-auto text-lg font-medium">Fale com nossos especialistas e descubra as melhores oportunidades do mercado agora mesmo.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-4 relative z-10">
            <a href="https://wa.me/555499123455" target="_blank" rel="noreferrer" className="btn-primary py-4 px-12 text-lg">
              Solicitar Assessoria Grátis
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
