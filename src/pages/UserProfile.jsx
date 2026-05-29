import { useAuth, LEVELS } from "../context/AuthContext";
import { T } from "../context/theme";

const ALL_BADGES = [
  { id:"first_buy",    icon:"📈", name:"Premier Achat" },
  { id:"studieux",     icon:"📚", name:"Studieux" },
  { id:"analyste",     icon:"🔍", name:"Analyste" },
  { id:"expert",       icon:"🧠", name:"Expert Marche" },
  { id:"certifie",     icon:"🎓", name:"Certifie FoutaX" },
  { id:"daily_7",      icon:"🔥", name:"7 Defis" },
  { id:"top10",        icon:"🏆", name:"Top 10" },
  { id:"legend",       icon:"👑", name:"Legende" },
];

export default function UserProfile({ onClose }) {
  const { user, logout, isPrem, levelOf } = useAuth();
  if (!user) return null;

  const info = levelOf(user.xp || 0);
  const cur = info.cur;
  const nxt = info.nxt;
  const pct = info.pct;
  const toNext = info.toNext;
  const earned = ALL_BADGES.filter(b => user.badges && user.badges.includes(b.id));
  const fmt = n => (n || 0).toLocaleString("fr-FR");

  return (
    <div role="dialog" aria-label="Profil utilisateur" style={{ background: T.night, border: "1px solid " + T.border, borderRadius: 16, overflow: "hidden", maxWidth: 420, width: "min(96vw,420px)", boxShadow: "0 24px 60px rgba(0,0,0,.6)" }}>
      <div style={{ background: T.navy, padding: "18px 18px 14px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + T.gold + ",transparent)" }} />
        {onClose && (
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.07)", border: "none", color: T.muted, width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontSize: 13 }}>
            x
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.gold, color: T.night, fontSize: 16, fontWeight: 800, fontFamily: T.syne, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {user.avatar}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.white, fontFamily: T.syne }}>{user.name}</div>
            <div style={{ fontSize: 11, color: T.muted }}>{user.email}</div>
            <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
              <span style={{ background: T.goldBg, color: T.gold, border: "1px solid " + T.gold + "30", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                {isPrem ? "👑 " + user.plan.toUpperCase() : "Gratuit"}
              </span>
              <span style={{ background: T.goldBg, color: T.gold, fontSize: 10, padding: "2px 8px", borderRadius: 20 }}>
                {cur.icon} {cur.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 18px" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: T.muted }}>Progression N{cur.level}</span>
            <span style={{ color: T.gold, fontWeight: 700 }}>{fmt(user.xp)} XP</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 7 }}>
            <div style={{ width: pct + "%", height: 7, borderRadius: 6, background: T.gold, transition: "width .6s" }} />
          </div>
          {nxt && <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{fmt(toNext)} XP vers {nxt.icon} <strong style={{ color: T.gold }}>{nxt.name}</strong></div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
          {[
            { l: "Modules", v: (user.completedCourses || []).length, t: 6 },
            { l: "Actifs",  v: (user.analyzedAssets || []).length,  t: 45 },
            { l: "Badges",  v: earned.length, t: ALL_BADGES.length },
            { l: "Streak",  v: (user.streak || 0) + "j" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: T.syne }}>
                {s.v}{s.t && <span style={{ fontSize: 9, color: T.muted }}>/{s.t}</span>}
              </div>
              <div style={{ fontSize: 9, color: T.muted, marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
            Badges ({earned.length}/{ALL_BADGES.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {ALL_BADGES.map(b => {
              const ok = user.badges && user.badges.includes(b.id);
              return (
                <div key={b.id} title={b.name} style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, background: ok ? T.goldBg : "rgba(255,255,255,0.04)", border: ok ? "1px solid " + T.gold + "30" : "1px solid " + T.border, opacity: ok ? 1 : 0.3, filter: ok ? "none" : "grayscale(1)" }}>
                  {b.icon}
                </div>
              );
            })}
          </div>
        </div>

        <button aria-label="Se deconnecter" onClick={logout} style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 13, cursor: "pointer", color: T.muted, fontFamily: T.dm }}>
          Se deconnecter
        </button>
      </div>
    </div>
  );
}
