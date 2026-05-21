import React, { useState } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { OnboardingPreferences } from "../types";
import { safeLocalStorage } from "../utils";

interface OnboardingProps {
  onComplete: (prefs: OnboardingPreferences) => void;
  onSkip: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectedBonus, setSelectedBonus] = useState<string>("");

  const gamesList = [
    "Slots",
    "Crash Games",
    "Live Casino",
    "Sports Betting",
    "Poker",
    "Crypto Games"
  ];

  const paymentsList = [
    "Crypto",
    "Credit Card",
    "PayPal",
    "Bank Transfer",
    "e-Wallets"
  ];

  const bonusesList = [
    "Welcome Match",
    "Free Spins",
    "No Deposit Bonus",
    "VIP Cashback"
  ];

  const handleToggleGame = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter((g) => g !== game));
    } else {
      setSelectedGames([...selectedGames, game]);
    }
  };

  const handleTogglePayment = (payment: string) => {
    if (selectedPayments.includes(payment)) {
      setSelectedPayments(selectedPayments.filter((p) => p !== payment));
    } else {
      setSelectedPayments([...selectedPayments, payment]);
    }
  };

  const currentProgressPercent = (step / 3) * 100;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const finalPrefs: OnboardingPreferences = {
        games: selectedGames.length > 0 ? selectedGames : ["Slots", "Crash Games"],
        payments: selectedPayments.length > 0 ? selectedPayments : ["Crypto"],
        bonusType: selectedBonus || "Welcome Match"
      };
      
      safeLocalStorage.setItem("casinoswipe_onboarding_prefs", JSON.stringify(finalPrefs));
      onComplete(finalPrefs);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#141414] border border-white/[0.05] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Onboarding progress bar at the top */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-white/[0.03]">
        <div 
          className="h-full bg-[#BAFF00] transition-all duration-300"
          style={{ width: `${currentProgressPercent}%` }}
        />
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#BAFF00] font-bold">
          Step {step} of 3
        </span>
        <button
          onClick={onSkip}
          className="text-[11px] uppercase tracking-wider font-semibold text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Skip Wizard
        </button>
      </div>

      {/* Step View Content */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-4xl leading-none text-white uppercase tracking-tight mb-2">
            What games do you enjoy?
          </h2>
          <p className="text-sm text-white/60 mb-6">
            Select your preferred styles. We will rank casinos with custom matching games higher in your stack.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {gamesList.map((game) => {
              const remains = selectedGames.includes(game);
              return (
                <div
                  key={game}
                  onClick={() => handleToggleGame(game)}
                  className={`border p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between relative select-none ${
                    remains
                      ? "border-[#BAFF00] bg-[#BAFF00]/[0.05] shadow-[0_0_15px_rgba(186,255,0,0.08)] scale-102"
                      : "border-white/[0.06] hover:border-white/20 bg-[#222222]/45 hover:bg-[#222222]"
                  }`}
                >
                  <span className="text-xs font-semibold text-white tracking-wide">{game}</span>
                  {remains && (
                    <div className="w-5 h-5 rounded-full bg-[#BAFF00] flex items-center justify-center text-[#080808]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-4xl leading-none text-white uppercase tracking-tight mb-2">
            Your preferred payments?
          </h2>
          <p className="text-sm text-white/60 mb-6">
            Select how you fund your account. We will exclude casinos that don&apos;t support these methods.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {paymentsList.map((pay) => {
              const remains = selectedPayments.includes(pay);
              return (
                <div
                  key={pay}
                  onClick={() => handleTogglePayment(pay)}
                  className={`border p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between relative select-none ${
                    remains
                      ? "border-[#BAFF00] bg-[#BAFF00]/[0.05] shadow-[0_0_15px_rgba(186,255,0,0.08)] scale-102"
                      : "border-white/[0.06] hover:border-white/20 bg-[#222222]/45 hover:bg-[#222222]"
                  }`}
                >
                  <span className="text-xs font-semibold text-white tracking-wide">{pay}</span>
                  {remains && (
                    <div className="w-5 h-5 rounded-full bg-[#BAFF00] flex items-center justify-center text-[#080808]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-4xl leading-none text-white uppercase tracking-tight mb-2">
            Select Your Welcome Bonus
          </h2>
          <p className="text-sm text-white/60 mb-6">
            Tell us which premium incentives attract you the most. We will surface your target bonus first.
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {bonusesList.map((bonus) => {
              const remains = selectedBonus === bonus;
              return (
                <div
                  key={bonus}
                  onClick={() => setSelectedBonus(bonus)}
                  className={`border p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between relative select-none ${
                    remains
                      ? "border-[#BAFF00] bg-[#BAFF00]/[0.05] shadow-[0_0_15px_rgba(186,255,0,0.08)] scale-101"
                      : "border-white/[0.06] hover:border-white/20 bg-[#222222]/45 hover:bg-[#222222]"
                  }`}
                >
                  <span className="text-xs font-semibold text-white tracking-wide">{bonus}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    remains ? "border-[#BAFF00] bg-[#BAFF00] text-[#080808]" : "border-white/20 bg-transparent"
                  }`}>
                    {remains && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary footer buttons */}
      <div className="flex gap-4 items-center">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 border border-white/10 hover:border-white/20 text-white font-semibold text-xs uppercase tracking-wider py-4 rounded-xl transition-colors duration-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
        
        <button
          onClick={handleNext}
          className="flex-[2] bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(186,255,0,0.25)]"
        >
          <span>{step === 3 ? "Complete" : "Continue"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
