import { useEffect, useState } from "react";
import { useAuth, LEVELS } from "../context/AuthContext";
import { T } from "../context/theme";

export function XPToast() {
  const { toast, clearToast } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) setVisible(true);
    else { const t = setTimeout(() => setVisible(false), 400); return () => clearTimeout(t); }
  }, [toast]);

  if (!visible && !toast) return null;

  const cfgs = {
    xp:      { border: T.gold,    text: T.gold,    prefix: "+" },
    streak:  { border: "#F97316", text: "#F97316",  prefix: "🔥 +" },
    levelup: { border: T.green,   text: T.green,   prefix: "🎉 " },
    badge:   { border: T.purple,  text: "#A78BFA",  prefix: "🏅 " },
    success: { border: T.green,   text: T.green,   prefix: "✓ " },
    error:   { border: T.red,     text: T.red,     prefix: "⚠️ " },
  };
  const cfg = cfgs[toast ? toast.type : "xp"] || cfgs.xp;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={0}
      className="fx-toast"
      style={{
        position: "fixed", bottom: 80, right: 16, zIndex: 9999,
        background: "#0F2240",
        border: "1px solid " + cfg.border + "44",
        borderRadius: 14, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
        minWidth: 220, maxWidth: 310,
        opacity: toast ? 1 : 0,
        transform: toast ? "translateY(0)" : "translateY(16px)",
        transition: "all .3s",
        pointerEvents: toast ? "auto" : "none",
      }}
    >
      <div style={{ flex: 1, fontSize: 13, color: T.white, fontWeight: 500 }}>
        {toast ? toast.msg : ""}
      </div>
      {toast && toast.xp > 0 && (
        <div style={{
          background: cfg.border, color: T.night,
          fontSize: 11, fontWeight: 800,
          padding: "3px 10px", borderRadius: 20,
          fontFamily: T.syne, flexShrink: 0,
        }}>
          {cfg.prefix}{toast.xp} XP
        </div>
      )}
      <button
        aria-label="Fermer la notification"
        onClick={() => { clearToast(); setVisible(false); }}
        style={{
          marginLeft: 8, background: "transparent", border: "none",
          color: T.muted, cursor: "pointer", padding: 6, borderRadius: 8,
          alignSelf: "flex-start",
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function XPBar({ xp, compact }) {
  const { levelOf } = useAuth();
  const info = levelOf(xp || 0);
  const cur = info.cur;
  const nxt = info.nxt;
  const pct = info.pct;
  const toNext = info.toNext;

  const fmt = (n) => (n || 0).toLocaleString("fr-FR");

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          background: T.goldBg,
          border: "1.5px solid " + T.gold + "44",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, color: T.gold, fontFamily: T.syne,
        }}>
          N{cur.level}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
            <span style={{ color: T.white, fontWeight: 600 }}>{cur.icon} {cur.name}</span>
            <span style={{ color: T.muted }}>{fmt(xp)} XP</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 3, height: 4 }}>
            <div style={{
              width: pct + "%", height: 4, borderRadius: 3,
              background: T.gold, transition: "width .6s",
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: T.card,
      border: "1px solid " + T.border,
      borderRadius: 12, padding: "16px 18px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: T.goldBg,
            border: "1.5px solid " + T.gold + "44",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: T.gold, fontFamily: T.syne,
          }}>
            N{cur.level}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.white, fontFamily: T.syne }}>
              {cur.icon} {cur.name}
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>Niveau {cur.level} / 8</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.white, fontFamily: T.syne }}>
            {fmt(xp)}
          </div>
          <div style={{ fontSize: 10, color: T.muted }}>
            / {nxt ? fmt(nxt.xpMin) : "MAX"} XP
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 8, marginBottom: 7 }}>
        <div style={{
          width: pct + "%", height: 8, borderRadius: 6,
          background: "linear-gradient(90deg," + T.goldD + "," + T.gold + ")",
          transition: "width .7s",
        }} />
      </div>
      {nxt && (
        <div style={{ fontSize: 11, color: T.muted }}>
          {fmt(toNext)} XP manquants vers {nxt.icon}{" "}
          <strong style={{ color: T.gold }}>{nxt.name}</strong>
        </div>
      )}
    </div>
  );
}

export function LevelBadge({ xp }) {
  const { levelOf } = useAuth();
  const { cur } = levelOf(xp || 0);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: T.goldBg, color: T.gold,
      border: "1px solid " + T.gold + "44",
      borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 700,
    }}>
      {cur.icon} {cur.name}
    </span>
  );
}
