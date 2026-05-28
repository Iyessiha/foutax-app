import { useState } from "react";
import { AuthProvider, useAuth, FOUTAX_THEME as T } from "./context/AuthContext";
import { XPToast, XPBar } from "./components/XPToast";
import AuthPage from "./pages/AuthPage";
import UserProfile from "./pages/UserProfile";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A1628; color: #fff; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0A1628; }
  ::-webkit-scrollbar-thumb { background: #2A3A55; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #E8A020; }
  input::placeholder { color: rgba(255,255,255,0.2); }
  select option { background: #0F1F38; color: #fff; }
  ::selection { background: rgba(232,160,32,0.3); }
  button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
  * { -webkit-tap-highlight-color: transparent; }
`;

/* ─── NAV ──────────────────────────────────────────────────────────────── */
function Navbar({ active, setActive }) {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard",   label: "Marché",     icon: "📈" },
    { id: "cours",       label: "Apprendre",  icon: "🎓" },
    { id: "simulateur",  label: "Simulateur", icon: "💼" },
    { id: "premium",     label: "Premium",    icon: "👑" },
  ];

  const go = (id) => { setActive(id); setMenuOpen(false); };

  return (
    <>
      <style>{css}</style>
      <nav style={{
        background: "#060E1A", borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
      }}>
        {/* Barre principale */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: 54, maxWidth: 900, margin: "0 auto",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: T.gold,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 800, color: T.night, flexShrink: 0,
            }}>FX</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 19, fontWeight: 800, color: T.white, letterSpacing: "-0.5px" }}>
              Fouta<span style={{ color: T.gold }}>X</span>
            </span>
          </div>

          {/* Nav desktop */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }} className="nav-desktop">
            {navItems.map(item => (
              <button key={item.id} onClick={() => go(item.id)} style={{
                background: active === item.id ? "rgba(232,160,32,0.12)" : "transparent",
                border: active === item.id ? "1px solid rgba(232,160,32,0.25)" : "1px solid transparent",
                color: active === item.id ? T.gold : "rgba(255,255,255,0.55)",
                fontSize: 12, fontWeight: active === item.id ? 600 : 400,
                padding: "6px 12px", borderRadius: 7, transition: "all .15s",
              }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* Droite */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 130, display: "none" }} id="xp-bar-wrap">
              <XPBar xp={user?.xp || 0} compact />
            </div>
            <button onClick={() => setShowProfile(true)} style={{
              width: 34, height: 34, borderRadius: "50%", background: T.gold,
              color: T.night, border: "none", fontSize: 12, fontWeight: 800,
              fontFamily: "'Syne', sans-serif", boxShadow: `0 0 0 2px rgba(232,160,32,0.25)`,
            }}>
              {user?.avatar || "U"}
            </button>
            {/* Burger mobile */}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: "rgba(255,255,255,0.07)", border: "none", color: T.white,
              width: 34, height: 34, borderRadius: 7, fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
            }} id="burger">
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div style={{
            background: "#0A1628", borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "8px 12px 12px",
          }}>
            <div style={{ marginBottom: 10 }}>
              <XPBar xp={user?.xp || 0} compact />
            </div>
            {navItems.map(item => (
              <button key={item.id} onClick={() => go(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "12px 14px", marginBottom: 4, borderRadius: 8,
                background: active === item.id ? "rgba(232,160,32,0.1)" : "rgba(255,255,255,0.03)",
                border: active === item.id ? "1px solid rgba(232,160,32,0.2)" : "1px solid transparent",
                color: active === item.id ? T.gold : "rgba(255,255,255,0.7)",
                fontSize: 14, fontWeight: active === item.id ? 600 : 400, textAlign: "left",
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Overlay profil */}
      {showProfile && (
        <div onClick={() => setShowProfile(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200,
          display: "flex", justifyContent: "center", alignItems: "flex-start",
          paddingTop: 64, paddingLeft: 12, paddingRight: 12,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 380 }}>
            <UserProfile onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}
    </>
  );
}

/* ─── CARD métrique ─────────────────────────────────────────────────────── */
function MetricCard({ label, val, chg, up }) {
  return (
    <div style={{
      background: "#0F1F38", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{ fontSize: 10, color: T.gray2, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: T.white, letterSpacing: "-0.5px" }}>{val}</div>
      <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: up === true ? T.green : up === false ? T.red : T.gray2 }}>{chg}</div>
    </div>
  );
}

/* ─── BTN ───────────────────────────────────────────────────────────────── */
function Btn({ children, onClick, variant = "primary", full = false }) {
  const styles = {
    primary: { background: T.gold, color: T.night, border: "none" },
    outline: { background: "transparent", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)" },
    green:   { background: T.green, color: T.night, border: "none" },
    ghost:   { background: "rgba(255,255,255,0.05)", color: T.gray2, border: "1px solid rgba(255,255,255,0.1)" },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant],
      padding: "12px 20px", borderRadius: 10,
      fontSize: 14, fontWeight: 700,
      width: full ? "100%" : "auto",
      fontFamily: "'Syne', sans-serif", letterSpacing: "0.3px",
      transition: "opacity .15s",
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </button>
  );
}

/* ─── PAGE DASHBOARD ─────────────────────────────────────────────────────── */
function DashboardPage({ setActive }) {
  const { user, trackAction } = useAuth();

  const metrics = [
    { label: "FoutaX Composite", val: "420.33", chg: "▲ +0.84%", up: true },
    { label: "FoutaX 10",        val: "197.33", chg: "▲ +0.72%", up: true },
    { label: "Volume",            val: "2.4 Mrd", chg: "FCFA",   up: null },
    { label: "Sociétés cotées",   val: "45",      chg: "UEMOA",  up: null },
  ];

  const stocks = [
    { ticker: "SONATEL",   name: "Sonatel SA",       price: "29 000", chg: "+2.84%", up: true  },
    { ticker: "PALM-CI",   name: "Palmci",            price: "4 800",  chg: "+1.50%", up: true  },
    { ticker: "BOA-CI",    name: "Bank of Africa CI", price: "6 200",  chg: "-0.80%", up: false },
    { ticker: "SOLIBRA",   name: "Solibra",           price: "95 000", chg: "+0.40%", up: true  },
    { ticker: "NESTLE-CI", name: "Nestlé CI",         price: "7 300",  chg: "-1.20%", up: false },
  ];

  return (
    <div style={{ padding: "16px", maxWidth: 900, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{
        background: "#0F1F38", borderRadius: 14, padding: "24px 20px", marginBottom: 16,
        border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: T.gold, borderRadius: "14px 0 0 14px" }} />
        <div style={{
          display: "inline-block", background: "rgba(232,160,32,0.12)", color: T.gold,
          fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
          letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 10,
        }}>🏦 Bourse Régionale · UEMOA</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", color: T.white, fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
          Bonjour, <span style={{ color: T.gold }}>{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.65, marginBottom: 18 }}>
          Bienvenue sur FoutaX — le terrain fertile de votre richesse.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn onClick={() => setActive("simulateur")}>Ouvrir le simulateur</Btn>
          <Btn variant="outline" onClick={() => setActive("cours")}>Commencer à apprendre</Btn>
        </div>
      </div>

      {/* Métriques */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
      </div>

      {/* Alerte Premium */}
      <div onClick={() => setActive("premium")} style={{
        background: "rgba(232,160,32,0.06)", border: `1px solid rgba(232,160,32,0.2)`,
        borderRadius: 10, padding: "12px 14px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>🔔</span>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
          <strong style={{ color: T.white }}>Alertes en temps réel</strong> — Ne manquez aucune opportunité.{" "}
          <span style={{ color: T.gold, fontWeight: 700 }}>Premium →</span>
        </div>
      </div>

      {/* Tableau actifs */}
      <div style={{ background: "#0F1F38", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: T.white }}>Actifs en vedette</div>
          <div style={{ fontSize: 11, color: T.gold, fontWeight: 600, cursor: "pointer" }} onClick={() => setActive("premium")}>🔒 Données complètes</div>
        </div>
        {stocks.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", padding: "11px 16px",
            borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
            gap: 10,
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12, color: T.white, width: 76, flexShrink: 0 }}>{s.ticker}</div>
            <div style={{ flex: 1, fontSize: 11, color: T.gray2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.white, flexShrink: 0, filter: i >= 3 ? "blur(5px)" : "none" }}>{s.price}</div>
            <span style={{
              background: s.up ? "rgba(61,207,142,0.12)" : "rgba(240,96,96,0.12)",
              color: s.up ? T.green : T.red,
              fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, flexShrink: 0,
            }}>{s.up ? "▲" : "▼"} {s.chg}</span>
            <button onClick={() => trackAction("ASSET_ANALYZE", { ticker: s.ticker })} style={{
              background: "rgba(232,160,32,0.08)", color: T.gold, border: `1px solid rgba(232,160,32,0.2)`,
              padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, flexShrink: 0,
            }}>Analyser</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PAGE COURS ─────────────────────────────────────────────────────────── */
function CoursPage() {
  const { trackAction } = useAuth();
  const courses = [
    { id: "bases",    icon: "📈", level: "Débutant",      color: T.green,  title: "Les bases des marchés africains", lessons: 5, free: true  },
    { id: "rapports", icon: "💰", level: "Débutant",      color: T.green,  title: "Lire un rapport financier",        lessons: 4, free: true  },
    { id: "analyse",  icon: "🏦", level: "Intermédiaire", color: T.gold,   title: "Analyse fondamentale UEMOA",       lessons: 6, free: false },
    { id: "portfolio",icon: "📊", level: "Avancé",        color: T.red,    title: "Stratégies de portefeuille",       lessons: 8, free: false },
  ];
  return (
    <div style={{ padding: "16px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 4, letterSpacing: "-0.3px" }}>Académie FoutaX</div>
      <div style={{ fontSize: 13, color: T.gray2, marginBottom: 20 }}>Formations pour maîtriser les marchés africains</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {courses.map(c => (
          <div key={c.id} style={{
            background: "#0F1F38", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, overflow: "hidden",
          }}>
            <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, background: "rgba(255,255,255,0.03)", position: "relative" }}>
              {c.icon}
              {!c.free && <div style={{ position: "absolute", top: 6, right: 8, fontSize: 12 }}>🔒</div>}
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: c.color, marginBottom: 4 }}>{c.level}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: T.white, marginBottom: 8, lineHeight: 1.35 }}>{c.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: T.gray2 }}>{c.lessons} leçons</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: c.free ? "rgba(61,207,142,0.12)" : "rgba(232,160,32,0.12)", color: c.free ? T.green : T.gold }}>{c.free ? "Gratuit" : "Premium"}</span>
              </div>
              <Btn full variant={c.free ? "primary" : "outline"} onClick={() => c.free && trackAction("COURSE_COMPLETE", { courseId: c.id })}>
                <span style={{ fontSize: 12 }}>{c.free ? "Commencer" : "Débloquer"}</span>
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PAGE SIMULATEUR ───────────────────────────────────────────────────── */
function SimulateurPage() {
  const { user, trackAction } = useAuth();
  const [qty, setQty] = useState(5);
  const [ticker, setTicker] = useState("SONATEL");
  const [msg, setMsg] = useState("");
  const prices = { SONATEL: 29000, "BOA-CI": 6200, "PALM-CI": 4800, SOLIBRA: 95000, "NESTLE-CI": 7300 };
  const cash = user?.portfolio?.cash ?? 500000;
  const total = (prices[ticker] || 0) * qty;

  const buy = () => {
    if (total > cash) { setMsg("❌ Liquidités insuffisantes"); return; }
    trackAction("PORTFOLIO_BUY", {
      portfolio: { cash: cash - total, positions: [...(user?.portfolio?.positions || []), { ticker, qty, price: prices[ticker] }] }
    });
    setMsg(`✓ Acheté ${qty} × ${ticker}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const Label = ({ children }) => (
    <div style={{ fontSize: 10, color: T.gray2, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500, marginBottom: 6 }}>{children}</div>
  );

  return (
    <div style={{ padding: "16px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: T.white, letterSpacing: "-0.3px" }}>Simulateur</div>
        <div style={{ background: "rgba(232,160,32,0.08)", border: `1px solid rgba(232,160,32,0.2)`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: T.gold, fontWeight: 600 }}>
          💰 <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800 }}>{cash.toLocaleString("fr-FR")}</span> FCFA
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {/* Ordre */}
        <div style={{ background: "#0F1F38", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 14 }}>➕ Passer un ordre</div>
          <Label>Action</Label>
          <select value={ticker} onChange={e => setTicker(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "#0A1628", color: T.white, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 13, marginBottom: 12, outline: "none" }}>
            {Object.entries(prices).map(([k, v]) => <option key={k} value={k}>{k} — {v.toLocaleString("fr-FR")} FCFA</option>)}
          </select>
          <Label>Quantité</Label>
          <input type="number" value={qty} min={1} max={100} onChange={e => setQty(+e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "#0A1628", color: T.white, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 13, marginBottom: 12, outline: "none" }} />
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.gray2, marginBottom: 3 }}>
              <span>Prix unitaire</span><span>{prices[ticker]?.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: T.white }}>
              <span>Total</span><span>{total.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
          <Btn full variant="green" onClick={buy}>Acheter</Btn>
          {msg && <div style={{ fontSize: 12, textAlign: "center", marginTop: 8, color: msg.includes("❌") ? T.red : T.green }}>{msg}</div>}
        </div>

        {/* Portefeuille */}
        <div style={{ background: "#0F1F38", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 14 }}>💼 Mon portefeuille</div>
          {!user?.portfolio?.positions?.length ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: T.gray2, fontSize: 13 }}>Aucune position ouverte.<br />Achetez votre première action !</div>
          ) : user.portfolio.positions.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: T.white, fontSize: 13 }}>{p.ticker}</div>
                <div style={{ fontSize: 11, color: T.gray2 }}>{p.qty} actions</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{(p.qty * (prices[p.ticker] || p.price)).toLocaleString("fr-FR")} FCFA</div>
            </div>
          ))}
          <div style={{ background: "rgba(232,160,32,0.08)", border: `1px solid rgba(232,160,32,0.15)`, borderRadius: 8, padding: "10px 14px", marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: T.gray2 }}>Liquidités</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: T.gold }}>{cash.toLocaleString("fr-FR")} FCFA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE PREMIUM ───────────────────────────────────────────────────────── */
