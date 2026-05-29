import { createContext, useContext, useEffect, useState, useCallback } from "react";

export const T = {
  night:"#0A1628", navy:"#0C1D35", card:"#111E33", card2:"#0F2240",
  gold:"#E8A020", goldD:"#C88A10", goldL:"#F5C355",
  green:"#22C55E", greenD:"#16A34A",
  red:"#EF4444", blue:"#3B82F6", purple:"#8B5CF6", cyan:"#06B6D4",
  white:"#FFFFFF", off:"rgba(255,255,255,0.85)",
  muted:"rgba(255,255,255,0.5)", faint:"rgba(255,255,255,0.2)",
  border:"rgba(255,255,255,0.07)", borderH:"rgba(255,255,255,0.14)",
  syne:"'Syne',sans-serif", dm:"'DM Sans',sans-serif",
  goldBg:"rgba(232,160,32,0.08)", greenBg:"rgba(34,197,94,0.1)",
  redBg:"rgba(239,68,68,0.1)", blueBg:"rgba(59,130,246,0.1)",
};

export const LEVELS = [
  {level:1,name:"Épargnant",     xpMin:0,    icon:"🌱"},
  {level:2,name:"Initié UEMOA",  xpMin:500,  icon:"📖"},
  {level:3,name:"Analyste Jr",   xpMin:1000, icon:"🔍"},
  {level:4,name:"Analyste",      xpMin:1500, icon:"📊"},
  {level:5,name:"Trader",        xpMin:2500, icon:"⚡"},
  {level:6,name:"Gérant",        xpMin:4000, icon:"💼"},
  {level:7,name:"Expert FoutaX", xpMin:6000, icon:"🏅"},
  {level:8,name:"Légende",       xpMin:10000,icon:"👑"},
];

export const XP = {
  LOGIN:50, COURSE:200, QUIZ:100, ANALYZE:30,
  BUY:20, CHALLENGE:500, STREAK:25, PROFILE:150, DAILY:75,
};

