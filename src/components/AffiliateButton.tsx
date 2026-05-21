import React, { useState } from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
import { safeLocalStorage } from "../utils";

interface AffiliateButtonProps {
  casino_id: string;
  casino_name: string;
  source_page: string;
  source_position: string;
  label: string;
  className?: string;
  icon?: boolean;
}

export const AffiliateButton: React.FC<AffiliateButtonProps> = ({
  casino_id,
  casino_name,
  source_page,
  source_position,
  label,
  className = "",
  icon = true
}) => {
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop parent clicks e.g. card expands
    if (loading) return;

    setLoading(true);
    setToastMessage(null);

    try {
      // Gather active onboarding preferences from localStorage if any
      let user_country = "Global";
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

      // Log the click and obtain cloaked tracking affiliate link
      const response = await fetch("/api/affiliate/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          casino_id,
          source_page,
          source_position,
          user_country,
          user_preferences
        })
      });

      if (!response.ok) {
        throw new Error("Server returned error response for affiliate generation");
      }

      const data = await response.json();
      
      if (data.redirect_url) {
        // Log GTAG marketing coordinates if present
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "affiliate_click", {
            casino_name,
            source_page,
            source_position,
            click_id: data.click_id
          });
        }

        // Redirect safely in a new tab
        window.open(data.redirect_url, "_blank", "noopener,noreferrer");
        
        // Show momentary toast feedback
        setToastMessage(`Redirecting to ${casino_name}...`);
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        throw new Error("Missing redirect link in payload");
      }
    } catch (err) {
      console.error("Affiliate redirect failure", err);
      // Trigger user-friendly mini-alert toast
      setToastMessage("Something went wrong, please try again.");
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block w-full">
      <button
        id={`aff-btn-${casino_id}`}
        onClick={handleClick}
        disabled={loading}
        className={`w-full bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-semibold py-3 px-6 rounded-full inline-flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-50 select-none cursor-pointer hover:shadow-[0_0_20px_rgba(186,255,0,0.3)] ${className}`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>{label}</span>
            {icon && <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
          </>
        )}
      </button>

      {/* Floating mini-toast coordinates */}
      {toastMessage && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#222222] border border-[#BAFF00]/30 text-white text-xs py-1.5 px-3 rounded-md whitespace-nowrap z-50 shadow-lg animate-bounce font-sans">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
