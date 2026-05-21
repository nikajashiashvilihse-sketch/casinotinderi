import React, { useState } from "react";
import { Menu, X, Heart, ShieldAlert, Award } from "lucide-react";

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  likedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, likedCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "home" },
    { name: "Discover", path: "discover" },
    { name: "Reviews", path: "discover" }, // Reviews points to Discover where detail-expands live
    { name: "Saved Cards", path: "liked" },
    { name: "Blog Core", path: "blog" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent transition-all duration-300">
      {/* Top Affiliate Disclosure Strip */}
      <div className="w-full bg-[#141414]/90 border-b border-white/[0.04] py-1.5 px-4 text-center text-[11px] text-white/50 flex items-center justify-center gap-1.5 font-sans">
        <Award className="w-3.5 h-3.5 text-[#BAFF00]" />
        <span>CasinoSwipe earns a commission when you register via our links. This never impacts ratings. We only list licensed venues.</span>
      </div>

      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Branding */}
        <div 
          onClick={() => { onNavigate("home"); setIsOpen(false); }}
          className="flex items-center gap-1.5 cursor-pointer select-none group"
        >
          <span className="font-display text-2xl tracking-tight text-white transition-colors duration-200 group-hover:text-[#BAFF00]">
            Casino<span className="text-[#BAFF00]">Swipe</span>
          </span>
          <div className="w-2 h-2 rounded-full bg-[#BAFF00] animate-pulse shadow-[0_0_10px_#BAFF00]" />
        </div>

        {/* Center: Desktop Navigation links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.name}
                onClick={() => onNavigate(link.path)}
                className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 cursor-pointer ${
                  isActive 
                    ? "text-[#BAFF00] font-semibold" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => onNavigate("liked")}
            className="relative p-2 text-white/70 hover:text-[#BAFF00] transition-colors duration-150 cursor-pointer"
            title="Saved Casinos"
          >
            <Heart className="w-5 h-5" />
            {likedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#BAFF00] text-[#080808] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {likedCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => onNavigate("discover")}
            className="bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-full transition-all duration-300 transform active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(186,255,0,0.2)] hover:shadow-[0_0_25px_rgba(186,255,0,0.4)]"
          >
            Get Started
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => onNavigate("liked")}
            className="relative p-2 text-white/70 hover:text-[#BAFF00] transition-colors duration-150"
          >
            <Heart className="w-5 h-5" />
            {likedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#BAFF00] text-[#080808] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {likedCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white/80 hover:text-white cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drodown overlay navigation */}
      {isOpen && (
        <div className="absolute top-28 left-0 w-full bg-[#080808]/95 border-b border-white/[0.05] p-6 flex flex-col gap-5 md:hidden animate-fade-in z-40 transition-all duration-200">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => {
                    onNavigate(link.path);
                    setIsOpen(false);
                  }}
                  className={`text-left text-sm uppercase tracking-wider font-semibold py-2 transition-colors duration-150 ${
                    isActive ? "text-[#BAFF00]" : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>
          
          <div className="h-px bg-white/[0.05]" />
          
          <button
            onClick={() => {
              onNavigate("discover");
              setIsOpen(false);
            }}
            className="w-full bg-[#BAFF00] text-[#080808] text-center font-bold text-xs uppercase tracking-widest py-3 rounded-full shadow-lg"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
};
