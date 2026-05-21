import React, { useRef, useState, useEffect } from "react";
import { ArrowUpRight, ShieldCheck, Heart, Sparkles, HelpCircle } from "lucide-react";
import { Casino, OnboardingPreferences } from "../types";
import { Onboarding } from "../components/Onboarding";
import { MiniSwipeDemo } from "../components/MiniSwipeDemo";

interface LandingViewProps {
  casinos: Casino[];
  onNavigate: (path: string) => void;
  onSelectCasino: (slug: string) => void;
  detectedCountry: string;
  activeDeck: Casino[];
  deckIdx: number;
  setDeckIdx: React.Dispatch<React.SetStateAction<number>>;
  onLikeCasino: (casino: Casino) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  casinos,
  onNavigate,
  onSelectCasino,
  detectedCountry,
  activeDeck,
  deckIdx,
  setDeckIdx,
  onLikeCasino
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoOpacity, setVideoOpacity] = useState(0); // starts black, fades in
  const [showOnboarding, setShowOnboarding] = useState(false);

  // High-performance RAF animation tracker for seamless custom loop fades
  useEffect(() => {
    let animId: number;
    const checkTime = () => {
      const video = videoRef.current;
      if (video && video.duration && !video.paused) {
        const currentTime = video.currentTime;
        const duration = video.duration;

        let calculatedOpacity = 1;

        // 1. Initial Fade In: over first 1.0 second of playback
        if (currentTime < 1.0) {
          calculatedOpacity = currentTime / 1.0;
        }
        // 2. Final Fade Out: fade to black 1.5s before end, reaching 0 opacity at 0.3s before end
        else if (currentTime > duration - 1.5) {
          const fadeStart = duration - 1.5;
          const fadeEnd = duration - 0.3;
          if (currentTime >= fadeEnd) {
            calculatedOpacity = 0;
          } else {
            // Interpolate from 1 down to 0 over the 1.2 second range
            const ratio = (currentTime - fadeStart) / (fadeEnd - fadeStart);
            calculatedOpacity = Math.max(0, Math.min(1, 1 - ratio));
          }
        }

        setVideoOpacity(calculatedOpacity);
      }
      animId = requestAnimationFrame(checkTime);
    };

    animId = requestAnimationFrame(checkTime);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleOnboardingComplete = (prefs: OnboardingPreferences) => {
    // Save state and redirect straight to swipe discovery dashboard
    onNavigate("discover");
  };

  const handleSkipOnboarding = () => {
    onNavigate("discover");
  };

  // Top casinos preview matching design
  const featuredOnly = casinos.slice(0, 4);

  return (
    <div className="w-full relative min-h-screen">
      
      {/* SECTION 1: HERO VIEWPORT CONTAINER */}
      <section className="relative w-full lg:h-[100vh] h-auto min-h-[750px] overflow-hidden flex flex-col justify-center bg-black py-24 lg:py-0">
        {/* Loop background video */}
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260221_085953_8463b46e-ba85-4bb7-912a-1feaf346e970.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-150"
          style={{ opacity: videoOpacity }}
        />

        {/* Ambient Dark card back shadow wrapper */}
        <div className="absolute inset-x-0 bottom-0 lg:h-[70vh] h-full bg-gradient-to-t from-[#080808] via-[#080808]/85 to-[#080808]/20 pointer-events-none" />

        {/* Content pinned to bottom */}
        <div className="relative max-w-7xl mx-auto px-6 w-full z-10 select-none grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-16 lg:pt-0">
          
          {/* Column A: Left content detailing product value props */}
          <div className="lg:col-span-7 col-span-12 flex flex-col items-start gap-5 max-w-[640px]">
            {/* Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#BAFF00]/25 bg-[#080808]/75 backdrop-blur-sm text-xs text-[#BAFF00] font-sans font-medium">
              <span>🎰</span>
              <span>Discover Casinos Available in {detectedCountry}</span>
            </div>

            {/* Display Heading */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[0.95] text-white uppercase tracking-tight">
              Swipe Your Way <br/>
              to the <span className="text-[#BAFF00]">Perfect Casino</span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-[#FFFFFF]/70 leading-relaxed font-sans max-w-[540px]">
              Find casinos available in your country with the best welcome bonuses, your preferred games, and payment methods you actually use.
            </p>

            {/* Buttons UI */}
            <div className="flex flex-wrap items-center gap-4 mt-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setShowOnboarding(true);
                  setTimeout(() => {
                    const el = document.getElementById("onboarding-sec");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="w-full sm:w-auto bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 transform active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(186,255,0,0.3)] hover:shadow-[0_0_30px_rgba(186,255,0,0.6)]"
              >
                <span>Start Swiping</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("top-cas-sec");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 cursor-pointer"
              >
                See Top Bonuses
              </button>
            </div>
          </div>

          {/* Column B: Right Content featuring our live autoplaying swipe deck simulation */}
          <div className="lg:col-span-5 col-span-12 flex justify-center items-center w-full min-h-[460px]">
            <div className="relative w-full max-w-[340px] md:max-w-[360px]">
              {/* Outer Decorative floating elements */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#BAFF00]/10 to-transparent rounded-[36px] blur-3xl opacity-40 animate-pulse pointer-events-none" />
              <MiniSwipeDemo 
                activeDeck={activeDeck}
                deckIdx={deckIdx}
                setDeckIdx={setDeckIdx}
                onLikeCasino={onLikeCasino}
                onNavigate={onNavigate}
              />
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: INTERACTIVE ONBOARDING WIZARD */}
      <section id="onboarding-sec" className={`py-16 px-6 relative bg-[#080808] transition-all duration-500 ${showOnboarding ? "opacity-100" : "h-0 py-0 overflow-hidden opacity-0"}`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h3 className="font-display text-4xl text-white uppercase tracking-tight">Let&apos;s Personalize</h3>
            <p className="text-xs text-white/50">Configure your taste filters below and we will tailor-fit the swiping casino selection deck instantly.</p>
          </div>
          <Onboarding 
            onComplete={handleOnboardingComplete}
            onSkip={handleSkipOnboarding}
          />
        </div>
      </section>

      {/* SECTION 3: CORE HIGHLIGHT BANNER */}
      <section className="py-12 glass-panel border-y border-white/10 px-6 neon-shadow">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-start gap-2">
            <ShieldCheck className="w-6 h-6 text-[#BAFF00]" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#BAFF00]">Licensed Casinos</h4>
            <p className="text-[11px] text-white/45 leading-relaxed">Only verified & strictly regulated international operators get featured in our deck filters.</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Sparkles className="w-6 h-6 text-[#BAFF00]" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#BAFF00]">Custom Bonuses</h4>
            <p className="text-[11px] text-white/45 leading-relaxed">Manually verified promotions providing players premium wagering conditions daily.</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Heart className="w-6 h-6 text-[#BAFF00]" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#BAFF00]">Secure & Safe</h4>
            <p className="text-[11px] text-white/45 leading-relaxed">GDPR compliant hashing protects visitor identity limits securely.</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <HelpCircle className="w-6 h-6 text-[#BAFF00]" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#BAFF00]">Available In Country</h4>
            <p className="text-[11px] text-white/45 leading-relaxed">Silent Geo identification automatically matches legal options for your location.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY CASINOSWIPE GRID */}
      <section className="py-24 px-6 bg-[#080808]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          <div className="text-center flex flex-col gap-4 max-w-xl mx-auto">
            <h2 className="font-display text-5xl leading-none text-white uppercase">
              Why <span className="text-[#BAFF00]">CasinoSwipe?</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
              Traditional casino affiliate websites are cluttered with static spreadsheets and boring sales tables. CasinoSwipe puts the fun back into choosing. Discover tailored venues using simple swiping motions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel hover:bg-white/[0.06] hover:neon-border p-8 rounded-3xl transition-all duration-300 neon-shadow hover:scale-[1.03]">
              <span className="text-2xl font-bold text-[#BAFF00] font-mono">01</span>
              <h3 className="font-display text-2xl uppercase text-white mt-4 mb-2">Swipe To Choose</h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Drag cards left to skip or right to save into your saved collection instantly.
              </p>
            </div>

            <div className="glass-panel hover:bg-white/[0.06] hover:neon-border p-8 rounded-3xl transition-all duration-300 neon-shadow hover:scale-[1.03]">
              <span className="text-2xl font-bold text-[#BAFF00] font-mono">02</span>
              <h3 className="font-display text-2xl uppercase text-white mt-4 mb-2">Configure Interests</h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Filter by support for cryptocurrencies, welcome free spins, sportsbooks, or slots with the onboarding wizard.
              </p>
            </div>

            <div className="glass-panel hover:bg-white/[0.06] hover:neon-border p-8 rounded-3xl transition-all duration-300 neon-shadow hover:scale-[1.03]">
              <span className="text-2xl font-bold text-[#BAFF00] font-mono">03</span>
              <h3 className="font-display text-2xl uppercase text-white mt-4 mb-2">Compare side-by-side</h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Select up to three liked casinos and view limits, wagering thresholds, and support systems side by side.
              </p>
            </div>

            <div className="glass-panel hover:bg-white/[0.06] hover:neon-border p-8 rounded-3xl transition-all duration-300 neon-shadow hover:scale-[1.03]">
              <span className="text-2xl font-bold text-[#BAFF00] font-mono">04</span>
              <h3 className="font-display text-2xl uppercase text-white mt-4 mb-2">Secure Link Routing</h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Every click logs securely in the backend, routing through licensed links to claim exclusive deposit boosts without any exposure.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: TOP CASINOS REVEAL GRID */}
      <section id="top-cas-sec" className="py-24 px-6 bg-[#080808] border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-5xl leading-none text-white uppercase">
                Top <span className="text-[#BAFF00]">Casinos This Week</span>
              </h2>
              <p className="text-xs text-white/50 font-sans">Handpicked casinos presenting premium player ratings in {detectedCountry}.</p>
            </div>
            
            <button
              onClick={() => onNavigate("discover")}
              className="px-6 py-2.5 bg-white/5 hover:bg-[#BAFF00]/10 border border-white/10 hover:border-[#BAFF00]/35 text-xs font-bold text-white uppercase tracking-widest rounded-full transition-all cursor-pointer"
            >
              Launch Swipe Simulator
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredOnly.map((cas) => (
              <div 
                key={cas.id}
                onClick={() => onSelectCasino(cas.slug)}
                className="group relative card-gradient neon-border neon-shadow rounded-3xl py-6 px-5 transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:glow-card-active"
              >
                {/* Visual Accent */}
                <div className="absolute top-4 right-4 flex gap-1.5 items-center">
                  {cas.tags.includes("New") && (
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#BAFF00] text-black rounded-md">New</span>
                  )}
                  {cas.tags.includes("🔥 Hot Today") && (
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#FF4058] text-white rounded-md">Hot</span>
                  )}
                </div>

                <div className="flex items-center gap-3.5 mb-5">
                  <img
                    src={cas.logo}
                    alt={cas.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase tracking-tight">{cas.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/55">
                      <span className="text-[#BAFF00] font-sans">&bull;</span>
                      <span className="font-mono text-[10.5px]">Curaçao Licenses</span>
                    </div>
                  </div>
                </div>

                {/* Promo Display */}
                <div className="glass-pill rounded-2xl p-4 flex flex-col gap-1 mb-6">
                  <span className="text-[9.5px] uppercase font-mono tracking-widest text-[#BAFF00]">Welcome Deal</span>
                  <div className="font-display text-xl text-white tracking-wide uppercase leading-tight line-clamp-2">
                    {cas.bonus_headline}
                  </div>
                </div>

                {/* Mini coordinates */}
                <div className="flex justify-between items-center text-xs text-white/45 font-mono mb-6">
                  <span>Rating: <strong className="text-white font-sans">{cas.rating} ★</strong></span>
                  <span>Liked: <strong className="text-white font-sans">{cas.liked_percent}%</strong></span>
                </div>

                {/* Read Reviews Link Trigger */}
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectCasino(cas.slug); }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 rounded-full text-center transition-all"
                >
                  View Full Metrics
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>
      
    </div>
  );
};
