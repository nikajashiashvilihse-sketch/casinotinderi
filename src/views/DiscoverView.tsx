import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { 
  Heart, X, RefreshCw, Star, HelpCircle, 
  MapPin, SlidersHorizontal, Eye, Flame, Award, HelpCircle as HelpIcon
} from "lucide-react";
import { Casino, OnboardingPreferences } from "../types";
import { AffiliateButton } from "../components/AffiliateButton";
import { safeLocalStorage } from "../utils";

interface DiscoverViewProps {
  casinos: Casino[];
  onNavigate: (path: string) => void;
  onLikeCasino: (casino: Casino) => void;
  likedCasinosList: Casino[];
  onSelectCasino: (slug: string) => void;
  detectedCountry: string;
  setDetectedCountry: (country: string) => void;
  
  // Shared swiper deck states
  activeDeck: Casino[];
  deckIdx: number;
  setDeckIdx: React.Dispatch<React.SetStateAction<number>>;
  selectedGameFilter: string;
  setSelectedGameFilter: (filter: string) => void;
  selectedPaymentFilter: string;
  setSelectedPaymentFilter: (filter: string) => void;
  selectedBonusFilter: string;
  setSelectedBonusFilter: (filter: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  casinos,
  onNavigate,
  onLikeCasino,
  likedCasinosList,
  onSelectCasino,
  detectedCountry,
  setDetectedCountry,
  activeDeck,
  deckIdx,
  setDeckIdx,
  selectedGameFilter,
  setSelectedGameFilter,
  selectedPaymentFilter,
  setSelectedPaymentFilter,
  selectedBonusFilter,
  setSelectedBonusFilter
}) => {
  // Geo detection state
  const [geoLoading, setGeoLoading] = useState(false);
  const [showOverrideDrop, setShowOverrideDrop] = useState(false);

  const countriesList = [
    "Germany", "United Kingdom", "Canada", "Australia", 
    "Brazil", "Norway", "Japan", "United States", "Sweden"
  ];

  // Drag physics tracking
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, -20], [1, 0]);

  // Read geo detection details
  useEffect(() => {
    const fetchGeo = async () => {
      setGeoLoading(true);
      try {
        const storedGeo = safeLocalStorage.getItem("casinoswipe_detected_geo");
        if (storedGeo) {
          const parsed = JSON.parse(storedGeo);
          if (parsed.country_name) {
            setDetectedCountry(parsed.country_name);
            setGeoLoading(false);
            return;
          }
        }

        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data.country_name) {
            setDetectedCountry(data.country_name);
            safeLocalStorage.setItem("casinoswipe_detected_geo", JSON.stringify(data));
          }
        }
      } catch (err) {
        console.warn("ipapi geo identification failed, defaulted to United Kingdom", err);
        setDetectedCountry("United Kingdom");
      } finally {
        setGeoLoading(false);
      }
    };

    fetchGeo();
  }, [setDetectedCountry]);

  // Hook standard Keyboard events
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (deckIdx >= activeDeck.length) return;
      
      if (e.key === "ArrowRight") {
        handleLike();
      } else if (e.key === "ArrowLeft") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [deckIdx, activeDeck]);

  const handleLike = () => {
    if (deckIdx >= activeDeck.length) return;
    const currentCasino = activeDeck[deckIdx];
    
    onLikeCasino(currentCasino);
    setDeckIdx(prev => prev + 1);
    x.set(0); // reset motion offset
  };

  const handleSkip = () => {
    if (deckIdx >= activeDeck.length) return;
    setDeckIdx(prev => prev + 1);
    x.set(0); // reset motion offset
  };

  const handleReset = () => {
    setDeckIdx(0);
  };

  // Drag termination handler
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 120) {
      handleLike();
    } else if (info.offset.x < -120) {
      handleSkip();
    } else {
      // Return smoothly
      x.set(0);
    }
  };

  const activeReviewsCount = 12; // social proof

  return (
    <div className="w-full min-h-screen pt-28 pb-20 px-4 md:px-6 flex flex-col items-center">
      
      {/* FILTER PANEL DESIGNS */}
      <div className="w-full max-w-lg mb-8 glass-panel rounded-2xl p-5 neon-shadow">
        
        {/* Country Display & Selector */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-2">
            <span className="text-[#BAFF00] text-xs">📍</span>
            <span className="text-[11px] uppercase tracking-widest font-bold text-white/90">
              Showing for: <span className="text-[#BAFF00]">{detectedCountry}</span>
            </span>
          </div>

          <button 
            onClick={() => setShowOverrideDrop(!showOverrideDrop)}
            className="text-[11px] font-bold uppercase tracking-wider text-white/50 hover:text-[#BAFF00] cursor-pointer transition-colors"
          >
            {showOverrideDrop ? "Close Selection" : "Change Country"}
          </button>
        </div>

        {/* Change Country Dropdown Grid */}
        {showOverrideDrop && (
          <div className="grid grid-cols-3 gap-1.5 py-4 border-b border-white/5 animate-fade-in text-[11px]">
            {countriesList.map(country => (
              <button
                key={country}
                onClick={() => {
                  setDetectedCountry(country);
                  setShowOverrideDrop(false);
                }}
                className={`py-1.5 px-2 rounded-lg text-center font-medium transition-colors ${
                  detectedCountry === country 
                    ? "bg-[#BAFF00] text-[#080808] font-semibold" 
                    : "glass-pill text-white/70 hover:bg-white/10"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        )}

        {/* Categories filters */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          
          {/* Games Option */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-wider font-bold text-white/40">Game Pref</span>
            <select
              value={selectedGameFilter}
              onChange={(e) => setSelectedGameFilter(e.target.value)}
              className="bg-white/5 backdrop-blur-[4px] text-xs text-white/80 py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="All" className="bg-[#080808]">All Genres</option>
              <option value="Slots" className="bg-[#080808]">Slots</option>
              <option value="Live Casino" className="bg-[#080808]">Live Casino</option>
              <option value="Crash Games" className="bg-[#080808]">Crash Games</option>
              <option value="Sports Betting" className="bg-[#080808]">Sports Betting</option>
              <option value="Crypto Games" className="bg-[#080808]">Crypto Games</option>
            </select>
          </div>

          {/* Payments options */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-wider font-bold text-white/40">Payments</span>
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              className="bg-white/5 backdrop-blur-[4px] text-xs text-white/80 py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="All" className="bg-[#080808]">Any Method</option>
              <option value="Crypto" className="bg-[#080808]">Crypto Portal</option>
              <option value="PayPal" className="bg-[#080808]">PayPal</option>
              <option value="Credit Card" className="bg-[#080808]">Credit Card</option>
              <option value="Bank Transfer" className="bg-[#080808]">Bank Wire</option>
            </select>
          </div>

          {/* Bonuses options */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-wider font-bold text-white/40">Bonus Focus</span>
            <select
              value={selectedBonusFilter}
              onChange={(e) => setSelectedBonusFilter(e.target.value)}
              className="bg-white/5 backdrop-blur-[4px] text-xs text-white/80 py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="All" className="bg-[#080808]">All Promos</option>
              <option value="200%" className="bg-[#080808]">200% Matches</option>
              <option value="150%" className="bg-[#080808]">150% Matches</option>
              <option value="Spins" className="bg-[#080808]">Free Spins</option>
              <option value="Cashback" className="bg-[#080808]">VIP Cashback</option>
            </select>
          </div>

        </div>

      </div>

      {/* CARD STACK CONTAINER */}
      <div className="relative w-full max-w-sm h-[530px] flex items-center justify-center select-none">
        
        <AnimatePresence>
          {deckIdx < activeDeck.length ? (
            activeDeck.slice(deckIdx, deckIdx + 3).reverse().map((casino, idx, arr) => {
              const isTop = idx === arr.length - 1; // last item rendered is physically at front in reverse
              
              return (
                <motion.div
                  key={casino.id}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  style={isTop ? { x, rotate } : {}}
                  onDragEnd={isTop ? handleDragEnd : undefined}
                  animate={{
                    scale: isTop ? 1 : 1 - (arr.length - 1 - idx) * 0.04,
                    y: isTop ? 0 : (arr.length - 1 - idx) * 12,
                    zIndex: idx,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute w-full h-full card-gradient rounded-[32px] p-6 neon-border neon-shadow flex flex-col justify-between shadow-2xl cursor-grab active:cursor-grabbing transform-gpu transition-shadow duration-300"
                >
                  
                  {/* LIKE OR SKIP INDICATOR STAMPS (Visible only on top dragged card) */}
                  {isTop && (
                    <>
                      <motion.div
                        style={{ opacity: likeOpacity }}
                        className="absolute top-8 left-8 border-4 border-[#BAFF00] text-[#BAFF00] font-display text-4xl uppercase tracking-widest px-4 py-1.5 rounded-xl rotate-[-12deg] z-50 pointer-events-none"
                      >
                        ♥ LIKE
                      </motion.div>
                      <motion.div
                        style={{ opacity: skipOpacity }}
                        className="absolute top-8 right-8 border-4 border-[#FF4058] text-[#FF4058] font-display text-4xl uppercase tracking-widest px-4 py-1.5 rounded-xl rotate-[12deg] z-50 pointer-events-none"
                      >
                        ✕ SKIP
                      </motion.div>
                    </>
                  )}

                  {/* Top card metadata strip */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-1.5">
                        <img
                          src={casino.logo}
                          alt={casino.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h3 className="font-display text-2xl text-white tracking-wide uppercase leading-tight">{casino.name}</h3>
                          <div className="flex items-center gap-1 text-[10px] text-white/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#BAFF00] animate-pulse" />
                            <span>Licensed Curaçao</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {casino.tags.includes("New") && (
                          <span className="text-[8px] uppercase font-bold tracking-widest bg-[#BAFF00] text-black px-2 py-0.5 rounded-md">New</span>
                        )}
                        {casino.is_featured && (
                          <span className="text-[8px] uppercase font-bold tracking-widest bg-[#FF4058] text-white px-2 py-0.5 rounded-md">Featured</span>
                        )}
                      </div>
                    </div>

                    {/* Big Bonus Highlight Banner */}
                    <div className="glass-pill rounded-2xl px-5 py-3.5 flex flex-col justify-center gap-1 mt-3 shadow-md">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#BAFF00] font-semibold">Special Offer</span>
                      <h4 className="font-display text-2xl sm:text-3xl text-[#BAFF00] leading-none uppercase tracking-tight">
                        {casino.bonus_headline}
                      </h4>
                    </div>

                    {/* Social proof specs */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center border-y border-white/[0.04] py-2.5 font-mono text-[10.5px]">
                      <div className="flex flex-col">
                        <span className="text-white font-sans font-semibold text-xs inline-flex items-center justify-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-[#BAFF00] stroke-[#BAFF00]" />
                          {casino.rating}
                        </span>
                        <span className="text-white/40 text-[9px] uppercase mt-0.5">Rating</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{casino.liked_percent}%</span>
                        <span className="text-white/40 text-[9px] uppercase mt-0.5">Liked</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#66FF03] font-bold inline-flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#66FF03] animate-ping" />
                          {casino.live_players}
                        </span>
                        <span className="text-white/40 text-[9px] uppercase mt-0.5">Live</span>
                      </div>
                    </div>

                    {/* Tags pill lists */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {casino.game_types.slice(0, 3).map(g => (
                        <span key={g} className="text-[9.5px] uppercase tracking-wider font-semibold bg-[#BAFF00]/10 text-[#BAFF00] px-3 py-1 rounded-full">
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Payment methods list icon mock row */}
                    <div className="flex gap-2.5 mt-4 items-center pl-1">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-white/35 mr-1">Payments:</span>
                      {casino.payment_methods.slice(0, 4).map(p => (
                        <span key={p} className="text-[9.5px] text-white/70 font-sans tracking-wide">
                          &bull; {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-col gap-3">
                    
                    {/* Expand Detail details trigger */}
                    <button
                      id={`expand-btn-${casino.id}`}
                      onClick={() => onSelectCasino(casino.slug)}
                      className="w-full bg-[#111111]/70 hover:bg-white/10 text-white/80 font-semibold text-xs py-2.5 rounded-full inline-flex items-center justify-center gap-2 cursor-pointer border border-white/[0.05] transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review Details & Ratings</span>
                    </button>

                    {/* Monetized Affiliate Action */}
                    <AffiliateButton
                      casino_id={casino.id}
                      casino_name={casino.name}
                      source_page="swipe_card"
                      source_position="card_claim"
                      label="Claim Exclusive Bonus"
                    />
                  </div>

                </motion.div>
              );
            })
          ) : (
            
            /* EMPTY DECK CONSOLE VIEW */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute w-full h-[500px] bg-[#141414] border border-white/[0.05] rounded-[32px] p-8 flex flex-col justify-center items-center text-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-[#BAFF00]/10 flex items-center justify-center border border-[#BAFF00]/25 text-[#BAFF00] animate-bounce">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-4xl text-white uppercase leading-none">All Swiped!</h3>
                <p className="text-xs text-white/50 px-4 leading-normal font-sans">
                  You have discovered all licensed operators available in {detectedCountry} matching your current category filters.
                </p>
              </div>

              {likedCasinosList.length > 0 && (
                <button
                  onClick={() => onNavigate("liked")}
                  className="bg-[#BAFF00] text-[#080808] font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-full shadow-lg"
                >
                  Compare Liked Slots ({likedCasinosList.length})
                </button>
              )}

              <button
                onClick={handleReset}
                className="text-xs uppercase tracking-widest font-semibold text-white/60 hover:text-[#BAFF00] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4.5 h-4.5" />
                <span>Reshuffle Filters & Re-Discover</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* FOOTER SWIPING BUTTONS OVERLAY */}
      {deckIdx < activeDeck.length && (
        <div className="flex items-center gap-5 mt-6 justify-center z-10">
          {/* SKIP BUTTON */}
          <button
            id="swipe-dislike-button"
            onClick={handleSkip}
            className="w-14 h-14 rounded-full bg-[#111111]/90 hover:bg-[#FF4058] border border-white/[0.08] hover:border-[#FF4058] flex items-center justify-center text-[#FF4058] hover:text-white transition-all duration-300 transform active:scale-95 shadow-xl cursor-pointer"
            title="Skip (Left Arrow)"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* DETAIL DIALOG TRIGGER */}
          <button
            onClick={() => onSelectCasino(activeDeck[deckIdx].slug)}
            className="w-10 h-10 rounded-full bg-[#111111]/90 border border-white/[0.08] text-white/50 hover:text-[#BAFF00] flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            title="View full specs"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* LIKE BUTTON */}
          <button
            id="swipe-like-button"
            onClick={handleLike}
            className="w-14 h-14 rounded-full bg-[#111111]/90 hover:bg-[#BAFF00] border border-white/[0.08] hover:border-[#BAFF00] flex items-center justify-center text-[#BAFF00] hover:text-[#080808] transition-all duration-300 transform active:scale-95 shadow-xl cursor-pointer hover:shadow-[0_0_20px_rgba(186,255,0,0.35)]"
            title="Like (Right Arrow / Save)"
          >
            <Heart className="w-6 h-6 fill-current stroke-[3]" />
          </button>
        </div>
      )}

      {/* Bottom status feed snippet */}
      <span className="text-[10px] text-white/40 mt-8 font-mono">
        &bull; {activeReviewsCount} user reviews processed inside the system today &bull;
      </span>

    </div>
  );
};
