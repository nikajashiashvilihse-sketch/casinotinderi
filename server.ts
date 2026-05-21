import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { INITIAL_CASINOS, INITIAL_BLOGS, DEFAULT_REVIEWS } from "./src/data";
import { AffiliateClick, Conversion, UserReview } from "./src/types";

// Database storage configurations
const DB_FILE = path.join(process.cwd(), "db_store.json");

// Local state
let casinosList = [...INITIAL_CASINOS];
let clicks: AffiliateClick[] = [];
let conversions: Conversion[] = [];
let customReviews: UserReview[] = [...DEFAULT_REVIEWS];

// Load persistence database from file if exists
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.clicks)) clicks = data.clicks;
      if (Array.isArray(data.conversions)) conversions = data.conversions;
      if (Array.isArray(data.customReviews)) customReviews = data.customReviews;
      console.log(`[Database] Loaded ${clicks.length} clicks, ${conversions.length} conversions, and ${customReviews.length} reviews.`);
    } else {
      console.log("[Database] No active database file detected. Initializing fresh in-memory state.");
      // Seed with some mock clicks to make dashboard live initially
      seedMockAnalytics();
      saveDatabase();
    }
  } catch (err) {
    console.error("[Database] Error loading database file, falling back to in-memory state.", err);
    seedMockAnalytics();
  }
}

// Save database to file
function saveDatabase() {
  try {
    const data = { clicks, conversions, customReviews };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Database] Error saving database file", err);
  }
}

