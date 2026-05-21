import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { Heart, X, Star, HandMetal, RefreshCw, Compass } from "lucide-react";
import { Casino } from "../types";

interface MiniSwipeDemoProps {
  activeDeck: Casino[];
  deckIdx: number;
  setDeckIdx: React.Dispatch<React.SetStateAction<number>>;
  onLikeCasino: (casino: Casino) => void;
  onNavigate?: (path: string) => void;
}

export const MiniSwipeDemo: React.FC<MiniSwipeDemoProps> = ({
  activeDeck,
  deckIdx,
  setDeckIdx,
  onLikeCasino,
  onNavigate
}) => {
  const [swipeDir, setSwipeDir] = useState<"like" | "skip" | null>(null);
  const [animatingCardId, setAnimatingCardId] = useState<string | null>(null);
  
  // Drag handling mechanics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-12, 12]);
  const likeOpacity = useTransform(x, [20, 80], [0, 1]);
  const skipOpacity = useTransform(x, [-80, -20], [1, 0]);

  // Track the last time a user interacted so we don't disrupt active play
  const lastInteractionTime = useRef<number>(Date.now());

  // Automatic swiping task scheduling for visual illustration on Landing view
  useEffect(() => {
    const timer = setInterval(() => {
      const timeSinceInteract = Date.now() - lastInteractionTime.current;
      // If 4.5 seconds have passed without manual clicks/drags, and cards remain, auto swipe the deck
      if (timeSinceInteract > 4500 && animatingCardId === null && activeDeck && deckIdx < activeDeck.length) {
        // Randomly choose to skip or like
        const isLike = Math.random() > 0.45;
        triggerSwipe(isLike ? "like" : "skip", false);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [animatingCardId, activeDeck, deckIdx]);

  const triggerSwipe = (direction: "like" | "skip", isManual: boolean = false) => {
    if (!activeDeck || deckIdx >= activeDeck.length || animatingCardId) return;
    
    setSwipeDir(direction);
    const topCard = activeDeck[deckIdx];
    setAnimatingCardId(topCard.id);

    // Coordinate the transition duration before advancing deck
    setTimeout(() => {
      if (isManual && direction === "like") {
        onLikeCasino(topCard);
      }
      setDeckIdx(prev => prev + 1);
      setSwipeDir(null);
      setAnimatingCardId(null);
      x.set(0); // Reset drag coordinate
    }, 450);
  };

  const handleManualAction = (direction: "like" | "skip") => {
    lastInteractionTime.current = Date.now();
    triggerSwipe(direction, true);
  };

  const handleDragEnd = (_event: any, info: any) => {
    lastInteractionTime.current = Date.now();
    const swipeThreshold = 80;
    if (info.offset.x > swipeThreshold) {
      triggerSwipe("like", true);
    } else if (info.offset.x < -swipeThreshold) {
      triggerSwipe("skip", false);
    } else {
      x.set(0); // bounce back
    }
  };

  // Extract visible slice
  const visibleCards = activeDeck ? activeDeck.slice(deckIdx, deckIdx + 3) : [];
  const isOutOfCards = !activeDeck || deckIdx >= activeDeck.length;

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[340px] md:max-w-[360px] mx-auto py-4">
      {/* Visual Instruction Label */}
      <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-[#BAFF00] font-bold mb-4 bg-[#BAFF00]/10 px-3 py-1 rounded-full border border-[#BAFF00]/15 animate-pulse">
        <HandMetal className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Try Swiping or Watch Direct</span>
      </div>

      {/* Interactive Deck Chassis Container */}
      <div className="relative w-full aspect-[3/4] h-[400px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {isOutOfCards ? (
            <motion.div
              key="empty-demo-state"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute w-full h-full card-gradient rounded-[28px] p-6 text-center border border-white/10 flex flex-col justify-between neon-shadow"
            >
              <div className="my-auto flex flex-col gap-4 items-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#BAFF00]">
                  <Compass className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-display text-2xl uppercase text-white tracking-wide">Deck Completed!</h4>
                  <p className="text-[11px] text-white/50 px-2 mt-1">
                    You have browsed all qualified casinos available in your region. Customize tags or go to the interactive hub.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate("discover")}
                    className="w-full bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(186,255,0,0.15)]"
                  >
                    <Compass className="w-4 h-4" />
                    <span>LAUNCH ADVANCED FILTERS</span>
                  </button>
                )}
                <button
                  onClick={() => setDeckIdx(0)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RESET CARD DECK</span>
                </button>
              </div>
            </motion.div>
          ) : (
            visibleCards.map((casino, index) => {
              const idx = index; // 0 for the top card
              const isTop = idx === 0;
              const isAnimating = animatingCardId === casino.id;
              
              let animateX = 0;
              let animateRotate = 0;
              let animateScale = 1 - idx * 0.04;
              let animateY = idx * 10;
              let opacityValue = 1;

              if (isAnimating) {
                animateX = swipeDir === "like" ? 350 : -350;
                animateRotate = swipeDir === "like" ? 25 : -25;
                opacityValue = 0;
              }

              return (
                <motion.div
                  key={casino.id}
                  drag={isTop && !isAnimating ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  style={isTop ? { x, rotate } : {}}
                  onDragStart={() => { lastInteractionTime.current = Date.now(); }}
                  onDragEnd={isTop ? handleDragEnd : undefined}
                  animate={{
                    x: isTop && isAnimating ? animateX : 0,
                    rotate: isTop && isAnimating ? animateRotate : 0,
                    scale: animateScale,
                    y: isTop ? 0 : animateY,
                    opacity: opacityValue,
                    zIndex: visibleCards.length - idx,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`absolute w-full h-full card-gradient rounded-[28px] p-5 neon-border neon-shadow flex flex-col justify-between cursor-grab active:cursor-grabbing transform-gpu border border-white/10 ${
                    isTop ? "shadow-2xl hover:border-white/15" : "pointer-events-none opacity-80"
                  }`}
                >
                  {/* LIKE OR SKIP INDICATOR STAMPS (Active during automatic swipe or drags) */}
                  {isTop && (
                    <>
                      <motion.div
                        style={{ opacity: swipeDir === "like" ? 1 : likeOpacity }}
                        className="absolute top-6 left-6 border-4 border-[#BAFF00] text-[#BAFF00] font-display text-3xl uppercase tracking-widest px-3 py-1 rounded-xl rotate-[-12deg] z-50 pointer-events-none"
                      >
                        ♥ LIKE
                      </motion.div>
                      <motion.div
                        style={{ opacity: swipeDir === "skip" ? 1 : skipOpacity }}
                        className="absolute top-6 right-6 border-4 border-[#FF4058] text-[#FF4058] font-display text-3xl uppercase tracking-widest px-3 py-1 rounded-xl rotate-[12deg] z-50 pointer-events-none"
                      >
                        ✕ SKIP
                      </motion.div>
                    </>
                  )}

                  {/* Card Content Top Header */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={casino.logo}
                          alt={casino.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/15"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-display text-xl text-white tracking-wide uppercase leading-tight">{casino.name}</h4>
                          <div className="flex items-center gap-1 text-[9.5px] text-white/50 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#BAFF00] animate-pulse" />
                            <span>Vetted Licence</span>
                          </div>
                        </div>
                      </div>

                      {casino.is_featured && (
                        <div className="bg-[#BAFF00]/10 border border-[#BAFF00]/25 text-[#BAFF00] text-[8px] font-bold uppercase py-0.5 px-2 rounded-md">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Splash Bonus Block */}
                    <div className="glass-pill rounded-xl px-4 py-3 flex flex-col justify-center gap-0.5 mt-1 border border-white/5 shadow-inner">
                      <span className="text-[8px] uppercase tracking-widest font-mono text-[#BAFF00] font-bold">Guaranteed Deal</span>
                      <h5 className="font-display text-base text-white/95 leading-tight uppercase font-medium">
                        {casino.bonus_headline}
                      </h5>
                    </div>

                    {/* Game Genre tags lists */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {casino.game_types.slice(0, 3).map(g => (
                        <span key={g} className="text-[8.5px] font-sans font-bold uppercase tracking-wider bg-white/5 text-white/70 px-2 py-0.5 rounded-full border border-white/5">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Score stats at bottom */}
                  <div className="grid grid-cols-3 gap-1.5 text-center border-t border-white/5 pt-3.5 font-mono text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-white font-sans font-semibold text-[11px] inline-flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-[#BAFF00] stroke-[#BAFF00]" />
                        {casino.rating}
                      </span>
                      <span className="text-white/40 text-[8px] uppercase font-bold">Rating</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{casino.liked_percent}%</span>
                      <span className="text-white/40 text-[8px] uppercase font-bold">Liked</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#66FF03] font-bold inline-flex items-center justify-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#66FF03] animate-ping" />
                        {casino.live_players.toLocaleString()}
                      </span>
                      <span className="text-white/40 text-[8px] uppercase font-bold">Active</span>
                    </div>
                  </div>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Manual Action Buttons (Matches Discover deck styling) */}
      {!isOutOfCards && (
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={() => handleManualAction("skip")}
            disabled={animatingCardId !== null}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-[#FF4058]/20 text-[#FF4058] hover:bg-[#FF4058]/10 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,64,88,0.06)] cursor-pointer"
            title="Skip/Dismiss Casino"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={() => handleManualAction("like")}
            disabled={animatingCardId !== null}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#BAFF00] text-[#080808] hover:bg-[#66FF03] active:scale-95 transition-all shadow-[0_0_20px_rgba(186,255,0,0.3)] cursor-pointer"
            title="Save and Launch Deal!"
          >
            <Heart className="w-6 h-6 fill-current stroke-current" />
          </button>
        </div>
      )}
    </div>
  );
};