function PremiumPage() {
  const { upgradePlan } = useAuth();
  const plans = [
    { name: "Gratuit", price: "0", per: "", cta: "Plan actuel", disabled: true,
      features: [["4 modules de base", true], ["Données différées 15min", true], ["Simulateur 500k FCFA", true], ["Alertes cours", false], ["Analyses IA", false], ["Certification", false]] },
    { name: "Gold", price: "4 990", per: "/mois", cta: "Choisir Gold", featured: true,
      features: [["12 modules complets", true], ["Données quasi temps réel", true], ["Simulateur illimité", true], ["10 alertes/mois", true], ["Analyses IA quotidiennes", true], ["Certification FoutaX", true]] },
    { name: "Pro", price: "9 990", per: "/mois", cta: "Choisir Pro",
      features: [["Tout Gold inclus", true], ["Données live temps réel", true], ["API données UEMOA", true], ["Alertes illimitées", true], ["Signaux trading IA", true], ["Support dédié 1-to-1", true]] },
  ];
  return (
    <div style={{ padding: "16px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", background: "#0F1F38", borderRadius: 14, padding: "28px 20px", marginBottom: 20, border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>👑</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: T.white, marginBottom: 6, letterSpacing: "-0.5px" }}>Débloquez tout FoutaX</div>
        <div style={{ fontSize: 13, color: T.gray2, maxWidth: 320, margin: "0 auto" }}>Données avancées, analyses IA et formations certifiantes.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {plans.map(p => (
          <div key={p.name} style={{
            background: p.featured ? "rgba(232,160,32,0.07)" : "#0F1F38",
            border: p.featured ? `2px solid rgba(232,160,32,0.35)` : "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "18px 16px", position: "relative",
          }}>
            {p.featured && (
              <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: T.gold, color: T.night, fontSize: 10, fontWeight: 800, padding: "2px 12px", borderRadius: 20, whiteSpace: "nowrap", fontFamily: "'Syne', sans-serif" }}>⭐ Populaire</div>
            )}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: T.gray2, marginBottom: 6 }}>{p.name}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: T.white, marginBottom: 2 }}>
              {p.price}<span style={{ fontSize: 11, fontWeight: 400, color: T.gray2 }}> FCFA{p.per}</span>
            </div>
            <ul style={{ listStyle: "none", margin: "12px 0", padding: 0 }}>
              {p.features.map(([f, ok], i) => (
                <li key={i} style={{ fontSize: 11, color: ok ? "rgba(255,255,255,0.7)" : T.gray2, padding: "3px 0", display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ color: ok ? T.green : T.gray2, flexShrink: 0 }}>{ok ? "✓" : "✕"}</span>{f}
                </li>
              ))}
            </ul>
            <Btn full variant={p.disabled ? "ghost" : "primary"} onClick={() => !p.disabled && upgradePlan(p.name.toLowerCase())}>
              <span style={{ fontSize: 12 }}>{p.cta}</span>
            </Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LOADING ────────────────────────────────────────────────────────────── */
function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.night }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: T.night, margin: "0 auto 14px" }}>FX</div>
        <div style={{ fontFamily: "'Syne', sans-serif", color: T.white, fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>Fouta<span style={{ color: T.gold }}>X</span></div>
        <div style={{ fontSize: 12, color: T.gray2, marginTop: 6 }}>Chargement…</div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD WRAPPER ──────────────────────────────────────────────────── */
function Dashboard() {
  const [active, setActive] = useState("dashboard");
  const pages = {
    dashboard:  <DashboardPage setActive={setActive} />,
    cours:      <CoursPage />,
    simulateur: <SimulateurPage />,
    premium:    <PremiumPage />,
  };
  return (
    <div style={{ minHeight: "100vh", background: T.night }}>
      <Navbar active={active} setActive={setActive} />
      <div style={{ paddingBottom: 32 }}>{pages[active]}</div>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────────────────── */
function AppInner() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return <>{isAuthenticated ? <Dashboard /> : <AuthPage />}<XPToast /></>;
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
