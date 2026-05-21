import React from "react";
import { Sparkles, Star, ShieldCheck, Mail } from "lucide-react";

export const AboutView: React.FC = () => {
  return (
    <div className="w-full min-h-screen pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-8 font-sans">
        
        <div className="flex items-center gap-3 border-b border-white/[0.04] pb-6">
          <Sparkles className="w-10 h-10 text-[#BAFF00]" />
          <div>
            <h1 className="font-display text-4xl uppercase text-white tracking-wide">About CasinoSwipe</h1>
            <p className="text-xs text-white/50">Redefining online casino discovery through interactive gamified experiences.</p>
          </div>
        </div>

        <section className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-4 neon-shadow">
          <h2 className="font-display text-3xl uppercase text-white">Our Mission</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Online casino affiliate Marketing is full of old, hard-to-navigate lists and spreadsheet grids trying to push whatever offer pays them the highest fees. We built <strong>CasinoSwipe</strong> representing the absolute opposite theory.
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            By putting Tinder-style swipe mechanics at the core of our website, we let players discover online casinos that organically match their game, bonus, and payment tastes first. It is fun, secure, rapid, and tailored to you.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-pill p-6 rounded-xl flex flex-col gap-2">
            <h3 className="text-base font-bold text-[#BAFF00] flex items-center gap-2">
              <Star className="w-5 h-5 fill-[#BAFF00] stroke-[#BAFF00]" />
              <span>Unbiased Ratings</span>
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              We never inflate ratings. All ratings are locked to strict algorithm math calculating licensing, withdrawal approvals, game categories, and real community feedback logs.
            </p>
          </div>

          <div className="glass-pill p-6 rounded-xl flex flex-col gap-2">
            <h3 className="text-base font-bold text-[#BAFF00] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#BAFF00]" />
              <span>Full Licensing Verification</span>
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Every card swiped represents legally recognized operators carrying validated international verification numbers. If they aren&apos;t safe, they aren&apos;t on CasinoSwipe.
            </p>
          </div>
        </section>

        {/* Support outreach */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-4 text-center items-center neon-shadow">
          <Mail className="w-8 h-8 text-[#BAFF00]" />
          <h3 className="font-display text-2xl uppercase text-white">Partner & Advertise With Us</h3>
          <p className="text-xs text-white/50 max-w-sm leading-relaxed">
            Are you a licensed casino operator looking to introduce your welcome incentives to active players globally? Connect with our affiliate placement leads.
          </p>
          <a href="mailto:nikavarjasho@gmail.com" className="bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all">
            Contact Placement Leads
          </a>
        </section>

      </div>
    </div>
  );
};