export function levelOf(xp=0) {
  let cur=LEVELS[0], nxt=LEVELS[1];
  for(let i=LEVELS.length-1;i>=0;i--) {
    if(xp>=LEVELS[i].xpMin){ cur=LEVELS[i]; nxt=LEVELS[i+1]||null; break; }
  }
  const pct = nxt ? Math.round(((xp-cur.xpMin)/(nxt.xpMin-cur.xpMin))*100) : 100;
  return { cur, nxt, pct, toNext: nxt ? nxt.xpMin-xp : 0 };
}

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    try { const s=localStorage.getItem("fx_user"); if(s) setUser(JSON.parse(s)); } catch {}
    setLoading(false);
  }, []);

  const save = useCallback(u => { setUser(u); localStorage.setItem("fx_user", JSON.stringify(u)); }, []);

  const ping = (msg, xp=0, type="xp") => {
    const id = Date.now();
    setToast({ id, msg, xp, type });
    setNotifs(p => [{ id, msg, xp, type, ts: new Date() }, ...p.slice(0, 19)]);
    setTimeout(() => setToast(null), 3800);
  };

  const register = useCallback(async ({ name, email, country="CI" }) => {
    const u = {
      id: crypto.randomUUID(), name, email, country,
      avatar: name.slice(0,2).toUpperCase(),
      plan: "free", xp: 0, badges: [], streak: 0,
      lastLogin: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      portfolio: { cash: 500000, positions: [], history: [500000] },
      completedCourses: [], analyzedAssets: [],
      watchlist: ["SONATEL", "PALM-CI", "BOA-CI"],
      alerts: [], dailyDone: false, dailyStreak: 0,
    };
    save(u);
    ping("Bienvenue sur FoutaX ! 🎉", XP.PROFILE, "success");
    return u;
  }, [save]);

  const login = useCallback(async ({ email }) => {
    const s = localStorage.getItem("fx_user");
    if(!s) throw new Error("Aucun compte trouvé. Veuillez vous inscrire.");
    const u = JSON.parse(s);
    if(u.email !== email) throw new Error("Email ou mot de passe incorrect.");
    const today = new Date();
    const diff = Math.floor((today - new Date(u.lastLogin)) / 86400000);
    const streak = diff===1 ? (u.streak||0)+1 : diff>1 ? 1 : u.streak;
    const upd = { ...u, lastLogin: today.toISOString(), streak, dailyDone: false };
    save(upd);
    if(diff===1) ping(`🔥 Streak ${streak} jours !`, XP.STREAK*Math.min(streak,7), "streak");
    return gainXP(upd, XP.LOGIN);
  }, [save]);

  const logout = useCallback(() => { setUser(null); localStorage.removeItem("fx_user"); }, []);

  const gainXP = useCallback(async (base, amount, reason="") => {
    const u = base || user; if(!u) return;
    const old = levelOf(u.xp).cur.level;
    const nxp = (u.xp||0) + amount;
    const nlvl = levelOf(nxp).cur;
    const upd = { ...u, xp: nxp };
    save(upd);
    if(nlvl.level > old) ping(`Niveau ${nlvl.level} débloqué ! ${nlvl.icon} ${nlvl.name}`, amount, "levelup");
    else if(reason) ping(reason, amount, "xp");
    return upd;
  }, [user, save]);

  const giveBadge = useCallback((id, name) => {
    if(!user || user.badges?.includes(id)) return;
    const upd = { ...user, badges: [...(user.badges||[]), id] };
    save(upd); ping(`Badge débloqué : ${name} !`, 0, "badge");
  }, [user, save]);

  const act = useCallback(async (action, payload={}) => {
    if(!user) return;
    let u = { ...user }, xp = 0;
    switch(action) {
      case "ANALYZE":
        if(!(u.analyzedAssets||[]).includes(payload.ticker)) {
          u.analyzedAssets = [...(u.analyzedAssets||[]), payload.ticker];
          xp = XP.ANALYZE;
          if(u.analyzedAssets.length>=3) giveBadge("analyste","Analyste");
          if(u.analyzedAssets.length>=10) giveBadge("expert","Expert Marché");
        } break;
      case "COURSE":
        if(!(u.completedCourses||[]).includes(payload.id)) {
          u.completedCourses = [...(u.completedCourses||[]), payload.id];
          xp = XP.COURSE;
          if(u.completedCourses.length===1) giveBadge("studieux","Studieux");
          if(u.completedCourses.length>=4) giveBadge("certifie","Certifié FoutaX");
        } break;
      case "BUY":
        xp = XP.BUY;
        if(!u.portfolio?.positions?.length) giveBadge("first_buy","Premier Achat");
        u.portfolio = payload.portfolio;
        break;
      case "DAILY":
        if(!u.dailyDone) {
          xp = XP.DAILY;
          u.dailyDone = true;
          u.dailyStreak = (u.dailyStreak||0) + 1;
          if(u.dailyStreak>=7) giveBadge("daily_7","7 jours de suite");
        } break;
      case "WATCHLIST":
        u.watchlist = payload.list; break;
    }
    if(xp > 0) { save(u); await gainXP(u, xp); } else save(u);
  }, [user, save, gainXP, giveBadge]);

  const upgrade = useCallback(plan => {
    if(!user) return;
    save({ ...user, plan });
    ping(`Plan ${plan.toUpperCase()} activé ! 🎉`, 500, "success");
  }, [user, save]);

  return (
    <Ctx.Provider value={{
      user, loading, toast, notifs,
      register, login, logout, gainXP, giveBadge, act, upgrade, levelOf,
      isAuth: !!user,
      isPrem: user?.plan==="gold" || user?.plan==="pro",
      isPro:  user?.plan==="pro",
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if(!c) throw new Error("useAuth hors AuthProvider");
  return c;
};
