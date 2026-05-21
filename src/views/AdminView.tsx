import React, { useState, useEffect } from "react";
import { 
  Lock, TrendingUp, DollarSign, MousePointer, Percent, 
  BarChart3, Map, Play, Download, RefreshCw, Layers, CheckCircle
} from "lucide-react";

interface AdminViewProps {
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Analytics states
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pollInterval, setPollInterval] = useState<any>(null);

  // Simulation controls state
  const [selectedClickId, setSelectedClickId] = useState("");
  const [simEvent, setSimEvent] = useState("deposit");
  const [simAmount, setSimAmount] = useState(120);
  const [simSuccessMsg, setSimSuccessMsg] = useState("");
  const [simulating, setSimulating] = useState(false);

  const fetchAnalytics = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?password=${password}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setAuthError("");
      } else {
        const errData = await res.json();
        setAuthError(errData.error || "Authentication Failed");
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error loading intelligence values", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsAuthenticated(true);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
      // Setup live polling every 5 seconds to simulate real-time socket events
      const interval = setInterval(() => {
        fetchAnalytics();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handle conversion simulation trigger postback event
  const triggerSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClickId) return;

    setSimulating(true);
    setSimSuccessMsg("");
    try {
      const response = await fetch("/api/analytics/simulate-conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          click_id: selectedClickId,
          event: simEvent,
          amount: Number(simAmount)
        })
      });

      if (response.ok) {
        setSimSuccessMsg("Postback triggered! Click marked as converted inside database.");
        // Fetch fresh stats
        await fetchAnalytics();
        setTimeout(() => setSimSuccessMsg(""), 5000);
      } else {
        setSimSuccessMsg("Simulation failed. Check selected click parameters.");
      }
    } catch (err) {
      console.error("Simulation trigger failed", err);
    } finally {
      setSimulating(false);
    }
  };

  // CSV Exporter generator
  const exportClicksToCsv = () => {
    if (!stats || !stats.recentClicks) return;
    
    // Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Click ID,Casino Slug,Casino Name,User Country,Source Page,Clicked At,Is Converted,Conversion Value\n";

    stats.recentClicks.forEach((clk: any) => {
      csvContent += `"${clk.click_id}","${clk.casino_slug}","${clk.casino_name}","${clk.user_country}","${clk.source_page}","${clk.clicked_at}",${clk.converted},${clk.conversion_value || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CasinoSwipe_AffiliateClicks_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen pt-28 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 font-sans">
        
        {/* ==========================================
            STATE 1: AUTHENTICATION LOCKSCREEN
            ========================================== */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto glass-panel rounded-3xl p-6 md:p-8 neon-shadow mt-12 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#BAFF00]/10 flex items-center justify-center border border-[#BAFF00]/25 text-[#BAFF00]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-3xl uppercase text-white">Admin Intelligence Login</h1>
              <p className="text-xs text-white/50 max-w-xs leading-normal">
                Enter your password parameter configured under ADMIN_PASSWORD to track monetization clicks, conversions, and estimated revenues.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Credential Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (Default: admin123)"
                  className="bg-white/5 backdrop-blur-md text-xs text-white py-3 px-4 rounded-xl border border-white/10 focus:outline-none focus:border-[#BAFF00]/50 text-center"
                />
              </div>

              {authError && (
                <span className="text-xs text-[#FF4058] font-semibold text-center mt-1">{authError}</span>
              )}

              <button
                type="submit"
                className="w-full bg-[#BAFF00] hover:bg-[#66FF03] text-[#080808] font-bold text-xs uppercase tracking-widest py-3 rounded-xl cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(186,255,0,0.25)] transition-all"
              >
                Request Authorization
              </button>
            </form>
          </div>
        ) : (
          
          /* ==========================================
              STATE 2: ANALYTICS CONSOLE ACTIVATED
              ========================================== */
          <div className="flex flex-col gap-8 animate-fade-in">
            
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#222222] pb-5">
              <div className="flex flex-col gap-2">
                <h1 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Affiliate Intelligence Core</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#66FF03] animate-pulse" />
                </h1>
                <p className="text-xs text-white/50 leading-relaxed">
                  Real-time monetization records logs. Showing simulated click conversions and casino postbacks tracking logs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAnalytics}
                  className="px-4 py-2 bg-white/[0.02] border border-white/10 text-xs text-white uppercase tracking-widest font-bold rounded-lg hover:bg-white/[0.05] cursor-pointer"
                  title="Force Reload Stats"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={exportClicksToCsv}
                  className="px-5 py-2.5 bg-white/5 hover:bg-[#BAFF00]/10 border border-white/10 hover:border-[#BAFF00]/30 text-xs text-white hover:text-[#BAFF00] uppercase tracking-wider font-bold rounded-full cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Click Logs CSV</span>
                </button>
              </div>
            </div>

            {/* HIGH-LEVEL STATISTICS CARDS */}
            {stats ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Card: Total clicks */}
                  <div className="glass-panel p-5 rounded-2xl flex items-center justify-between neon-shadow">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase text-white/45 tracking-widest">Logged Clicks</span>
                      <strong className="text-3xl text-white font-mono">{stats.totalClicks}</strong>
                      <span className="text-[9.5px] text-white/30">Total redirections logged</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/40">
                      <MousePointer className="w-5 h-5 text-[#BAFF00]" />
                    </div>
                  </div>

                  {/* Card: Conversions */}
                  <div className="glass-panel p-5 rounded-2xl flex items-center justify-between neon-shadow">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase text-white/45 tracking-widest">Conversions</span>
                      <strong className="text-3xl text-white font-mono">{stats.totalConversions}</strong>
                      <span className="text-[9.5px] text-white/30">Casinos registrations & deposits</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/40">
                      <CheckCircle className="w-5 h-5 text-[#66FF03]" />
                    </div>
                  </div>

                  {/* Card: Conversion Rate */}
                  <div className="glass-panel p-5 rounded-2xl flex items-center justify-between neon-shadow">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase text-white/45 tracking-widest">Rate (CR)</span>
                      <strong className="text-3xl text-white font-mono">{stats.conversionRate.toFixed(1)}%</strong>
                      <span className="text-[9.5px] text-white/30">Clicks to conversions conversion ratio</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/40">
                      <Percent className="w-5 h-5 text-[#BAFF00]" />
                    </div>
                  </div>

                  {/* Card: Revenue */}
                  <div className="glass-panel p-5 rounded-2xl flex items-center justify-between neon-shadow">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase text-white/45 tracking-widest">Est Commission</span>
                      <strong className="text-3xl text-[#BAFF00] font-mono">${stats.estimatedRevenue.toFixed(0)}</strong>
                      <span className="text-[9.5px] text-[#66FF03] font-semibold">CPA and Hybrid payouts combined</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#BAFF00]/10 flex items-center justify-center border border-[#BAFF00]/20 text-[#BAFF00]">
                      <DollarSign className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                </div>

                {/* BREAKDOWN SECTIONS GRIDS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Col A: Clicks and performance by Casino table */}
                  <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col gap-4 neon-shadow">
                    <h3 className="font-display text-2xl uppercase text-white tracking-wide border-b border-[#222222] pb-3">Performance By Operator</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-white/70 border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b border-[#222222] font-mono text-[10px] uppercase text-white/40 text-center">
                            <th className="py-2 text-left">Casino Name</th>
                            <th className="py-2">Redirections</th>
                            <th className="py-2">Conversions</th>
                            <th className="py-2">Commission Style</th>
                            <th className="py-2">CR (%)</th>
                            <th className="py-2 text-right">Revenue ($)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.clicksPerCasino.map((cas: any) => (
                            <tr key={cas.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                              <td className="py-3 flex items-center gap-2.5 font-bold text-white">
                                <img src={cas.logo} className="w-6.5 h-6.5 rounded-lg object-cover" />
                                <span>{cas.name}</span>
                              </td>
                              <td className="py-3 text-center font-mono">{cas.clicks}</td>
                              <td className="py-3 text-center font-mono text-[#66FF03] font-semibold">{cas.conversions}</td>
                              <td className="py-3 text-center text-[10px] font-mono uppercase tracking-wider text-white/50">{cas.commission_type}</td>
                              <td className="py-3 text-center font-mono">{cas.conversionRate.toFixed(1)}%</td>
                              <td className="py-3 text-right font-mono text-[#BAFF00] font-bold">${cas.revenue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Col B: Demographics (Top Countries & Sources) */}
                  <div className="flex flex-col gap-6">
                    
                    {/* Top source channels */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 h-1/2 justify-between neon-shadow">
                      <h3 className="font-display text-2xl uppercase text-white border-b border-[#222222] pb-3 flex items-center gap-1.5"><Layers className="w-5 h-5 text-[#BAFF00]" /><span>Source Channels</span></h3>
                      <div className="flex flex-col gap-3 py-1">
                        {stats.topSources.map((s: any) => (
                          <div key={s.source} className="flex justify-between items-center text-xs">
                            <span className="font-mono text-white/50">{s.source}</span>
                            <div className="flex items-center gap-2 flex-1 mx-3 h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                              <div className="h-full bg-[#BAFF00]" style={{ width: `${Math.min(100, (s.clicks / stats.totalClicks) * 100)}%` }} />
                            </div>
                            <strong className="text-white font-mono">{s.clicks}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top geographic locations */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 h-1/2 justify-between neon-shadow">
                      <h3 className="font-display text-2xl uppercase text-white border-b border-[#222222] pb-3 flex items-center gap-1.5"><Map className="w-5 h-5 text-[#BAFF00]" /><span>Geographic Breakdown</span></h3>
                      <div className="flex flex-col gap-3 py-1">
                        {stats.topCountries.map((c: any) => (
                          <div key={c.country} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-white/80">{c.country}</span>
                            <div className="flex items-center gap-2 flex-1 mx-3 h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                              <div className="h-full bg-[#66FF03]" style={{ width: `${Math.min(100, (c.clicks / stats.totalClicks) * 100)}%` }} />
                            </div>
                            <strong className="text-white font-mono">{c.clicks}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                {/* ==========================================
                    PORTAL: LIVE SIMULATOR & WEBHOKS COMPILER
                    ========================================== */}
                <div className="glass-panel p-6 rounded-2xl neon-shadow">
                  <div className="flex flex-col gap-2 border-b border-[#222222] pb-4 mb-5">
                    <h3 className="font-display text-3xl uppercase text-[#BAFF00] flex items-center gap-2">
                      <Play className="w-6.5 h-6.5 fill-current" />
                      <span>Postback Webhook Simulator</span>
                    </h3>
                    <p className="text-xs text-white/50 font-sans max-w-xl">
                      Select any unconverted affiliate click from our database. Trigger a mock postback from the casino to instantly mark it converted, log a conversion table row, and update the live dashboard analytics in real-time.
                    </p>
                  </div>

                  <form onSubmit={triggerSimulation} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    
                    {/* Select active click */}
                    <div className="flex flex-col gap-1.5 md:col-span-2 text-xs">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Unconverted Target Click (live list)</label>
                      <select
                        value={selectedClickId}
                        onChange={(e) => setSelectedClickId(e.target.value)}
                        className="bg-white/5 backdrop-blur-md text-xs text-white sm:text-white py-2.5 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50 [&>option]:bg-[#080808]"
                      >
                        <option value="">-- Choose Click to Convert --</option>
                        {stats.recentClicks.filter((c: any) => !c.converted).map((c: any) => (
                          <option className="bg-[#080808]" key={c.click_id} value={c.click_id}>
                            {c.casino_name} &bull; Click {c.click_id.substring(0,8)} &bull; {c.user_country} &bull; {c.clicked_at.substring(11,19)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trigger Event option */}
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Trigger Event</label>
                      <select
                        value={simEvent}
                        onChange={(e) => setSimEvent(e.target.value)}
                        className="bg-white/5 backdrop-blur-md text-xs text-white sm:text-white py-2.5 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#BAFF00]/50 [&>option]:bg-[#080808]"
                      >
                        <option className="bg-[#080808]" value="registration">registration</option>
                        <option className="bg-[#080808]" value="deposit">deposit</option>
                        <option className="bg-[#080808]" value="qualified_deposit">qualified_deposit</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedClickId || simulating}
                      className="bg-[#BAFF00] hover:bg-[#66FF03] disabled:opacity-40 disabled:cursor-not-allowed text-[#080808] font-bold text-xs uppercase py-3.5 px-4 rounded-xl cursor-pointer"
                    >
                      {simulating ? "Executing simulation..." : "Fire Postback Callback"}
                    </button>

                  </form>

                  {simSuccessMsg && (
                    <div className="text-xs text-[#66FF03] font-semibold mt-4 text-center select-none block bg-[#66FF03]/5 border border-[#66FF03]/20 py-2 rounded-lg">
                      {simSuccessMsg}
                    </div>
                  )}
                </div>

                {/* HISTORICAL TIMELINE FEEDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
                  
                  {/* Clicks timeline */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 neon-shadow">
                    <h3 className="font-display text-2xl uppercase text-white border-b border-[#222222] pb-3 tracking-wide">Recent Redirection Logs ({stats.recentClicks.length})</h3>
                    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1 text-[11px] text-white/55">
                      {stats.recentClicks.map((c: any) => (
                        <div key={c.click_id} className="glass-pill rounded-xl p-3 flex justify-between items-center">
                          <div className="flex flex-col gap-1 text-left">
                            <strong className="text-white text-xs font-sans tracking-wide">{c.casino_name}</strong>
                            <span>ID: <code className="text-[#BAFF00] text-[10px]">{c.click_id.substring(0, 16)}...</code></span>
                            <span className="text-[10px] text-white/35">Page: {c.source_page} &bull; Pos: {c.source_position}</span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1 font-mono text-[10px]">
                            <span>Country: <strong className="text-white">{c.user_country}</strong></span>
                            {c.converted ? (
                              <span className="text-[#66FF03] bg-[#66FF03]/10 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider">Converted</span>
                            ) : (
                              <span className="text-white/30 truncate max-w-[80px]">Pen. Click</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversions timeline */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 neon-shadow">
                    <h3 className="font-display text-2xl uppercase text-white border-b border-[#222222] pb-3 tracking-wide">Recent Conversions ({stats.recentConversions.length})</h3>
                    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1 text-[11px] text-white/55">
                      {stats.recentConversions.length === 0 ? (
                        <div className="text-white/30 text-xs py-12 text-center font-sans pr-2">No conversions realized yet on clicks. Execute simulated postbacks to populate tables.</div>
                      ) : (
                        stats.recentConversions.map((conv: any) => (
                          <div key={conv.id} className="glass-pill rounded-xl p-3 flex justify-between items-center border-l-4 border-l-[#66FF03]">
                            <div className="flex flex-col gap-1 text-left">
                              <strong className="text-[#66FF03] font-sans text-xs tracking-wide">{conv.casino_name}</strong>
                              <span>Code ID: <code className="text-white text-[10px]">{conv.click_id.substring(0, 8)}</code></span>
                              <span>Method: <strong className="text-white uppercase text-[9.5px]">{conv.conversion_type}</strong></span>
                            </div>

                            <div className="flex flex-col items-end gap-1 text-right">
                              <strong className="text-[#BAFF00] text-sm">${conv.commission_amount}</strong>
                              <span className="text-[9px] text-white/35">Logged: {conv.received_at.substring(11, 19)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </>
            ) : (
              <div className="text-white/40 text-center py-24 animate-pulse">Running queries against cloud tables...</div>
            )}

            {/* Back anchor */}
            <button
              onClick={onBack}
              className="text-xs font-mono uppercase tracking-widest text-[#BAFF00] hover:text-white mt-4 cursor-pointer"
            >
              &larr; Exit Admin Dashboard
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
