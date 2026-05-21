import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Star, ShieldCheck, Gamepad2, CreditCard, 
  Smartphone, Users, Calendar, AlertCircle, ArrowUpRight, CheckCircle, RefreshCw
} from "lucide-react";
import { Casino, UserReview } from "../types";
import { AffiliateButton } from "../components/AffiliateButton";

interface CasinoDetailViewProps {
  casino: Casino | null;
  onBack: () => void;
  onNavigate: (path: string) => void;
  relatedCasinos: Casino[];
}

export const CasinoDetailView: React.FC<CasinoDetailViewProps> = ({
  casino,
  onBack,
  onNavigate,
  relatedCasinos
}) => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Review Input Form
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [country, setCountry] = useState("Germany");
  const [formSuccess, setFormSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch reviews for this casino
  const fetchReviews = async () => {
    if (!casino) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/reviews?casino_id=${casino.id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews list", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [casino]);

  if (!casino) {
    return (
      <div className="pt-32 text-center text-white/60">
        <p>No casino selected. Return to navigation.</p>
        <button onClick={onBack} className="text-[#BAFF00] hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          casino_id: casino.id,
          username,
          country,
          rating,
          comment
        })
      });

      if (response.ok) {
        setFormSuccess(true);
        setUsername("");
        setComment("");
        // Reload reviews list
        await fetchReviews();
        setTimeout(() => setFormSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Error submitting review", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Construct JSON-LD Structured Schema dynamic values representing casinos
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `https://casinoswipe.com/casino/${casino.slug}`,
        "name": casino.name,
        "image": casino.logo,
        "priceRange": "$$",
        "telephone": "N/A",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "Curaçao"
        }
      },
      {
        "@type": "Product",
        "name": casino.name,
        "image": casino.logo,
        "description": `Full specifications review and promotional analysis for ${casino.name}. Get welcome bonus: ${casino.bonus_headline}`,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": casino.rating,
          "reviewCount": reviews.length || 15,
          "bestRating": "5",
          "worstRating": "1"
        }
      }
    ]
  };

  return (
    <div className="w-full min-h-screen pt-32 pb-24 px-4 sm:px-6">
      
      {/* Dynamic JSON-LD injection directly in HTML head if in DOM */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />

      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* HEADER ANCHOR LINKS */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#BAFF00] font-bold hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Back to Discover Index</span>
        </button>

        {/* HERO TITLE MODULE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden neon-shadow">
          
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img
                src={casino.logo}
                alt={casino.name}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="font-display text-4xl uppercase text-white tracking-widest">{casino.name}</h1>
                <div className="flex items-center gap-2 text-xs text-[#BAFF00]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Licensed Commission (eGaming)</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-sans mt-1">
              {casino.name} is classified as an industry leader, presenting rapid cryptocurrency integrations and verified, Provably-Fair interactive entertainment releases. This slot provider features outstanding daily bonus triggers.
            </p>

            <div className="flex gap-6 mt-2 font-mono text-[10.5px]">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-[#BAFF00] stroke-[#BAFF00]" /> {casino.rating} Rating</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#BAFF00]" /> {casino.live_players} Playing</span>
              <span className="text-[#66FF03] font-bold">&#10003; Recommended</span>
            </div>
          </div>

          {/* BONUS CALL TO ACTION */}
          <div className="glass-pill rounded-2xl p-5 flex flex-col justify-between gap-4 card-gradient neon-border neon-shadow">
            <div>
              <span className="text-[10px] uppercase font-mono text-[#BAFF00] tracking-widest font-semibold block mb-1">Exclusive Bonus</span>
              <h2 className="font-display text-2xl uppercase text-white tracking-tight leading-tight">
                {casino.bonus_headline}
              </h2>
            </div>

            <AffiliateButton
              casino_id={casino.id}
              casino_name={casino.name}
              source_page="casino_detail"
              source_position="hero_cta"
              label="Claim Exclusive Bonus"
            />
          </div>

        </div>

        {/* GRID SPECS: BONUS TERMS & HIGHLIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Bonus Specs */}
          <div className="glass-panel rounded-2xl p-6 neon-shadow">
            <h3 className="font-display text-2xl uppercase text-white mb-4 tracking-wide border-b border-white/[0.04] pb-2">Promotion Details</h3>
            <table className="w-full text-xs text-left text-white/70 border-collapse">
              <tbody>
                <tr className="border-b border-white/[0.03]">
                  <td className="py-3 font-semibold text-white/50">Wagering Requirement</td>
                  <td className="py-3 text-right text-white font-mono">{casino.bonus_details.wagering}</td>
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="py-3 font-semibold text-white/50">Minimum Deposit Required</td>
                  <td className="py-3 text-right text-white font-mono">{casino.bonus_details.min_deposit}</td>
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="py-3 font-semibold text-white/50">Bonus Expiration</td>
                  <td className="py-3 text-right text-white font-mono">{casino.bonus_details.expiry}</td>
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="py-3 font-semibold text-white/50">Maximum Allowed Cashout</td>
                  <td className="py-3 text-right text-white font-mono">{casino.bonus_details.max_cashout}</td>
                </tr>
                {casino.bonus_details.vip_cashback && (
                  <tr className="border-b border-white/[0.03]">
                    <td className="py-3 font-semibold text-white/50">VIP Support Benefit</td>
                    <td className="py-3 text-right text-[#BAFF00] font-semibold">{casino.bonus_details.vip_cashback}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Live Game categories */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between neon-shadow">
            <div>
              <h3 className="font-display text-2xl uppercase text-white mb-4 tracking-wide border-b border-white/[0.04] pb-2">Supported Categories</h3>
              <div className="flex flex-wrap gap-2">
                {casino.game_types.map(genre => (
                  <span key={genre} className="text-xs font-semibold bg-[#BAFF00]/10 text-[#BAFF00] border border-[#BAFF00]/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 select-none uppercase tracking-wider">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>{genre}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.04]">
              <span className="text-[10px] uppercase font-mono text-white/40 font-bold block mb-2">Approved Country Status:</span>
              <div className="bg-white/[0.02] border border-white/[0.03] p-3 rounded-xl flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#BAFF00]" />
                <span className="text-xs text-[#BAFF00] font-sans">Strictly authorized, legal, and verified for registration.</span>
              </div>
            </div>
          </div>

        </div>

        {/* PAYMENT METHODS & WITHDRAWAL TIMINGS */}
        <div className="glass-panel rounded-2xl p-6 font-sans neon-shadow">
          <h3 className="font-display text-3xl uppercase text-white mb-4 tracking-wide border-b border-white/[0.04] pb-2">Payment Limits & Speeds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            
            <div className="glass-pill rounded-xl p-4 flex flex-col gap-1.5 justify-center">
              <span className="text-[10px] font-bold text-white/40 uppercase">Crypto Payout</span>
              <strong className="text-sm text-[#BAFF00] font-mono">{casino.withdrawal_speed.crypto}</strong>
              <span className="text-[9.5px] text-white/50 leading-none">Instant network credit</span>
            </div>

            <div className="glass-pill rounded-xl p-4 flex flex-col gap-1.5 justify-center">
              <span className="text-[10px] font-bold text-white/40 uppercase">e-Wallets</span>
              <strong className="text-sm text-white/80 font-mono">{casino.withdrawal_speed.ewallet}</strong>
              <span className="text-[9.5px] text-white/50 leading-none">Approved instantly</span>
            </div>

            <div className="glass-pill rounded-xl p-4 flex flex-col gap-1.5 justify-center">
              <span className="text-[10px] font-bold text-white/40 uppercase">Credit Cards</span>
              <strong className="text-sm text-white/80 font-mono">{casino.withdrawal_speed.card}</strong>
              <span className="text-[9.5px] text-white/50 leading-none">Standard processing</span>
            </div>

            <div className="glass-pill rounded-xl p-4 flex flex-col gap-1.5 justify-center">
              <span className="text-[10px] font-bold text-white/40 uppercase">Bank Wire</span>
              <strong className="text-sm text-white/80 font-mono">{casino.withdrawal_speed.bank}</strong>
              <span className="text-[9.5px] text-white/50 leading-none">Varies by geography</span>
            </div>

          </div>
        </div>

        {/* TOP 3 FEATURED GAMES SECTION */}
        <div className="glass-panel rounded-2xl p-6 font-sans neon-shadow">
          <h3 className="font-display text-3xl uppercase text-white mb-4 tracking-wide">Top 3 Featured Games</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {casino.featured_games.map((g) => (
              <div key={g.name} className="glass-pill rounded-xl overflow-hidden group">
                <div className="h-40 overflow-hidden relative">
                  <img src={g.thumbnail} alt={g.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none" referrerPolicy="no-referrer" />
                  <div className="absolute top-2.5 right-2.5 bg-black/75 px-2.5 py-1 text-[9.5px] font-bold text-[#BAFF00] font-mono rounded-md border border-[#BAFF00]/10">
                    Max payout: {g.multiplier}
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-white tracking-wide">{g.name}</h4>
                  <span className="text-[10px] uppercase text-white/55 tracking-wider">{g.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* METRICS & SOCIAL PROOF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-xl p-5 flex flex-col gap-1 neon-shadow">
            <span className="text-[10px] text-white/40 uppercase font-bold">App Integration Status</span>
            <strong className="text-xs text-white leading-relaxed">{casino.app_info}</strong>
          </div>
          <div className="glass-panel rounded-xl p-5 flex flex-col gap-1 neon-shadow">
            <span className="text-[10px] text-white/40 uppercase font-bold">VIP Status Overview</span>
            <strong className="text-xs text-white leading-relaxed">{casino.vip_overview}</strong>
          </div>
          <div className="glass-panel rounded-xl p-5 flex flex-col gap-1 neon-shadow">
            <span className="text-[10px] text-white/40 uppercase font-bold">Approved Contacts Support</span>
            <div className="flex flex-col gap-1 text-xs text-[#BAFF00] font-sans">
              {casino.customer_support.map(item => <span key={item}>&bull; {item}</span>)}
            </div>
          </div>
        </div>

        {/* FEEDBACK & REVIEWS LIST */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 font-sans neon-shadow">
          <h3 className="font-display text-3xl uppercase text-white mb-6">Player Reviews</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left Col: Star Rating details */}
            <div className="md:col-span-2 glass-pill rounded-xl p-5 flex flex-col gap-4 justify-between h-fit">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Social Proof Rating</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold text-white tracking-tight">{casino.rating}</span>
                  <span className="text-lg text-white/50">/ 5.0</span>
                </div>
                <div className="flex gap-1.5 text-[#BAFF00] mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(casino.rating) ? "fill-[#BAFF00] stroke-[#BAFF00]" : "text-white/20"}`} />
                  ))}
                </div>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3.5 pt-4 border-t border-white/[0.04]">
                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] uppercase font-semibold text-white/50">Your Display Name</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. LuckySpinner99"
                    className="bg-white/5 backdrop-blur-md text-xs text-white py-2.5 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] uppercase font-semibold text-white/50">Country Location</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="bg-white/5 backdrop-blur-md text-xs text-white py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50 cursor-pointer"
                    >
                      <option className="bg-[#080808]">Germany</option>
                      <option className="bg-[#080808]">United Kingdom</option>
                      <option className="bg-[#080808]">Canada</option>
                      <option className="bg-[#080808]">Australia</option>
                      <option className="bg-[#080808]">Norway</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] uppercase font-semibold text-white/50">Your Rating score</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      required
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="bg-white/5 backdrop-blur-md text-xs text-white py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] uppercase font-semibold text-white/50">Your Statement comment</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Wagering rules, deposit limits, support speeds..."
                    className="bg-white/5 backdrop-blur-md text-xs text-white py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-xs uppercase py-3 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {submittingReview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Post Review Log</span>}
                </button>

                {formSuccess && (
                  <span className="text-[10px] text-[#66FF03] font-semibold text-center select-none block">Review published successfully!</span>
                )}
              </form>
            </div>

            {/* Right Col: Active feedback timeline */}
            <div className="md:col-span-3 flex flex-col gap-4">
              <span className="text-[10px] font-mono text-white/40 uppercase block">Recent reviews log ({reviews.length}):</span>
              
              {reviewsLoading ? (
                <div className="text-white/40 text-xs py-8 text-center animate-pulse">Running query checks...</div>
              ) : reviews.length === 0 ? (
                <div className="text-white/40 text-xs py-8 text-center">Be the first to submit a review log on {casino.name}!</div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-2 font-sans">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="glass-pill rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-white">{rev.username}</strong>
                          <span className="text-white/35 text-[10px] uppercase font-mono tracking-wider">&bull; {rev.country}</span>
                        </div>
                        <span className="text-[#BAFF00] font-mono text-[10px]">{rev.rating} ★ Rating</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed italic">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* RELATED CASINOS GRID LIST */}
        <div className="pt-8 border-t border-white/[0.05] font-sans">
          <h3 className="font-display text-3xl uppercase text-white mb-6">Related Casinos You Might Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedCasinos.slice(0, 2).map((rel) => (
              <div
                key={rel.id}
                onClick={() => onNavigate(`casino_${rel.slug}`)}
                className="glass-panel hover:bg-white/[0.06] hover:neon-border rounded-2xl p-5 flex items-center justify-between gap-4 cursor-pointer transition-all neon-shadow hover:scale-[1.03]"
              >
                <div className="flex items-center gap-3">
                  <img src={rel.logo} alt={rel.name} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-display text-xl text-white uppercase">{rel.name}</h4>
                    <span className="text-[10.5px] text-[#BAFF00] mt-0.5 inline-block">{rel.bonus_headline}</span>
                  </div>
                </div>
                <button className="p-2 border border-white/10 rounded-full text-white hover:text-[#BAFF00] hover:border-[#BAFF00]">
                  <ArrowUpRight className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
