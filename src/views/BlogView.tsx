import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, User, Clock, ArrowRight, Home, ChevronRight, Award } from "lucide-react";
import { BlogPost, Casino } from "../types";
import { INITIAL_BLOGS } from "../data";
import { AffiliateButton } from "../components/AffiliateButton";

interface BlogViewProps {
  casinos: Casino[];
  onNavigate: (path: string) => void;
  onSelectCasino: (slug: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  casinos,
  onNavigate,
  onSelectCasino
}) => {
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  // Parse location hash redirects or state actions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeArticle]);

  // Find relevant casinos to embed inside the article
  const getEmbeddedCasinos = (slugs: string[]) => {
    return casinos.filter((cas) => slugs.includes(cas.slug) && cas.is_active);
  };

  const blogsList = [...INITIAL_BLOGS];
  const featuredBlog = blogsList[0];
  const ordinaryBlogsList = blogsList.slice(1);

  // Construct JSON-LD Breadcrumb list
  const breadcrumbJsonLd = activeArticle ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home Landing",
        "item": "https://casinoswipe.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "CasinoSwipe Blog",
        "item": "https://casinoswipe.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": activeArticle.title,
        "item": `https://casinoswipe.com/blog/${activeArticle.slug}`
      }
    ]
  } : null;

  return (
    <div className="w-full min-h-screen pt-28 pb-24 px-4 sm:px-6">
      
      {breadcrumbJsonLd && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} 
        />
      )}

      {/* ==========================================
          VIEW A: INDIVIDUAL BLOG ARTICLE
          ========================================== */}
      {activeArticle ? (
        <article className="max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in font-sans">
          
          {/* Breadcrumb Navigation Row */}
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-white/40 border-b border-white/[0.04] pb-4">
            <button onClick={() => { setActiveArticle(null); }} className="hover:text-[#BAFF00] inline-flex items-center gap-1 cursor-pointer">
              <Home className="w-3.5 h-3.5" />
              <span>Blogs</span>
            </button>
            <ChevronRight className="w-3 h-3 text-white/20" />
            <span className="text-white/30 truncate max-w-[200px] sm:max-w-none">{activeArticle.category}</span>
            <ChevronRight className="w-3 h-3 text-white/20" />
            <span className="text-[#BAFF00] truncate max-w-[200px] sm:max-w-none">{activeArticle.title}</span>
          </div>

          <button
            onClick={() => setActiveArticle(null)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#BAFF00] font-bold hover:text-white transition-colors cursor-pointer w-fit mt-2"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>Back to SEO Hub</span>
          </button>

          {/* Title Header area */}
          <div className="flex flex-col gap-3 mt-2">
            <span className="text-[10px] uppercase font-mono bg-[#BAFF00]/10 text-[#BAFF00] font-bold tracking-widest py-1 px-3.5 rounded-full w-fit">
              {activeArticle.category} Focus
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase leading-none text-white tracking-wide mt-1">
              {activeArticle.title}
            </h1>

            {/* Timings log metadata */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-white/50 border-y border-white/[0.04] py-3 mt-3">
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-4.5 h-4.5 text-[#BAFF00]" /> {activeArticle.published_at}</span>
              <span className="inline-flex items-center gap-1.5"><User className="w-4.5 h-4.5 text-[#BAFF00]" /> {activeArticle.author}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-4.5 h-4.5 text-[#BAFF00]" /> {activeArticle.read_time}</span>
            </div>
          </div>

          {/* Cover image banner */}
          <div className="h-64 sm:h-96 rounded-2xl overflow-hidden relative border border-white/[0.05]">
            <img src={activeArticle.cover_image} alt={activeArticle.title} className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
          </div>

          {/* MARKDOWN PARAPHRASED CONTENT BLOCKS */}
          <div className="text-sm sm:text-base text-white/70 leading-relaxed font-sans space-y-6 mt-4">
            {activeArticle.content.split("\n\n").map((para, idx) => {
              if (para.startsWith("###")) {
                return (
                  <h3 key={idx} className="font-display text-2xl uppercase text-white tracking-wide pt-4">
                    {para.replace("###", "").trim()}
                  </h3>
                );
              }
              if (para.startsWith("##")) {
                return (
                  <h2 key={idx} className="font-display text-3xl uppercase text-[#BAFF00] tracking-wide pt-4 border-b border-white/[0.04] pb-2">
                    {para.replace("##", "").trim()}
                  </h2>
                );
              }
              if (para.startsWith("*") || para.startsWith("-")) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-2.5 pl-4 text-white/60 text-xs sm:text-sm">
                    {para.split("\n").map((li, liIdx) => (
                      <li key={liIdx}>{li.replace(/^[\s*-]+/, "").trim()}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx} className="leading-relaxed">{para}</p>;
            })}
          </div>

          {/* ==========================================
              DYNAMIC EMBEDDED RECOMMENDED CASINOS CARDS
              ========================================== */}
          <div className="mt-12 glass-panel p-6 sm:p-8 rounded-3xl neon-shadow">
            <div className="flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-3">
              <Award className="w-6 h-6 text-[#BAFF00]" />
              <h4 className="font-display text-2xl uppercase text-white">Recommended Match Releases</h4>
            </div>

            <p className="text-xs text-white/50 mb-6 font-sans">
              Sign up through our exclusive referral codes to support the blog writers and automatically double your credits with the wagering parameters listed below.
            </p>

            <div className="flex flex-col gap-4">
              {getEmbeddedCasinos(activeArticle.related_casinos).map((cas) => (
                <div 
                  key={cas.id}
                  onClick={() => onSelectCasino(cas.slug)}
                  className="glass-pill hover:bg-white/[0.06] hover:neon-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={cas.logo} alt={cas.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                    <div>
                      <h5 className="font-display text-xl uppercase text-white leading-none mb-1">{cas.name}</h5>
                      <span className="text-xs text-[#BAFF00] font-sans font-semibold block">{cas.bonus_headline}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto self-stretch">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectCasino(cas.slug); }}
                      className="flex-1 sm:flex-none text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white py-3 px-4 rounded-xl border border-white/[0.04] text-center transition-colors"
                    >
                      Specifications
                    </button>
                    
                    <div className="flex-1 sm:flex-none">
                      <AffiliateButton
                        casino_id={cas.id}
                        casino_name={cas.name}
                        source_page="blog"
                        source_position="sidebar"
                        label="Join & Play"
                        className="py-3 px-5 text-xs whitespace-nowrap"
                        icon={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveArticle(null)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#BAFF00] font-bold hover:text-white transition-colors cursor-pointer w-fit mt-8"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>Back to SEO Hub</span>
          </button>

        </article>
      ) : (
        
        /* ==========================================
            VIEW B: BLOGS LIST (SEO INDEX HUB)
            ========================================== */
        <div className="max-w-7xl mx-auto flex flex-col gap-12 font-sans">
          
          <div className="text-center flex flex-col gap-3 max-w-xl mx-auto">
            <h1 className="font-display text-4xl sm:text-5xl uppercase leading-none text-white tracking-wide">
              CasinoSwipe <span className="text-[#BAFF00]">SEO Content Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
              Stay ahead of wagering codes and regulatory audits with premium expert guidance compiled daily by international operators.
            </p>
          </div>

          {/* 1. COMPACT HERO FEATURED POST */}
          {featuredBlog && (
            <div 
              onClick={() => setActiveArticle(featuredBlog)}
              className="glass-panel hover:bg-white/[0.06] hover:neon-border rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 cursor-pointer group transition-all duration-300 neon-shadow hover:scale-[1.01]"
            >
              <div className="h-64 sm:h-auto overflow-hidden relative">
                <img src={featuredBlog.cover_image} alt={featuredBlog.title} className="w-full h-full object-cover group-hover:scale-101 transition-transform pointer-events-none" referrerPolicy="no-referrer" />
                <span className="absolute top-4 left-4 bg-[#BAFF00] text-[#080808] text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                  Featured post
                </span>
              </div>

              <div className="p-6 md:p-8 flex flex-col justify-between items-start gap-4">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] tracking-wider uppercase font-mono text-white/40">{featuredBlog.category} Guides</span>
                  <h2 className="font-display text-2xl sm:text-4xl uppercase text-white group-hover:text-[#BAFF00] transition-colors leading-tight">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed font-sans mt-1">
                    {featuredBlog.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between w-full border-t border-white/[0.03] pt-4 font-mono text-[10.5px] text-white/40 mt-4">
                  <span>Published: <strong className="text-white/60 font-sans">{featuredBlog.published_at}</strong></span>
                  <span className="text-[#BAFF00] font-sans font-bold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform uppercase tracking-wider">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. GRID OF ADJACENT POSTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ordinaryBlogsList.map((post) => (
              <div
                key={post.id}
                onClick={() => setActiveArticle(post)}
                className="glass-panel hover:bg-white/[0.06] hover:neon-border rounded-3xl overflow-hidden cursor-pointer group transition-all flex flex-col justify-between neon-shadow hover:scale-[1.02] duration-300"
              >
                <div>
                  <div className="h-44 overflow-hidden relative">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-6 flex flex-col gap-3">
                    <span className="text-[9.5px] uppercase font-mono tracking-wider text-white/40">{post.category} Focus</span>
                    <h3 className="font-display text-xl uppercase text-white group-hover:text-[#BAFF00] transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed font-sans line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 border-t border-white/[0.03] pt-4 mt-2 flex justify-between items-center text-[10.5px] font-mono text-white/40">
                  <span>Expiry: <strong className="text-white/60 font-sans">Locked</strong></span>
                  <span className="text-[#BAFF00] font-sans font-bold inline-flex items-center gap-1 group-hover:translate-x-1.5 transition-transform uppercase tracking-wider">
                    Full Text <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
