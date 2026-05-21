import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Confetti } from "./components/Confetti";
import { INITIAL_CASINOS } from "./data";
import { Casino } from "./types";
import { safeLocalStorage } from "./utils";

// Import Views
import { LandingView } from "./views/LandingView";
import { DiscoverView } from "./views/DiscoverView";
import { CasinoDetailView } from "./views/CasinoDetailView";
import { LikedView } from "./views/LikedView";
import { BlogView } from "./views/BlogView";
import { ResponsibleView } from "./views/ResponsibleView";
import { AboutView } from "./views/AboutView";
import { AdminView } from "./views/AdminView";

export default function App() {
  const [currentPath, setCurrentPath] = useState("home");
  const [casinos, setCasinos] = useState<Casino[]>(INITIAL_CASINOS);
  const [likedCasinos, setLikedCasinos] = useState<Casino[]>([]);
  const [detectedCountry, setDetectedCountry] = useState("Germany");
  const [confettiActive, setConfettiActive] = useState(false);

  // Custom cursor state for desktop premium screens
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  // Shared swiping states to connect the homepage deck and the discover page deck
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("All");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>("All");
  const [selectedBonusFilter, setSelectedBonusFilter] = useState<string>("All");
  const [activeDeck, setActiveDeck] = useState<Casino[]>([]);
  const [deckIdx, setDeckIdx] = useState<number>(0);

  // Shared filtration effect
  useEffect(() => {
    let filtered = casinos.filter(c => c.is_active);

    // 1. Filter by country license (must be eligible in country)
    if (detectedCountry) {
      filtered = filtered.filter(c => 
        c.country_licenses.includes(detectedCountry) || 
        c.country_licenses.length === 0
      );
    }

    // 2. Filter by game type preference
    if (selectedGameFilter !== "All") {
      filtered = filtered.filter(c => c.game_types.includes(selectedGameFilter));
    }

    // 3. Filter by payment methods preference
    if (selectedPaymentFilter !== "All") {
      filtered = filtered.filter(c => c.payment_methods.includes(selectedPaymentFilter));
    }

    // 4. Filter by bonus layout preference
    if (selectedBonusFilter !== "All") {
      filtered = filtered.filter(c => 
        c.bonus_headline.toLowerCase().includes(selectedBonusFilter.toLowerCase()) || 
        c.bonus_details.vip_cashback?.toLowerCase().includes(selectedBonusFilter.toLowerCase())
      );
    }

    // Sort to prioritize sponsored placements
    filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));

    setActiveDeck(filtered);
    setDeckIdx(0);
  }, [casinos, detectedCountry, selectedGameFilter, selectedPaymentFilter, selectedBonusFilter]);

  // Affiliate URL Redirect logic with registered affiliate click ID
  const redirectToAffiliate = async (casino: Casino) => {
    try {
      let user_country = detectedCountry || "Global";
      let user_preferences = { games: [], payments: [], bonusType: "Welcome Match" };

      try {
        const storedGeo = safeLocalStorage.getItem("casinoswipe_detected_geo");
        if (storedGeo) {
          const parsedGeo = JSON.parse(storedGeo);
          if (parsedGeo.country_name) user_country = parsedGeo.country_name;
        }
        
        const storedPrefs = safeLocalStorage.getItem("casinoswipe_onboarding_prefs");
        if (storedPrefs) {
          user_preferences = JSON.parse(storedPrefs);
        }
      } catch (err) {
        console.error("Error reading stored user config", err);
      }

      const response = await fetch("/api/affiliate/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          casino_id: casino.id,
          source_page: currentPath === "home" ? "homepage" : currentPath,
          source_position: "swipe_like",
          user_country,
          user_preferences
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.redirect_url) {
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "affiliate_click", {
              casino_name: casino.name,
              source_page: currentPath,
              source_position: "swipe_like",
              click_id: data.click_id
            });
          }
          window.open(data.redirect_url, "_blank", "noopener,noreferrer");
        }
      }
    } catch (err) {
      console.error("Direct redirect from swipe liked action failed:", err);
    }
  };

  // Sync saved bookmarks from storage on init
  useEffect(() => {
    try {
      const stored = safeLocalStorage.getItem("casinoswipe_liked_collection");
      if (stored) {
        const parsed = JSON.parse(stored);
        setLikedCasinos(parsed);
      }
    } catch (err) {
      console.error("Error loading liked items from storage", err);
    }
  }, []);

  // Sync custom cursor movements on standard desktop width
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleHoverCheck = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) {
        setIsHoveringClickable(false);
        return;
      }
      try {
        const isClickable = 
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "SELECT" ||
          target.tagName === "OPTION" ||
          (typeof target.closest === "function" && (target.closest("button") || target.closest("a"))) ||
          (target.style && target.style.cursor === "pointer") ||
          (target.classList && typeof target.classList.contains === "function" && target.classList.contains("cursor-pointer"));
        
        setIsHoveringClickable(!!isClickable);
      } catch (err) {
        // Silently recover to avoid halting the event loop or crashing the screen
        setIsHoveringClickable(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleHoverCheck);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleHoverCheck);
    };
  }, []);

  // Fetch live active casinos list from Express API
  const fetchCasinos = async () => {
    try {
      const res = await fetch("/api/casinos");
      if (res.ok) {
        const data = await res.json();
        setCasinos(data);
      }
    } catch (err) {
      console.warn("Express /api/casinos was offline, using seeded fallback", err);
    }
  };

  useEffect(() => {
    fetchCasinos();
  }, []);

  // Route parser state modifier
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCasino = (slug: string) => {
    setCurrentPath(`casino_${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add liked card casino item to profile collections
  const handleLikeCasino = (casino: Casino) => {
    if (likedCasinos.some((x) => x.id === casino.id)) {
      redirectToAffiliate(casino);
      return;
    }

    const updated = [...likedCasinos, casino];
    setLikedCasinos(updated);
    safeLocalStorage.setItem("casinoswipe_liked_collection", JSON.stringify(updated));

    // Trigger celebratory particle confetti burst
    setConfettiActive(true);

    // Redirect to partner site with active click ID tracker
    redirectToAffiliate(casino);
  };

  // Remove liked bookmarked item
  const handleRemoveLiked = (id: string) => {
    const updated = likedCasinos.filter((x) => x.id !== id);
    setLikedCasinos(updated);
    safeLocalStorage.setItem("casinoswipe_liked_collection", JSON.stringify(updated));
  };

  // Wipe bookmark collection completely
  const handleClearAllLiked = () => {
    setLikedCasinos([]);
    safeLocalStorage.setItem("casinoswipe_liked_collection", JSON.stringify([]));
  };

  // Side-by-side related casinos mapping selection
  const getRelatedCasinos = (curCasino: Casino) => {
    return casinos.filter((c) => c.id !== curCasino.id).slice(0, 3);
  };

  return (
    <div className="relative min-h-screen bg-[#080808] text-[#FFFFFF] font-sans flex flex-col justify-between overflow-x-hidden selection:bg-[#BAFF00] selection:text-[#080808]">
      
      {/* 1. CUSTOM BRAND CURSOR (visible only on desktop) */}
      <div 
        className={`hidden lg:block custom-cursor ${isHoveringClickable ? "bg-[#BAFF00]/40 w-10 h-10 border-[#BAFF00]" : ""}`}
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`
        }}
      />

      {/* 2. PERSISTENT GLOBAL HEADER NAVBAR */}
      <Navbar 
        currentPath={currentPath}
        onNavigate={handleNavigate}
        likedCount={likedCasinos.length}
      />

      {/* 3. HERO PARTICLES LAUNCHER CONSOLE */}
      <Confetti 
        active={confettiActive} 
        onComplete={() => setConfettiActive(false)} 
      />

      {/* ==========================================
          DYNAMIC CENTRAL ROUTER MATRICES
          ========================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto z-10">
        {currentPath === "home" && (
          <LandingView 
            casinos={casinos}
            onNavigate={handleNavigate}
            onSelectCasino={handleSelectCasino}
            detectedCountry={detectedCountry}
            activeDeck={activeDeck}
            deckIdx={deckIdx}
            setDeckIdx={setDeckIdx}
            onLikeCasino={handleLikeCasino}
          />
        )}

        {currentPath === "discover" && (
          <DiscoverView 
            casinos={casinos}
            onNavigate={handleNavigate}
            onLikeCasino={handleLikeCasino}
            likedCasinosList={likedCasinos}
            onSelectCasino={handleSelectCasino}
            detectedCountry={detectedCountry}
            setDetectedCountry={setDetectedCountry}
            activeDeck={activeDeck}
            deckIdx={deckIdx}
            setDeckIdx={setDeckIdx}
            selectedGameFilter={selectedGameFilter}
            setSelectedGameFilter={setSelectedGameFilter}
            selectedPaymentFilter={selectedPaymentFilter}
            setSelectedPaymentFilter={setSelectedPaymentFilter}
            selectedBonusFilter={selectedBonusFilter}
            setSelectedBonusFilter={setSelectedBonusFilter}
          />
        )}

        {currentPath === "liked" && (
          <LikedView 
            likedCasinos={likedCasinos}
            onRemoveLiked={handleRemoveLiked}
            onClearAll={handleClearAllLiked}
            onSelectCasino={handleSelectCasino}
            onNavigate={handleNavigate}
          />
        )}

        {currentPath === "blog" && (
          <BlogView 
            casinos={casinos}
            onNavigate={handleNavigate}
            onSelectCasino={handleSelectCasino}
          />
        )}

        {currentPath === "responsible-gambling" && <ResponsibleView />}

        {currentPath === "about" && <AboutView />}

        {currentPath === "admin" && (
          <AdminView 
            onBack={() => handleNavigate("home")} 
          />
        )}

        {/* Dynamic Detail specs resolution (e.g., path matches "casino_xxx") */}
        {currentPath.startsWith("casino_") && (() => {
          const slug = currentPath.replace("casino_", "");
          const targetCas = casinos.find((c) => c.slug === slug);
          if (targetCas) {
            return (
              <CasinoDetailView 
                casino={targetCas}
                onBack={() => handleNavigate("discover")}
                onNavigate={handleNavigate}
                relatedCasinos={getRelatedCasinos(targetCas)}
              />
            );
          }
          return <p className="text-white text-center pt-32">Operator not found.</p>;
        })()}
      </main>

      {/* 4. PERSISTENT SAFETY FOOTER */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}
