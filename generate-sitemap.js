import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Variáveis do Supabase não encontradas. Pulando geração de sitemap dinâmico.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  try {
    console.log('Gerando sitemap...');
    
    // Buscar todos os imóveis aprovados e disponíveis
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, updated_at')
      .eq('status', 'available');

    if (error) {
      throw error;
    }

    const baseUrl = 'https://seu-dominio.com.br'; // Substitua pelo seu domínio oficial
    
    // Links fixos do site
    const staticPages = [
      { url: '/', priority: 1.0 },
      { url: '/blog', priority: 0.8 },
      { url: '/login', priority: 0.5 },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Adicionar páginas estáticas
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>daily</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
    });

    // Adicionar URLs de imóveis
    if (properties) {
      properties.forEach(property => {
        const lastMod = property.updated_at ? property.updated_at.split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>
    <loc>${baseUrl}/property/${property.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
      });
    }

    xml += `</urlset>`;

    // Escrever o arquivo na pasta public para que o Vite copie para dist
    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log(`Sitemap gerado com sucesso em public/sitemap.xml (${(properties?.length || 0) + staticPages.length} URLs)`);
    
  } catch (err) {
    console.error('Erro ao gerar sitemap:', err);
  }
}

generateSitemap();
