import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { T } from "./theme";

// ─── NIVEAUX ──────────────────────────────────────────────────────────────────
export const LEVELS = [
  { level:1, name:"Epargnant",     xpMin:0,     icon:"🌱" },
  { level:2, name:"Initie UEMOA",  xpMin:500,   icon:"📖" },
  { level:3, name:"Analyste Jr",   xpMin:1000,  icon:"🔍" },
  { level:4, name:"Analyste",      xpMin:1500,  icon:"📊" },
  { level:5, name:"Trader",        xpMin:2500,  icon:"⚡" },
  { level:6, name:"Gerant",        xpMin:4000,  icon:"💼" },
  { level:7, name:"Expert FoutaX", xpMin:6000,  icon:"🏅" },
  { level:8, name:"Legende",       xpMin:10000, icon:"👑" },
];

export const XP = {
  LOGIN:50, COURSE:200, QUIZ:100, ANALYZE:30,
  BUY:20, CHALLENGE:500, STREAK:25, PROFILE:150, DAILY:75,
};

// ─── UTILITAIRE NIVEAU ────────────────────────────────────────────────────────
export function levelOf(xp) {
  const safeXp = xp || 0;
  let cur = LEVELS[0];
  let nxt = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVELS[i].xpMin) {
      cur = LEVELS[i];
      nxt = LEVELS[i + 1] || null;
      break;
    }
  }
  const pct = nxt
    ? Math.round(((safeXp - cur.xpMin) / (nxt.xpMin - cur.xpMin)) * 100)
    : 100;
  return { cur, nxt, pct, toNext: nxt ? nxt.xpMin - safeXp : 0 };
}