// Seed the system with some premium mock clicks/conversions for high-impact initial states
function seedMockAnalytics() {
  const countries = ["Germany", "United Kingdom", "Canada", "Australia", "Brazil"];
  const pages = ["swipe_card", "casino_detail", "liked_page", "blog", "homepage"];
  const positions = ["hero_cta", "card_claim", "sidebar", "compare_table"];
  const platforms = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
  ];

  // Seed 42 clicks
  for (let i = 0; i < 42; i++) {
    const randomHoursAgo = Math.floor(Math.random() * 72) + 1; // within last 3 days
    const clickedAt = new Date(Date.now() - randomHoursAgo * 3600 * 1000).toISOString();
    const casino = casinosList[Math.floor(Math.random() * casinosList.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const sourcePage = pages[Math.floor(Math.random() * pages.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const uuid = crypto.randomUUID();
    
    const click: AffiliateClick = {
      id: crypto.randomUUID(),
      click_id: uuid,
      casino_id: casino.id,
      casino_slug: casino.slug,
      casino_name: casino.name,
      user_country: country,
      user_preferences: {
        games: ["Slots", "Live Casino"],
        payments: ["Crypto", "PayPal"],
        bonusType: "Welcome Match"
      },
      source_page: sourcePage,
      source_position: position,
      user_agent: platforms[Math.floor(Math.random() * platforms.length)],
      ip_hash: crypto.createHash("md5").update(`127.0.0.${i}`).digest("hex"),
      clicked_at: clickedAt,
      converted: false
    };

    // 15% conversion rate for mocked clicks
    if (Math.random() > 0.85) {
      click.converted = true;
      const convertedHoursAfter = Math.random() * 2;
      click.converted_at = new Date(new Date(clickedAt).getTime() + convertedHoursAfter * 3600 * 1000).toISOString();
      
      const convType = Math.random() > 0.4 ? "deposit" : "registration";
      let amount = 0;
      if (casino.commission_type === "CPA") {
        amount = casino.cpa_value;
      } else if (casino.commission_type === "RevShare") {
        amount = Math.floor(Math.random() * 200) + 10; // random revenue slice
      } else {
        amount = casino.cpa_value + Math.floor(Math.random() * 50);
      }
      click.conversion_value = amount;

      const conversion: Conversion = {
        id: crypto.randomUUID(),
        click_id: uuid,
        casino_id: casino.id,
        casino_name: casino.name,
        conversion_type: convType as any,
        commission_amount: amount,
        received_at: click.converted_at,
        raw_postback: { simulated: true, seeded: true, event: convType, commission: amount }
      };

      conversions.push(conversion);
    }
    clicks.push(click);
  }

  // Sort clicks by timestamp descending
  clicks.sort((a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime());
  conversions.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
}

// Initial Database load and build directories if needed
loadDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Get all Casinos
  app.get("/api/casinos", (req, res) => {
    res.json(casinosList);
  });

  // API Route: Submit Casino Review
  app.post("/api/reviews", (req, res) => {
    try {
      const { casino_id, username, country, rating, comment } = req.body;
      if (!casino_id || !username || !rating || !comment) {
        return res.status(400).json({ error: "Missing required details: casino_id, username, rating, comment." });
      }

      const review: UserReview = {
        id: crypto.randomUUID(),
        casino_id,
        username: String(username).substring(0, 30),
        country: String(country || "Global").substring(0, 30),
        rating: Math.max(1, Math.min(5, Number(rating))),
        comment: String(comment).substring(0, 500),
        created_at: new Date().toISOString()
      };

      customReviews.unshift(review);
      saveDatabase();
      res.status(201).json({ success: true, review });
    } catch (err) {
      console.error("Error creating review:", err);
      res.status(500).json({ error: "Internal server error saving review" });
    }
  });

  // API Route: Get Reviews
  app.get("/api/reviews", (req, res) => {
    const { casino_id } = req.query;
    if (casino_id) {
      const filtered = customReviews.filter(r => r.casino_id === casino_id);
      return res.json(filtered);
    }
    res.json(customReviews);
  });

  // API Route: Get Blog posts
  app.get("/api/blog", (req, res) => {
    res.json(INITIAL_BLOGS);
  });

  // ==========================================
  // AFFILIATE REDIRECT ENGINE (POST /api/affiliate/click)
  // ==========================================
  app.post("/api/affiliate/click", (req, res) => {
    try {
      const { casino_id, source_page, source_position, user_country, user_preferences } = req.body;
      
      if (!casino_id) {
        return res.status(400).json({ error: "Required click field: casino_id" });
      }

      // Find the casino to fetch affiliate details
      const casino = casinosList.find(c => c.id === casino_id || c.slug === casino_id);
      if (!casino) {
        return res.status(404).json({ error: `Casino with ID ${casino_id} was not found.` });
      }

      // Generate click_id (UUID v4)
      const clickId = crypto.randomUUID();
      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const ipHash = crypto.createHash("md5").update(String(ip)).digest("hex");

      // Store in memory clicks database
      const clickObj: AffiliateClick = {
        id: crypto.randomUUID(),
        click_id: clickId,
        casino_id: casino.id,
        casino_slug: casino.slug,
        casino_name: casino.name,
        user_country: user_country || "Global",
        user_preferences: {
          games: user_preferences?.games || [],
          payments: user_preferences?.payments || [],
          bonusType: user_preferences?.bonusType || "Welcome Match"
        },
        source_page: source_page || "unknown",
        source_position: source_position || "unknown",
        user_agent: req.headers["user-agent"] || "unknown",
        ip_hash: ipHash,
        clicked_at: new Date().toISOString(),
        converted: false
      };

      clicks.unshift(clickObj);
      saveDatabase();

      // Construct affiliate URL
      // Example: https://casino.com/register?clickid=abc-123&affid=YourAffID
      const separator = casino.affiliate_url.includes("?") ? "&" : "?";
      const redirectUrl = `${casino.affiliate_url}${separator}${casino.click_param_name}=${clickId}&affid=${casino.affiliate_id}`;

      res.status(200).json({
        redirect_url: redirectUrl,
        click_id: clickId,
        casino_name: casino.name
      });
    } catch (err) {
      console.error("Error logging click:", err);
      res.status(500).json({ error: "Internal error executing affiliate tracking" });
    }
  });

  // ==========================================
  // CASINO EVENT POSTBACKS (GET/POST /api/affiliate/postback)
  // Query: ?click_id=xxx&event=deposit&amount=100&token=SECRET
  // ==========================================
  const handlePostback = (req: any, res: any) => {
    try {
      // Gather parameters from either query or body parameters
      const params = { ...req.query, ...req.body };
      const { click_id, event, amount, token } = params;

      if (!click_id) {
        return res.status(400).json({ error: "Postback failed: missing click_id parameter" });
      }

      // Token authorization check
      const expectedToken = process.env.POSTBACK_SECRET || "CS_SECRET_POSTBACK_2026";
      if (token !== expectedToken) {
        console.warn(`[Warning] Unauthorized postback trigger attempted with bad token: ${token}`);
        return res.status(401).json({ error: "Postback authentication failure. Invalid secret token." });
      }

      // Find the click
      const clickIdx = clicks.findIndex(c => c.click_id === click_id);
      if (clickIdx === -1) {
        return res.status(404).json({ error: `Original affiliate click not found for ID: ${click_id}` });
      }

      const activeClick = clicks[clickIdx];
      
      // Update the click as converted
      activeClick.converted = true;
      activeClick.converted_at = new Date().toISOString();
      const numericalAmount = Number(amount) || 50; // fallback if missing
      activeClick.conversion_value = numericalAmount;

      // Log Conversion
      const conversionObj: Conversion = {
        id: crypto.randomUUID(),
        click_id: click_id,
        casino_id: activeClick.casino_id,
        casino_name: activeClick.casino_name,
        conversion_type: (event || "deposit") as any,
        commission_amount: numericalAmount,
        received_at: activeClick.converted_at,
        raw_postback: params
      };

      conversions.unshift(conversionObj);
      saveDatabase();

      console.log(`[Affiliate Redirection] Realized postback conversion for ${activeClick.casino_name} with value $${numericalAmount}.`);
      res.status(200).json({ status: "success", click_id, message: "Conversion registered successfully" });
    } catch (err) {
      console.error("Error processing postback:", err);
      res.status(500).json({ error: "Internal processing error on postback logger" });
    }
  };

  app.get("/api/affiliate/postback", handlePostback);
  app.post("/api/affiliate/postback", handlePostback);

  // ==========================================
  // DEV ACTION: SIMULATE CONVERSION
  // Easy method for clients to mock standard postbacks from dashboard!
  // ==========================================
  app.post("/api/analytics/simulate-conversion", (req, res) => {
    try {
      const { click_id, event, amount } = req.body;
      const clickObj = clicks.find(c => c.click_id === click_id);
      if (!clickObj) {
        return res.status(404).json({ error: "Seeded click not found for live simulation." });
      }

      // Update click
      clickObj.converted = true;
      clickObj.converted_at = new Date().toISOString();
      const val = Number(amount) || 120;
      clickObj.conversion_value = val;

      const conversionObj: Conversion = {
        id: crypto.randomUUID(),
        click_id: click_id,
        casino_id: clickObj.casino_id,
        casino_name: clickObj.casino_name,
        conversion_type: (event || "deposit") as any,
        commission_amount: val,
        received_at: clickObj.converted_at,
        raw_postback: { simulated_from_ui: true, timestamp: Date.now() }
      };

      conversions.unshift(conversionObj);
      saveDatabase();
      res.status(200).json({ success: true, conversion: conversionObj });
    } catch (err) {
      res.status(500).json({ error: "Simulation trigger raised internal fault" });
    }
  });

  // ==========================================
  // ADMIN INTELLIGENCE CORE: GET /api/analytics
  // ==========================================
  app.get("/api/analytics", (req, res) => {
    try {
      const { password } = req.query;
      const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

      if (password !== expectedPassword) {
        return res.status(401).json({ error: "Authorization failed: Incorrect admin password." });
      }

      // Totals
      const totalClicksCount = clicks.length;
      const totalConversionsCount = conversions.length;
      const conversionRate = totalClicksCount > 0 ? (totalConversionsCount / totalClicksCount) * 100 : 0;
      const totalEstimatedRevenue = conversions.reduce((acc, curr) => acc + curr.commission_amount, 0);

      // Clicks per casino
      const casinoStatsMap: Record<string, { clicks: number; convs: number; revenue: number; logo: string }> = {};
      casinosList.forEach(cas => {
        casinoStatsMap[cas.id] = { clicks: 0, convs: 0, revenue: 0, logo: cas.logo };
      });

      clicks.forEach(clk => {
        if (!casinoStatsMap[clk.casino_id]) {
          casinoStatsMap[clk.casino_id] = { clicks: 0, convs: 0, revenue: 0, logo: "" };
        }
        casinoStatsMap[clk.casino_id].clicks++;
      });

      conversions.forEach(cnv => {
        if (!casinoStatsMap[cnv.casino_id]) {
          casinoStatsMap[cnv.casino_id] = { clicks: 0, convs: 0, revenue: 0, logo: "" };
        }
        casinoStatsMap[cnv.casino_id].convs++;
        casinoStatsMap[cnv.casino_id].revenue += cnv.commission_amount;
      });

      const clickPerCasino = casinosList.map(cas => {
        const stats = casinoStatsMap[cas.id] || { clicks: 0, convs: 0, revenue: 0, logo: cas.logo };
        return {
          id: cas.id,
          name: cas.name,
          slug: cas.slug,
          logo: cas.logo,
          clicks: stats.clicks,
          conversions: stats.convs,
          conversionRate: stats.clicks > 0 ? (stats.convs / stats.clicks) * 100 : 0,
          revenue: stats.revenue,
          commission_type: cas.commission_type
        };
      }).sort((a, b) => b.clicks - a.clicks);

      // Country breakout
      const countryBreakoutMap: Record<string, number> = {};
      clicks.forEach(c => {
        countryBreakoutMap[c.user_country] = (countryBreakoutMap[c.user_country] || 0) + 1;
      });
      const countryBreakout = Object.entries(countryBreakoutMap).map(([country, count]) => ({
        country,
        clicks: count
      })).sort((a, b) => b.clicks - a.clicks);

      // Source page breakout
      const sourceBreakoutMap: Record<string, number> = {};
      clicks.forEach(c => {
        sourceBreakoutMap[c.source_page] = (sourceBreakoutMap[c.source_page] || 0) + 1;
      });
      const sourceBreakout = Object.entries(sourceBreakoutMap).map(([source, count]) => ({
        source,
        clicks: count
      })).sort((a, b) => b.clicks - a.clicks);

      res.status(200).json({
        totalClicks: totalClicksCount,
        totalConversions: totalConversionsCount,
        conversionRate,
        estimatedRevenue: totalEstimatedRevenue,
        clicksPerCasino: clickPerCasino,
        topCountries: countryBreakout,
        topSources: sourceBreakout,
        recentClicks: clicks.slice(0, 50),
        recentConversions: conversions.slice(0, 50)
      });
    } catch (err) {
      console.error("Error executing analytics compilation:", err);
      res.status(500).json({ error: "Internal compilation fault inside backend analytics router" });
    }
  });

  // ==========================================
  // VITE DEV SERVER OR STATIC IN PRODUCTION
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Serve and transform index.html for index hits in development
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        // Apply Vite HTML transforms. Injects the Fast Refresh preamble and HMR client!
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CasinoSwipe Server] Up and running on http://localhost:${PORT}`);
  });
}

startServer();
