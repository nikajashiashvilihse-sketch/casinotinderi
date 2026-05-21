import React, { useState } from "react";
import { Heart, Trash2, ArrowRight, ArrowUpRight, Scale, Check, X, Star } from "lucide-react";
import { Casino } from "../types";
import { AffiliateButton } from "../components/AffiliateButton";

interface LikedViewProps {
  likedCasinos: Casino[];
  onRemoveLiked: (id: string) => void;
  onClearAll: () => void;
  onSelectCasino: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const LikedView: React.FC<LikedViewProps> = ({
  likedCasinos,
  onRemoveLiked,
  onClearAll,
  onSelectCasino,
  onNavigate
}) => {
  const [sortBy, setSortBy] = useState<"bonus" | "rating" | "popular" | "newest">("rating");

  // Multi-select comparison state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const handleToggleSelectForCompare = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 3) return; // cap comparison at 3 casinos max
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Run Sorting algorithm rule structures
  const getSortedLiked = () => {
    const list = [...likedCasinos];
    if (sortBy === "rating") {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === "popular") {
      return list.sort((a, b) => b.live_players - a.live_players);
    }
    if (sortBy === "bonus") {
      // Sort alphabetically in lieu of parsing complex bonus strings or hardcode ranking
      return list.sort((a, b) => b.bonus_headline.localeCompare(a.bonus_headline));
    }
    if (sortBy === "newest") {
      // Let's sort based on "New" tags elements
      return list.sort((a, b) => (b.tags.includes("New") ? 1 : 0) - (a.tags.includes("New") ? 1 : 0));
    }
    return list;
  };

  const sortedLiked = getSortedLiked();
  const comparisonCasinos = likedCasinos.filter(c => selectedIds.includes(c.id));

  return (
    <div className="w-full min-h-screen pt-28 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* UPPER HEADER PANEL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/[0.04] pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight flex items-center gap-2">
              <Heart className="w-8 h-8 text-[#BAFF00] fill-[#BAFF00]" />
              <span>Saved Collection</span>
            </h1>
            <p className="text-xs text-white/50 font-sans">
              Keep track of online casinos you have liked. Toggle up to three items to perform a side-by-side specs review.
            </p>
          </div>

          {!isComparing && likedCasinos.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-xs w-full sm:w-auto">
              
              {/* Sort selector */}
              <div className="flex items-center gap-2 glass-pill px-4 py-2 rounded-xl">
                <span className="text-white/40 font-mono text-[9px] uppercase">Sort list:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white/90 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                  <option value="bonus">Best Bonus Title</option>
                  <option value="newest">New Additions</option>
                </select>
              </div>

              {/* Compare Trigger button */}
              <button
                disabled={selectedIds.length < 2}
                onClick={() => setIsComparing(true)}
                className={`py-3.5 px-6 rounded-full font-bold uppercase tracking-wider text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedIds.length >= 2
                    ? "bg-[#BAFF00] text-[#080808] hover:bg-[#66FF03] shadow-md shadow-[#BAFF00]/15"
                    : "bg-white/[0.03] border border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Compare Selected ({selectedIds.length})</span>
              </button>

              {/* Clear button */}
              <button
                onClick={onClearAll}
                className="text-[11px] font-bold text-white/40 hover:text-[#FF4058] transition-colors py-2.5 uppercase tracking-wider"
              >
                Clear Bookmark Deck
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            VIEW A: NORMAL SAVED CARD DECK GRID
            ========================================== */}
        {!isComparing && (
          likedCasinos.length === 0 ? (
            <div className="py-24 text-center bg-[#141414] border border-white/[0.04] rounded-3xl flex flex-col justify-center items-center gap-4">
              <Heart className="w-12 h-12 text-white/20 animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-2xl text-white uppercase">Your Deck Is Empty</h3>
                <p className="text-xs text-white/45 max-w-sm font-sans px-6 leading-relaxed">
                  You haven&apos;t swiped right or bookmark-saved any casinos yet. Launch discovery swiping to start.
                </p>
              </div>
              <button
                onClick={() => onNavigate("discover")}
                className="bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full mt-2 cursor-pointer transition-transform transform active:scale-95"
              >
                Start Swipe Discovery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              {sortedLiked.map((cas) => {
                const isCheckedForCompare = selectedIds.includes(cas.id);
                return (
                  <div
                    key={cas.id}
                    className={`card-gradient neon-shadow border rounded-3xl p-5 relative transition-all duration-300 group ${
                      isCheckedForCompare 
                        ? "border-[#BAFF00] glow-card-active scale-[1.02]" 
                        : "border-white/[0.05] hover:border-[#BAFF00]/30 hover:scale-[1.01]"
                    }`}
                  >
                    
                    {/* Top tools */}
                    <div className="flex justify-between items-start mb-4">
                      {/* Compare Checkbox */}
                      <button
                        onClick={() => handleToggleSelectForCompare(cas.id)}
                        className={`text-[9.5px] uppercase tracking-wider font-bold py-1 px-2.5 rounded-lg border inline-flex items-center gap-1 cursor-pointer transition-colors ${
                          isCheckedForCompare
                            ? "bg-[#BAFF00] border-[#BAFF00] text-[#080808]"
                            : "border-white/10 text-white/50 hover:border-white/20 bg-white/[0.02]"
                        }`}
                      >
                        {isCheckedForCompare ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Scale className="w-3.5 h-3.5" />}
                        <span>{isCheckedForCompare ? "Comparing" : "Compare"}</span>
                      </button>

                      {/* Remove item */}
                      <button
                        onClick={() => onRemoveLiked(cas.id)}
                        className="p-1 px-1.5 rounded-lg text-white/30 hover:text-[#FF4058] hover:bg-white/[0.03] transition-colors cursor-pointer"
                        title="Delete from saved list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Casino Logo + details */}
                    <div 
                      onClick={() => onSelectCasino(cas.slug)}
                      className="flex gap-3 mb-4 cursor-pointer"
                    >
                      <img src={cas.logo} alt={cas.name} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h3 className="font-display text-xl text-white uppercase group-hover:text-[#BAFF00] transition-colors">{cas.name}</h3>
                        <div className="flex items-center gap-1.5 text-[9.5px] text-white/50 mt-0.5">
                          <span>Rating: <strong className="text-white">{cas.rating} ★</strong></span>
                          <span>&bull;</span>
                          <span>{cas.live_players} live</span>
                        </div>
                      </div>
                    </div>

                    {/* Bonus outline boxes */}
                    <div className="glass-pill rounded-xl p-3.5 flex flex-col gap-0.5 mb-5 select-none">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-white/40 block">Locked Bonus Offer</span>
                      <strong className="text-sm text-[#BAFF00] leading-tight font-sans line-clamp-1">{cas.bonus_headline}</strong>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onSelectCasino(cas.slug)}
                        className="w-full bg-[#111111]/75 hover:bg-white/5 text-white/80 font-semibold text-[11px] py-2 rounded-lg border border-white/[0.04] transition-colors"
                      >
                        View Full Specs
                      </button>
                      <AffiliateButton
                        casino_id={cas.id}
                        casino_name={cas.name}
                        source_page="liked_page"
                        source_position="card_claim"
                        label="Claim Bonus Link"
                        className="py-2.5 text-[11px]"
                      />
                    </div>

                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ==========================================
            VIEW B: SIDE-BY-SIDE COMPARE PANEL ROWS
            ========================================== */}
        {isComparing && (
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in font-sans neon-shadow">
            
            {/* Filter toolbar to exit details */}
            <div className="flex justify-between items-center mb-8 border-b border-white/[0.04] pb-5">
              <h2 className="font-display text-3xl uppercase text-white flex items-center gap-2">
                <Scale className="w-7 h-7 text-[#BAFF00]" />
                <span>Side-By-Side Product Comparison</span>
              </h2>

              <button
                onClick={() => setIsComparing(false)}
                className="text-white/60 hover:text-white border border-white/15 hover:border-white px-5 py-2 rounded-full text-xs font-bold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Exit Comparison Specs</span>
              </button>
            </div>

            {/* COMPARE MATRIX GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
              
              {/* Row: Side Labels Column (visible on large screen) */}
              <div className="hidden md:flex flex-col gap-1 pr-6 font-mono text-[10px] text-white/40 justify-between py-2 uppercase tracking-wider font-semibold">
                <div className="h-28 flex items-center text-sm font-display text-white border-b border-white/[0.03] uppercase">Specifications Matrix</div>
                <div className="py-4 border-b border-white/[0.03]">Exclusive Welcome Match Offer</div>
                <div className="py-4 border-b border-white/[0.03]">Wagering Requirement Ratio</div>
                <div className="py-4 border-b border-white/[0.03]">Minimum Deposit Standard</div>
                <div className="py-4 border-b border-white/[0.03]">Payment approvals</div>
                <div className="py-4 border-b border-white/[0.03]">Approved Crypto Approved</div>
                <div className="py-4 border-b border-white/[0.03]">App Support Setup</div>
                <div className="h-20" /> {/* Empty buffer block */}
              </div>

              {/* Dynamic columns comparison mapping up to 3 casinos */}
              {comparisonCasinos.map((cas) => (
                <div key={cas.id} className="flex flex-col gap-1 py-4 md:py-0 md:px-6 justify-between select-none">
                  
                  {/* Headline Item card */}
                  <div className="h-28 flex items-center gap-3 border-b border-white/[0.03] pb-4">
                    <img src={cas.logo} alt={cas.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="font-display text-2xl text-white uppercase">{cas.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-[#BAFF00]">
                        <Star className="w-3.5 h-3.5 fill-[#BAFF00] stroke-[#BAFF00]" />
                        <span>{cas.rating} ★ Product Rating</span>
                      </div>
                    </div>
                  </div>

                  {/* Welcome match row */}
                  <div className="py-4 border-b border-white/[0.03] flex justify-between md:block">
                    <span className="md:hidden text-white/40 text-[9px] uppercase font-bold">Welcome Prize:</span>
                    <strong className="text-xs text-[#BAFF00] leading-snug tracking-wide uppercase">{cas.bonus_headline}</strong>
                  </div>

                  {/* Wagering requirement */}
                  <div className="py-4 border-b border-white/[0.03] flex justify-between md:block">
                    <span className="md:hidden text-white/40 text-[9px] uppercase font-bold">Wagering Requirement:</span>
                    <strong className="text-xs text-white font-mono">{cas.bonus_details.wagering} multiplier</strong>
                  </div>

                  {/* Minimum deposit required */}
                  <div className="py-4 border-b border-white/[0.03] flex justify-between md:block">
                    <span className="md:hidden text-white/40 text-[9px] uppercase font-bold">Min Deposit required:</span>
                    <strong className="text-xs text-white font-mono">{cas.bonus_details.min_deposit} minimum</strong>
                  </div>

                  {/* Payment Methods */}
                  <div className="py-4 border-b border-white/[0.03] flex justify-between md:block">
                    <span className="md:hidden text-white/40 text-[9px] uppercase font-bold">Payments:</span>
                    <div className="flex flex-wrap gap-1 md:mt-1">
                      {cas.payment_methods.slice(0, 3).map(p => (
                        <span key={p} className="bg-white/[0.03] border border-white/[0.04] text-[9.5px] px-2 py-0.5 rounded text-white/70">{p}</span>
                      ))}
                    </div>
                  </div>

                  {/* Extraction Timings Crypto */}
                  <div className="py-4 border-b border-white/[0.03] flex justify-between md:block">
                    <span className="md:hidden text-white/40 text-[9px] uppercase font-bold">Withdrawal speed:</span>
                    <span className="text-xs text-white/80 font-semibold">{cas.withdrawal_speed.crypto} speed</span>
                  </div>

                  {/* Mobile app integration details */}
                  <div className="py-4 border-b border-white/[0.03] flex justify-between md:block">
                    <span className="md:hidden text-white/40 text-[9px] uppercase font-bold">Device Wrap support:</span>
                    <span className="text-[10px] text-white/50 leading-normal block">{cas.app_info}</span>
                  </div>

                  {/* Call to action monetized affiliate button */}
                  <div className="pt-6">
                    <AffiliateButton
                      casino_id={cas.id}
                      casino_name={cas.name}
                      source_page="compare_table"
                      source_position="card_claim"
                      label={`Visit ${cas.name}`}
                      className="py-3 text-xs w-full"
                    />
                  </div>

                </div>
              ))}

              {/* Empty state filling grid spaces when comparison holds fewer than 3 */}
              {comparisonCasinos.length < 3 && Array.from({ length: 3 - comparisonCasinos.length }).map((_, i) => (
                <div key={i} className="hidden md:flex flex-col items-center justify-center p-8 text-center text-white/25 border-dashed border border-white/10 ml-6 rounded-2xl glass-panel">
                  <Heart className="w-8 h-8 opacity-40 mb-2" />
                  <span className="text-[10px] font-mono uppercase tracking-widest block">Slot open</span>
                  <p className="text-[9.5px] text-white/40 mt-1">Select an adjacent saved casino from the collection to populate comparison grids.</p>
                </div>
              ))}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