// ─── CONTEXTE ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState(null);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("fx_user");
      if (s) setUser(JSON.parse(s));
    } catch (err) {}
    setLoading(false);
  }, []);

  const save = useCallback((u) => {
    setUser(u);
    try { localStorage.setItem("fx_user", JSON.stringify(u)); } catch (err) {}
  }, []);

  const ping = (msg, xp, type) => {
    const id = Date.now();
    const safeXp = xp || 0;
    const safeType = type || "xp";
    setToast({ id, msg, xp: safeXp, type: safeType });
    setNotifs((p) => [{ id, msg, xp: safeXp, type: safeType, ts: new Date() }, ...p.slice(0, 19)]);
    setTimeout(() => setToast(null), 3800);
  };

  const clearToast = useCallback(() => setToast(null), []);

  const register = useCallback(async ({ name, email, country, password }) => {
    const safeCountry = country || "CI";
    const u = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name,
      email,
      // NOTE: password stored in cleartext for local demo only
      password: password || "",
      country: safeCountry,
      avatar: name.slice(0, 2).toUpperCase(),
      plan: "free",
      xp: 0,
      badges: [],
      streak: 0,
      lastLogin: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      portfolio: { cash: 500000, positions: [], history: [500000] },
      completedCourses: [],
      analyzedAssets: [],
      watchlist: ["SONATEL", "PALM-CI", "BOA-CI"],
      alerts: [],
      dailyDone: false,
      dailyStreak: 0,
    };
    save(u);
    ping("Bienvenue sur FoutaX !", XP.PROFILE, "success");
    return u;
  }, [save]);

  const login = useCallback(async ({ email, password }) => {
    let s = null;
    try { s = localStorage.getItem("fx_user"); } catch (err) {}
    if (!s) throw new Error("Aucun compte trouve. Veuillez vous inscrire.");
    const u = JSON.parse(s);
    if (u.email !== email) throw new Error("Email ou mot de passe incorrect.");
    // If a password was stored, require it and validate
    if (u.password) {
      if (!password) throw new Error("Mot de passe requis.");
      if (u.password !== password) throw new Error("Email ou mot de passe incorrect.");
    }
    const today = new Date();
    const diff = Math.floor((today - new Date(u.lastLogin)) / 86400000);
    const streak = diff === 1 ? (u.streak || 0) + 1 : diff > 1 ? 1 : u.streak;
    const upd = { ...u, lastLogin: today.toISOString(), streak, dailyDone: false };
    save(upd);
    if (diff === 1) {
      ping("Streak " + streak + " jours !", XP.STREAK * Math.min(streak, 7), "streak");
    }
    const res = await gainXP(upd, XP.LOGIN);
    ping("Connecté — Bienvenue !", XP.LOGIN, "success");
    return res;
  }, [save]);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem("fx_user"); } catch (err) {}
  }, []);

  const gainXP = useCallback(async (base, amount, reason) => {
    const u = base || user;
    if (!u) return null;
    const old = levelOf(u.xp).cur.level;
    const nxp = (u.xp || 0) + amount;
    const nlvl = levelOf(nxp).cur;
    const upd = { ...u, xp: nxp };
    save(upd);
    if (nlvl.level > old) {
      ping("Niveau " + nlvl.level + " debloque ! " + nlvl.icon + " " + nlvl.name, amount, "levelup");
    } else if (reason) {
      ping(reason, amount, "xp");
    }
    return upd;
  }, [user, save]);

  const giveBadge = useCallback((id, name) => {
    if (!user || (user.badges && user.badges.includes(id))) return;
    const upd = { ...user, badges: [...(user.badges || []), id] };
    save(upd);
    ping("Badge debloque : " + name + " !", 0, "badge");
  }, [user, save]);

  const act = useCallback(async (action, payload) => {
    if (!user) return null;
    const p = payload || {};
    const u = { ...user };
    let xp = 0;

    switch (action) {
      case "ANALYZE": {
        const assets = u.analyzedAssets || [];
        if (!assets.includes(p.ticker)) {
          u.analyzedAssets = [...assets, p.ticker];
          xp = XP.ANALYZE;
          if (u.analyzedAssets.length >= 3) giveBadge("analyste", "Analyste");
          if (u.analyzedAssets.length >= 10) giveBadge("expert", "Expert Marche");
        }
        break;
      }
      case "COURSE": {
        const courses = u.completedCourses || [];
        if (!courses.includes(p.id)) {
          u.completedCourses = [...courses, p.id];
          xp = XP.COURSE;
          if (u.completedCourses.length === 1) giveBadge("studieux", "Studieux");
          if (u.completedCourses.length >= 4) giveBadge("certifie", "Certifie FoutaX");
        }
        break;
      }
      case "BUY": {
        xp = XP.BUY;
        const pos = (u.portfolio && u.portfolio.positions) ? u.portfolio.positions : [];
        if (pos.length === 0) giveBadge("first_buy", "Premier Achat");
        u.portfolio = p.portfolio;
        break;
      }
      case "DAILY": {
        if (!u.dailyDone) {
          xp = XP.DAILY;
          u.dailyDone = true;
          u.dailyStreak = (u.dailyStreak || 0) + 1;
          if (u.dailyStreak >= 7) giveBadge("daily_7", "7 jours de suite");
        }
        break;
      }
      case "WATCHLIST": {
        u.watchlist = p.list;
        break;
      }
      default:
        break;
    }

    if (xp > 0) {
      save(u);
      return gainXP(u, xp);
    }
    save(u);
    return u;
  }, [user, save, gainXP, giveBadge]);

  const upgrade = useCallback((plan) => {
    if (!user) return;
    save({ ...user, plan });
    ping("Plan " + plan.toUpperCase() + " active !", 500, "success");
  }, [user, save]);

  const value = {
    user, loading, toast, notifs,
    register, login, logout,
    ping,
    gainXP, giveBadge, act, upgrade,
    clearToast,
    levelOf,
    isAuth: !!user,
    isPrem: user ? (user.plan === "gold" || user.plan === "pro") : false,
    isPro: user ? user.plan === "pro" : false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth doit etre dans AuthProvider");
  return c;
}
