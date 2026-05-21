import React from "react";
import { ShieldAlert, Phone, HelpCircle, Heart, CheckCircle } from "lucide-react";

export const ResponsibleView: React.FC = () => {
  return (
    <div className="w-full min-h-screen pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-8 font-sans">
        
        <div className="flex items-center gap-3 border-b border-white/[0.04] pb-6">
          <ShieldAlert className="w-10 h-10 text-[#FF4058]" />
          <div>
            <h1 className="font-display text-4xl uppercase text-white tracking-wide">Responsible Gambling Guidelines</h1>
            <p className="text-xs text-white/50">Wagering is a form of entertainment, not a persistent revenue engine.</p>
          </div>
        </div>

        <section className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-4 neon-shadow">
          <h2 className="font-display text-2xl uppercase text-[#BAFF00]">Our Commitment</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            At CasinoSwipe, we prioritize safe play guidelines above monetization objectives. All listed casinos are manually vetted to guarantee they hold valid licensing credentials and integrate standard configuration limits to curb problematic gaming behaviors.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="font-display text-2xl uppercase text-white">Warning Indicators</h3>
          <p className="text-xs text-white/50 leading-relaxed">If you or someone adjacent experiences any of the patterns below, it may be time to implement self-exclusion safeguards:</p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
            <li className="glass-pill p-4 rounded-xl text-white/90">&bull; Spending more time or capital than initially budgeted.</li>
            <li className="glass-pill p-4 rounded-xl text-white/90">&bull; Borrowing capital to cover gambling balances.</li>
            <li className="glass-pill p-4 rounded-xl text-white/90">&bull; Feeling defensive or irritated when asked about play sessions.</li>
            <li className="glass-pill p-4 rounded-xl text-white/90">&bull; Chasing previous losses trying to break even.</li>
          </ul>
        </section>

        <section className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col gap-4 neon-shadow">
          <h3 className="font-display text-2xl uppercase text-[#66FF03] flex items-center gap-2">
            <Phone className="w-6 h-6 shrink-0" />
            <span>Support Avenues & Resources</span>
          </h3>

          <div className="flex flex-col gap-4 divide-y divide-white/[0.05] text-xs">
            <div className="pt-3">
              <strong className="text-white block text-sm mb-1">BeGambleAware</strong>
              <p className="text-white/55 leading-relaxed mb-2">Free, confidential support and counseling regarding gambling habits accessible worldwide.</p>
              <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-[#BAFF00] hover:underline">Visit BeGambleAware.org &rarr;</a>
            </div>

            <div className="pt-4">
              <strong className="text-white block text-sm mb-1">GamCare Helpline</strong>
              <p className="text-white/55 leading-relaxed mb-2">The leading provider of information, advice, support, and free counseling for players in the UK.</p>
              <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#BAFF00] hover:underline">Call GamCare Support &rarr;</a>
            </div>

            <div className="pt-4">
              <strong className="text-white block text-sm mb-1">GAMSTOP Self-Exclusion</strong>
              <p className="text-white/55 leading-relaxed mb-2">Configure online blocks to exclude yourself automatically from all UK-licensed gambling portals simultaneously.</p>
              <a href="https://www.gamstop.co.uk" target="_blank" rel="noopener noreferrer" className="text-[#BAFF00] hover:underline">Get GAMSTOP Exclusion &rarr;</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
