import React, { useState, useEffect } from "react";
import { ShieldCheck, Info } from "lucide-react";
import { safeLocalStorage } from "../utils";

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const isDismissed = safeLocalStorage.getItem("casinoswipe_cookie_dismissed");
    if (!isDismissed) {
      setShowCookieBanner(true);
    }
  }, []);

  const dismissCookie = () => {
    safeLocalStorage.setItem("casinoswipe_cookie_dismissed", "true");
    setShowCookieBanner(false);
  };

  return (
    <footer className="w-full bg-[#141414] border-t border-white/[0.05] py-16 px-6 font-sans mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
        {/* Left Side: Brand info & warnings */}
        <div className="max-w-md flex flex-col gap-5">
          <div className="flex items-center gap-1.5 select-none text-2xl font-display tracking-wide uppercase">
            <span>Casino<span className="text-[#BAFF00]">Swipe</span></span>
            <div className="w-2 h-2 rounded-full bg-[#BAFF00]" />
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            CasinoSwipe is an independent comparison website designed for digital gambling enthusiasts. Our focus is helping visitors discover legitimate online platforms. All listings operate with valid international licensing schemas. We are not a casino operator.
          </p>
          <div className="flex items-center gap-3 text-white/80 font-mono text-xs font-bold bg-white/[0.02] border border-white/[0.04] py-2.5 px-4 rounded-xl w-fit">
            <span className="text-[#FF4058] text-sm animate-pulse font-sans">18+</span>
            <span className="text-[10px] tracking-wider uppercase">Bet Responsibly &bull; Play Safely</span>
          </div>
        </div>

        {/* Center/Right Hand Side: Menu Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold text-[#BAFF00] tracking-widest uppercase mb-1">Navigation</h4>
            <button onClick={() => onNavigate("home")} className="text-left text-xs text-white/60 hover:text-white cursor-pointer transition-colors">Home Landing</button>
            <button onClick={() => onNavigate("discover")} className="text-left text-xs text-white/60 hover:text-white cursor-pointer transition-colors">Discover Deck</button>
            <button onClick={() => onNavigate("blog")} className="text-left text-xs text-white/60 hover:text-white cursor-pointer transition-colors">Blogs & SEO</button>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold text-[#BAFF00] tracking-widest uppercase mb-1">Legals</h4>
            <button onClick={() => onNavigate("responsible-gambling")} className="text-left text-xs text-white/60 hover:text-white cursor-pointer transition-colors">Responsible Gaming</button>
            <button onClick={() => onNavigate("about")} className="text-left text-xs text-white/60 hover:text-white cursor-pointer transition-colors">About Story</button>
            <button onClick={() => onNavigate("admin")} className="text-left text-xs text-white/60 hover:text-white cursor-pointer transition-colors">Admin Dashboard</button>
          </div>

          <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
            <h4 className="text-[11px] font-semibold text-[#BAFF00] tracking-widest uppercase mb-1">Partnerships</h4>
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5">
              <span>BeGambleAware.org</span>
            </a>
            <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5">
              <span>GamCare support</span>
            </a>
            <a href="https://www.gamstop.co.uk" target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5">
              <span>GamStop self-exclude</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-px bg-white/[0.05] mb-8" />

      {/* Licensing details */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/35">
        <div className="flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#BAFF00]" />
          <span>Copyright &copy; 2026 CASINOSWIPE. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">BeGambleAware</a>
          <a href="#gamstop" className="hover:text-white transition-colors">GamStop Exclusion</a>
          <a href="#about" className="hover:text-white transition-colors">Cookie Declarations</a>
        </div>
      </div>

      {/* GDPR cookie consent banner */}
      {showCookieBanner && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-[#141414] border border-white/[0.1] rounded-2xl p-5 shadow-2xl z-50 flex flex-col gap-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#BAFF00] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5">
              <h5 className="text-xs font-bold text-white tracking-wide">Cookie and Privacy Consent</h5>
              <p className="text-[10.5px] text-white/60 leading-normal">
                We utilize minimal client browser cookies to record your filtering configurations and custom bookmark preferences to refine your discovered recommendations.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={dismissCookie}
              className="bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-[10px] tracking-widest uppercase py-2 px-4 rounded-full cursor-pointer transition-all duration-150"
            >
              Consent Accept
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
