import { useState, useEffect, useRef, useCallback } from "react";
import { AuthProvider, useAuth, T, LEVELS, levelOf } from "./context/AuthContext";

// ─── CSS GLOBAL ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.2.0/tabler-icons.min.css');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#0A1628;color:#fff;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0A1628}
::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:#E8A020}
button{cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s ease}
input,select,textarea{font-family:'DM Sans',sans-serif}
input::placeholder{color:rgba(255,255,255,0.25)}
select option{background:#0C1D35;color:#fff}
::selection{background:rgba(232,160,32,0.3)}
*{-webkit-tap-highlight-color:transparent}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes countUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(232,160,32,.3)}50%{box-shadow:0 0 20px rgba(232,160,32,.6)}}
@keyframes starPop{0%{transform:scale(0)rotate(-30deg)}60%{transform:scale(1.3)rotate(5deg)}100%{transform:scale(1)rotate(0)}}
@keyframes barFill{from{width:0}to{width:var(--w)}}
.animate-up{animation:fadeUp .4s ease forwards}
.animate-in{animation:scaleIn .3s ease forwards}
.animate-count{animation:countUp .5s ease forwards}
.glow-gold{animation:glow 2s ease infinite}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const STOCKS = [
  {ticker:"SONATEL",  name:"Sonatel SA",         sector:"Télécom",    p:29000, chg:2.84,  mktCap:"3.2T", volume:"7 282",  pe:7.0,  div:5.71, country:"SN"},
  {ticker:"PALM-CI",  name:"Palmci",              sector:"Agro",       p:4800,  chg:1.50,  mktCap:"420G", volume:"210K",   pe:9.2,  div:3.4,  country:"CI"},
  {ticker:"BOA-CI",   name:"Bank of Africa CI",   sector:"Banque",     p:6200,  chg:-0.80, mktCap:"580G", volume:"85K",    pe:5.8,  div:4.2,  country:"CI"},
  {ticker:"SOLIBRA",  name:"Solibra",             sector:"Boisson",    p:95000, chg:0.40,  mktCap:"1.1T", volume:"3 200",  pe:12.1, div:2.8,  country:"CI"},
  {ticker:"NESTLE-CI",name:"Nestlé CI",           sector:"Agroalim",   p:7300,  chg:-1.20, mktCap:"890G", volume:"67K",    pe:14.2, div:1.9,  country:"CI"},
  {ticker:"SIB",      name:"Société Ivoirienne",  sector:"Banque",     p:4650,  chg:0.90,  mktCap:"520G", volume:"123K",   pe:6.4,  div:3.8,  country:"CI"},
  {ticker:"SICABLE",  name:"SICABLE",             sector:"Industrie",  p:1250,  chg:3.10,  mktCap:"95G",  volume:"450K",   pe:4.2,  div:6.1,  country:"CI"},
  {ticker:"CFAO-CI",  name:"CFAO CI",             sector:"Commerce",   p:3100,  chg:-0.50, mktCap:"310G", volume:"98K",    pe:8.7,  div:2.5,  country:"CI"},
];

const BOURSES = [
  {id:"brvm",  name:"BRVM",  region:"UEMOA",        idx:"Composite", val:"420.33", chg:"+0.48%", up:true,  color:"#E8A020", x:"20%",y:"46%"},
  {id:"nse",   name:"NSE",   region:"Nigéria",       idx:"NGX All Share", val:"50 124", chg:"+0.72%", up:true, color:"#22C55E",x:"28%",y:"52%"},
  {id:"jse",   name:"JSE",   region:"Afrique du Sud",idx:"FTSE/JSE", val:"72 815", chg:"+0.63%", up:true,  color:"#3B82F6", x:"46%",y:"75%"},
  {id:"egx",   name:"EGX",   region:"Égypte",        idx:"EGX 30",  val:"11 240", chg:"-0.35%", up:false, color:"#EF4444", x:"55%",y:"20%"},
  {id:"bvc",   name:"BVC",   region:"Maroc",         idx:"MASI",    val:"13 278", chg:"+0.41%", up:true,  color:"#E8A020", x:"34%",y:"14%"},
  {id:"bvmac", name:"BVMAC", region:"CEMAC",         idx:"BVMAC",   val:"187.56", chg:"+0.55%", up:true,  color:"#8B5CF6", x:"32%",y:"56%"},
  {id:"nse_ke",name:"NSE",   region:"Kenya",         idx:"KENE 20", val:"1 845",  chg:"+0.58%", up:true,  color:"#06B6D4", x:"58%",y:"52%"},
];

const NEWS = [
  {title:"Zone de libre-échange : nouvelles opportunités pour la BRVM", time:"2h", tag:"BRVM", hot:true},
  {title:"Nigeria Stock Exchange : record historique franchi", time:"3h", tag:"NSE", hot:false},
  {title:"SONATEL annonce un dividende exceptionnel 2025", time:"4h", tag:"SONATEL", hot:true},
  {title:"BVMAC : hausse continue de l'indice depuis 3 mois", time:"5h", tag:"BVMAC", hot:false},
  {title:"Investissements étrangers en hausse de 18% au Sénégal", time:"6h", tag:"SN", hot:false},
  {title:"Orange CI finalise l'acquisition de deux opérateurs", time:"8h", tag:"CI", hot:false},
];

const COURSES = [
  {id:"intro",   icon:"📈", title:"Introduction aux marchés BRVM",    level:"Débutant",      lc:T.green,  lessons:5, dur:"2h30", free:true,  prog:60, desc:"Les fondamentaux de la Bourse Régionale des Valeurs Mobilières — structure, acteurs, fonctionnement."},
  {id:"rapports",icon:"📋", title:"Lire un rapport financier",          level:"Débutant",      lc:T.green,  lessons:4, dur:"2h",   free:true,  prog:20, desc:"Bilan, compte de résultat, flux de trésorerie — tout comprendre en pratique sur des cas BRVM."},
  {id:"analyse", icon:"🏦", title:"Analyse fondamentale africaine",     level:"Intermédiaire", lc:T.gold,   lessons:6, dur:"4h",   free:false, prog:0,  desc:"Méthodes DCF, comparables sectoriels et spécificités des marchés UEMOA."},
  {id:"strategie",icon:"📊",title:"Stratégies de portefeuille",         level:"Intermédiaire", lc:T.gold,   lessons:7, dur:"5h",   free:false, prog:0,  desc:"Diversification, gestion du risque, allocation d'actifs sur les marchés africains."},
  {id:"trading", icon:"⚡", title:"Trading & analyse technique",        level:"Avancé",        lc:T.red,    lessons:8, dur:"6h",   free:false, prog:0,  desc:"Supports, résistances, RSI, MACD — application directe sur les actifs BRVM."},
  {id:"options", icon:"🎯", title:"Produits dérivés & obligations",     level:"Avancé",        lc:T.red,    lessons:6, dur:"4h30", free:false, prog:0,  desc:"Obligations d'État UEMOA, produits structurés et couverture de risque."},
];

const KIDS_LESSONS = [
  {id:"k1", emoji:"🌱", title:"C'est quoi l'argent ?",          level:"Niveau 1", xp:40,  color:T.green, done:true},
  {id:"k2", emoji:"🐷", title:"Épargner son argent de poche",   level:"Niveau 1", xp:40,  color:T.green, done:true},
  {id:"k3", emoji:"🏪", title:"Une entreprise, c'est quoi ?",   level:"Niveau 2", xp:60,  color:T.blue,  done:false},
  {id:"k4", emoji:"📈", title:"Les actions en images",          level:"Niveau 2", xp:60,  color:T.blue,  done:false},
  {id:"k5", emoji:"🌍", title:"Les bourses africaines",         level:"Niveau 3", xp:80,  color:T.gold,  done:false},
  {id:"k6", emoji:"🦁", title:"Devenir investisseur lion",      level:"Niveau 3", xp:100, color:T.purple,done:false},
  {id:"k7", emoji:"🏆", title:"Le jeu des entreprises",         level:"Niveau 4", xp:120, color:T.red,   done:false},
  {id:"k8", emoji:"👑", title:"Champion de la finance",         level:"Niveau 4", xp:150, color:"#FFD700",done:false},
];

const KIDS_QUIZ_DB = {
  k3:[
    {q:"Qu'est-ce qu'une entreprise ?",opts:["Un groupe de personnes qui travaillent ensemble pour gagner de l'argent","Un magasin de jouets","Une école","Un terrain de foot"],ans:0},
    {q:"Comment une entreprise gagne de l'argent ?",opts:["En vendant des produits ou services","En dormant","En jouant","En étudiant"],ans:0},
    {q:"Qui dirige une entreprise ?",opts:["Un directeur général (PDG)","Un professeur","Un médecin","Un footballeur"],ans:0},
  ],
  k4:[
    {q:"Qu'est-ce qu'une action ?",opts:["Une petite part d'une entreprise","Un billet de banque","Un ticket de bus","Un livre d'école"],ans:0},
    {q:"Si tu achètes une action SONATEL, tu deviens...?",opts:["Un petit propriétaire de SONATEL","Un employé de SONATEL","Le directeur de SONATEL","Rien du tout"],ans:0},
    {q:"Quand une entreprise fait des bénéfices, les actionnaires reçoivent...?",opts:["Un dividende (une part des bénéfices)","Un cadeau","Un diplôme","Un emploi"],ans:0},
  ],
};

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────
const fmt = n => typeof n==="number" ? n.toLocaleString("fr-FR") : n;
const fmtFcfa = n => `${fmt(n)} FCFA`;

function genSparkData(len=20, up=true, volatility=0.08) {
  let v = 50;
  return Array.from({length:len}, (_,i) => {
    v += (Math.random()-0.47)*volatility*100 + (up ? 0.3 : -0.3);
    return Math.max(10, Math.min(90, v));
  });
}

// ─── MICRO COMPOSANTS ─────────────────────────────────────────────────────────
const Chip = ({children, color=T.gold, bg, size=11}) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:4,
    background: bg || `${color}18`,
    color, border:`1px solid ${color}30`,
    fontSize:size, fontWeight:700, padding:"2px 9px",
    borderRadius:20, whiteSpace:"nowrap", lineHeight:1.5,
  }}>{children}</span>
);

const Card = ({children, style={}, onClick, hover=false}) => (
  <div onClick={onClick} style={{
    background:T.card, border:`1px solid ${T.border}`,
    borderRadius:14, ...style,
    cursor:onClick?"pointer":"default",
    transition:"all .2s",
  }}
    onMouseEnter={e=>{if(hover){e.currentTarget.style.borderColor=T.borderH;e.currentTarget.style.transform="translateY(-2px)";}}}
    onMouseLeave={e=>{if(hover){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)";}}}
  >
    {children}
  </div>
);

const Btn = ({children, onClick, variant="gold", size="md", full=false, disabled=false, style:sx={}}) => {
  const V = {
    gold:{bg:T.gold, color:T.night, border:"none"},
    green:{bg:T.green, color:T.night, border:"none"},
    outline:{bg:"transparent", color:T.off, border:`1px solid ${T.faint}`},
    ghost:{bg:`rgba(255,255,255,0.05)`, color:T.muted, border:`1px solid ${T.border}`},
    danger:{bg:T.red, color:"#fff", border:"none"},
  };
  const S = {sm:{padding:"6px 14px",fontSize:11}, md:{padding:"10px 20px",fontSize:13}, lg:{padding:"13px 28px",fontSize:15}};
  const v = V[variant]||V.gold, s = S[size]||S.md;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...v, ...s, borderRadius:10, fontWeight:700,
      fontFamily:T.syne, letterSpacing:"0.3px",
      width:full?"100%":"auto", opacity:disabled?0.5:1,
      cursor:disabled?"not-allowed":"pointer", ...sx,
    }}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity=".82";}}
      onMouseLeave={e=>{if(!disabled)e.currentTarget.style.opacity="1";}}
    >{children}</button>
  );
};

// Sparkline SVG
function Sparkline({data, color, height=36, width=90}) {
  if(!data||!data.length) return null;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const W=width, H=height;
  const pts = data.map((v,i) => `${(i/(data.length-1))*W},${H-((v-min)/range)*(H-4)+2}`).join(" ");
  return (
    <svg width={W} height={H} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Barre XP animée
function XPBar({xp, compact=false}) {
  const {cur, nxt, pct, toNext} = levelOf(xp);
  if(compact) return (
    <div style={{display:"flex", alignItems:"center", gap:8}}>
      <div style={{
        width:26, height:26, borderRadius:"50%", flexShrink:0,
        background:T.goldBg, border:`1.5px solid ${T.gold}44`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:10, fontWeight:800, color:T.gold, fontFamily:T.syne,
      }}>N{cur.level}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:3}}>
          <span style={{color:T.white, fontWeight:600}}>{cur.icon} {cur.name}</span>
          <span style={{color:T.muted}}>{fmt(xp)} XP</span>
        </div>
        <div style={{background:"rgba(255,255,255,0.1)", borderRadius:3, height:4}}>
          <div style={{width:`${pct}%`, height:4, borderRadius:3, background:T.gold, transition:"width .6s"}}/>
        </div>
      </div>
    </div>
  );
  return (
    <Card style={{padding:"16px 18px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{
            width:44, height:44, borderRadius:"50%",
            background:T.goldBg, border:`1.5px solid ${T.gold}44`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, fontWeight:800, color:T.gold, fontFamily:T.syne,
          }}>N{cur.level}</div>
          <div>
            <div style={{fontSize:15, fontWeight:700, color:T.white, fontFamily:T.syne}}>{cur.icon} {cur.name}</div>
            <div style={{fontSize:11, color:T.muted}}>Niveau {cur.level} / 8</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:20, fontWeight:800, color:T.white, fontFamily:T.syne}}>{fmt(xp)}</div>
          <div style={{fontSize:10, color:T.muted}}>/ {nxt?fmt(nxt.xpMin):"MAX"} XP</div>
        </div>
      </div>
      <div style={{background:"rgba(255,255,255,0.08)", borderRadius:6, height:8, marginBottom:7}}>
        <div style={{
          width:`${pct}%`, height:8, borderRadius:6,
          background:`linear-gradient(90deg,${T.goldD},${T.gold},${T.goldL})`,
          boxShadow:`0 0 10px ${T.gold}55`, transition:"width .7s",
        }}/>
      </div>
      {nxt && <div style={{fontSize:11, color:T.muted}}>{fmt(toNext)} XP manquants → {nxt.icon} <strong style={{color:T.gold}}>{nxt.name}</strong></div>}
    </Card>
  );
}

// Toast XP
function Toast() {
  const {toast} = useAuth();
  const [vis, setVis] = useState(false);
  useEffect(() => { if(toast) setVis(true); else setTimeout(()=>setVis(false),400); }, [toast]);
  if(!vis && !toast) return null;
  const cfg = {
    xp:      {border:T.gold,    text:T.gold,    prefix:"+"},
    streak:  {border:"#F97316", text:"#F97316",  prefix:"🔥 +"},
    levelup: {border:T.green,   text:T.green,   prefix:"🎉 "},
    badge:   {border:T.purple,  text:"#A78BFA",  prefix:"🏅 "},
    success: {border:T.green,   text:T.green,   prefix:"✓ "},
  }[toast?.type||"xp"];
  return (
    <div style={{
      position:"fixed", bottom:80, right:16, zIndex:9999,
      background:"#0F2240", border:`1px solid ${cfg.border}44`,
      borderRadius:14, padding:"12px 16px",
      display:"flex", alignItems:"center", gap:12,
      minWidth:220, maxWidth:310,
      opacity:toast?1:0, transform:toast?"translateY(0)":"translateY(16px)",
      transition:"all .3s", pointerEvents:"none",
      boxShadow:`0 8px 40px rgba(0,0,0,.5), 0 0 0 1px ${cfg.border}22`,
    }}>
      <div style={{flex:1, fontSize:13, color:T.white, fontWeight:500}}>{toast?.msg}</div>
      {toast?.xp>0 && (
        <div style={{background:cfg.border, color:T.night, fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:20, fontFamily:T.syne, flexShrink:0}}>
          {cfg.prefix}{toast.xp} XP
        </div>
      )}
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage() {
  const {register, login} = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({name:"",email:"",password:"",confirm:"",country:"CI"});
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const validate = () => {
    const e={};
    if(mode==="register"&&(!form.name||form.name.trim().length<2)) e.name="Nom trop court";
    if(!form.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Email invalide";
    if(!form.password||form.password.length<8) e.password="Minimum 8 caractères";
    if(mode==="register"&&form.password!==form.confirm) e.confirm="Mots de passe différents";
    return e;
  };

  const submit = async () => {
    const e=validate(); setErrs(e);
    if(Object.keys(e).length) return;
    setLoading(true); setServerErr("");
    try {
      if(mode==="register") await register(form);
      else await login(form);
    } catch(err) { setServerErr(err.message); }
    finally { setLoading(false); }
  };

  const COUNTRIES = [
    {c:"CI",n:"Côte d'Ivoire"},{c:"SN",n:"Sénégal"},{c:"ML",n:"Mali"},
    {c:"BF",n:"Burkina Faso"},{c:"TG",n:"Togo"},{c:"BJ",n:"Bénin"},
    {c:"GN",n:"Guinée"},{c:"NE",n:"Niger"},{c:"GW",n:"Guinée-Bissau"},{c:"OTHER",n:"Autre"},
  ];

  const Field = ({label, type="text", k, placeholder, children}) => {
    const [focus, setFocus] = useState(false);
    return (
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10, color:T.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:5}}>{label}</div>
        {children || <input
          type={type} value={form[k]} onChange={set(k)} placeholder={placeholder}
          onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          style={{
            width:"100%", padding:"11px 14px", borderRadius:10, fontSize:13,
            background:"rgba(255,255,255,0.05)", color:T.white, outline:"none",
            border:`1.5px solid ${errs[k]?T.red:focus?T.gold:T.border}`,
            transition:"border .2s",
          }}
        />}
        {errs[k] && <div style={{fontSize:11, color:T.red, marginTop:4}}>{errs[k]}</div>}
      </div>
    );
  };

  return (
    <div style={{minHeight:"100vh", display:"flex"}}>
      <style>{CSS}</style>
      {/* Panel gauche branding */}
      <div style={{
        flex:1, background:`linear-gradient(145deg,${T.night} 0%,${T.navy2} 100%)`,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"48px 44px", position:"relative", overflow:"hidden",
        borderRight:`1px solid ${T.border}`,
      }}>
        {/* Décors */}
        <div style={{position:"absolute",top:-80,right:-80,width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${T.gold}08,transparent)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,left:-60,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${T.gold}05,transparent)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,right:0,width:3,height:"100%",background:`linear-gradient(to bottom,${T.gold},transparent)`}}/>

        {/* Logo */}
        <div style={{marginBottom:40}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{
              width:48, height:48, borderRadius:12, background:T.gold,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:T.syne, fontSize:16, fontWeight:800, color:T.night,
              boxShadow:`0 0 20px ${T.gold}40`,
            }}>FX</div>
            <div style={{fontFamily:T.syne, fontSize:30, fontWeight:800, color:T.white, letterSpacing:"-1px"}}>
              Fouta<span style={{color:T.gold}}>X</span>
            </div>
          </div>
          <div style={{fontSize:10, letterSpacing:"3px", color:`${T.white}30`, textTransform:"uppercase"}}>
            INVEST · LEARN · GROW
          </div>
        </div>

        <h1 style={{fontFamily:T.syne, fontSize:26, fontWeight:800, color:T.white, lineHeight:1.25, marginBottom:14, letterSpacing:"-0.5px"}}>
          Le terrain fertile<br/>de <span style={{color:T.gold}}>votre richesse</span>
        </h1>
        <p style={{fontSize:13, color:`${T.white}55`, lineHeight:1.8, marginBottom:36}}>
          Première plateforme fintech éducative dédiée<br/>aux marchés boursiers africains.
        </p>

        {[
          {icon:"ti-chart-bar", text:"45 sociétés cotées BRVM analysées en temps réel"},
          {icon:"ti-map-2",     text:"7 bourses africaines sur une seule interface"},
          {icon:"ti-school",    text:"KidsX Academy — apprendre la finance dès l'enfance"},
          {icon:"ti-robot",     text:"Analyse IA conversationnelle sur chaque actif"},
          {icon:"ti-trophy",    text:"Gamification — XP, niveaux, badges, leaderboard"},
        ].map((item,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:13,animation:`fadeUp .4s ease ${i*0.08}s both`}}>
            <div style={{width:34,height:34,borderRadius:8,background:T.goldBg,border:`1px solid ${T.gold}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className={`ti ${item.icon}`} style={{fontSize:15,color:T.gold}}/>
            </div>
            <span style={{fontSize:13, color:`${T.white}65`}}>{item.text}</span>
          </div>
        ))}

        <div style={{marginTop:36,paddingTop:24,borderTop:`1px solid ${T.border}`,display:"flex",gap:28}}>
          {[["5 000+","membres actifs"],["Gratuit","pour débuter"],["8 pays","UEMOA"]].map(([v,l],i)=>(
            <div key={i}>
              <div style={{fontFamily:T.syne,color:T.gold,fontSize:19,fontWeight:800}}>{v}</div>
              <div style={{color:`${T.white}35`,fontSize:11}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel droit formulaire */}
      <div style={{width:460,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 36px"}}>
        <div style={{width:"100%",maxWidth:370}}>
          <div style={{marginBottom:28}}>
            <h2 style={{fontFamily:T.syne,fontSize:26,fontWeight:800,color:T.white,marginBottom:6,letterSpacing:"-0.5px"}}>
              {mode==="login"?"Bon retour 👋":"Créer mon compte"}
            </h2>
            <p style={{fontSize:13,color:T.muted}}>
              {mode==="login"?"Connectez-vous à votre espace FoutaX":"Rejoignez des milliers d'investisseurs UEMOA"}
            </p>
          </div>

          {serverErr && (
            <div style={{background:T.redBg,border:`1px solid ${T.red}44`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.red,marginBottom:16}}>
              {serverErr}
            </div>
          )}

          {mode==="register" && <Field label="Nom complet" k="name" placeholder="Ex : Kofi Asante"/>}
          <Field label="Email" type="email" k="email" placeholder="vous@exemple.com"/>
          {mode==="register" && (
            <Field label="Pays">
              <select value={form.country} onChange={set("country")} style={{width:"100%",padding:"11px 14px",borderRadius:10,fontSize:13,background:"rgba(255,255,255,0.05)",color:T.white,border:`1.5px solid ${T.border}`,outline:"none"}}>
                {COUNTRIES.map(c=><option key={c.c} value={c.c}>{c.n}</option>)}
              </select>
            </Field>
          )}
          <Field label="Mot de passe" type="password" k="password" placeholder="Minimum 8 caractères"/>
          {mode==="register" && <Field label="Confirmer" type="password" k="confirm" placeholder="Répéter le mot de passe"/>}

          {mode==="login" && (
            <div style={{textAlign:"right",marginBottom:16,marginTop:-6}}>
              <span style={{fontSize:12,color:T.gold,cursor:"pointer"}}>Mot de passe oublié ?</span>
            </div>
          )}

          <Btn full variant="gold" size="lg" onClick={submit} disabled={loading} style={{marginBottom:16}}>
            {loading ? "Chargement…" : mode==="login"?"Se connecter":"Créer mon compte gratuitement"}
          </Btn>

          <div style={{textAlign:"center",fontSize:13,color:T.muted}}>
            {mode==="login"?"Pas encore de compte ? ":"Déjà un compte ? "}
            <span onClick={()=>setMode(mode==="login"?"register":"login")} style={{color:T.gold,cursor:"pointer",fontWeight:600}}>
              {mode==="login"?"Créer un compte gratuit":"Se connecter"}
            </span>
          </div>

          <div style={{marginTop:28,paddingTop:16,borderTop:`1px solid ${T.border}`,fontSize:11,color:`${T.white}20`,textAlign:"center",lineHeight:1.7}}>
            En continuant, vous acceptez nos Conditions d'utilisation.<br/>
            Vos données sont protégées et ne sont jamais revendues.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({active, setActive}) {
  const {user, notifs} = useAuth();
  const [menu, setMenu] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifs.length;

  const TABS = [
    {id:"dashboard",  label:"Marchés",    icon:"ti-chart-bar"},
    {id:"watchlist",  label:"Watchlist",  icon:"ti-eye"},
    {id:"cours",      label:"Apprendre",  icon:"ti-school"},
    {id:"simulateur", label:"Simulateur", icon:"ti-briefcase"},
    {id:"kidsx",      label:"KidsX",      icon:"ti-star"},
    {id:"premium",    label:"Premium",    icon:"ti-crown"},
  ];

  const go = id => { setActive(id); setMenu(false); setNotifOpen(false); setProfOpen(false); };

  return (
    <>
      <nav style={{
        background:"rgba(6,14,26,0.97)", backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${T.border}`,
        position:"sticky", top:0, zIndex:200,
        boxShadow:"0 4px 30px rgba(0,0,0,.4)",
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",height:56,maxWidth:1200,margin:"0 auto"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0,cursor:"pointer"}} onClick={()=>go("dashboard")}>
            <div style={{width:32,height:32,borderRadius:8,background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.syne,fontSize:12,fontWeight:800,color:T.night,boxShadow:`0 0 12px ${T.gold}40`}}>FX</div>
            <span style={{fontFamily:T.syne,fontSize:18,fontWeight:800,color:T.white,letterSpacing:"-0.5px"}}>Fouta<span style={{color:T.gold}}>X</span></span>
            <span style={{fontSize:9,background:"rgba(34,197,94,0.15)",color:T.green,border:`1px solid ${T.green}30`,padding:"1px 6px",borderRadius:20,fontWeight:700,letterSpacing:"0.5px"}}>BETA</span>
          </div>

          {/* Desktop tabs */}
          <div style={{display:"flex",gap:1,alignItems:"center"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>go(t.id)} style={{
                background:active===t.id?T.goldBg:"transparent",
                border:active===t.id?`1px solid ${T.gold}30`:"1px solid transparent",
                color:active===t.id?T.gold:t.id==="kidsx"?"rgba(255,215,0,0.6)":T.muted,
                fontSize:12, fontWeight:active===t.id?700:400,
                padding:"6px 12px", borderRadius:8,
                display:"flex", alignItems:"center", gap:5,
              }}>
                <i className={`ti ${t.icon}`} style={{fontSize:13}}/>
                {t.id==="kidsx"
                  ? <span style={{color:active==="kidsx"?"#FFD700":"rgba(255,215,0,0.55)",fontWeight:700}}>{t.label}</span>
                  : t.label}
              </button>
            ))}
          </div>

          {/* Droite */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            {/* XP badge */}
            <div style={{background:T.goldBg,border:`1px solid ${T.gold}25`,borderRadius:20,padding:"4px 10px",display:"flex",alignItems:"center",gap:5}}>
              <i className="ti ti-trophy" style={{fontSize:12,color:T.gold}}/>
              <span style={{fontSize:11,fontWeight:700,color:T.gold,fontFamily:T.syne}}>{fmt(user?.xp||0)}</span>
            </div>

            {/* Notifs */}
            <div style={{position:"relative"}}>
              <button onClick={()=>{setNotifOpen(!notifOpen);setProfOpen(false);}} style={{width:34,height:34,borderRadius:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted,position:"relative"}}>
                <i className="ti ti-bell" style={{fontSize:16}}/>
                {unread>0 && <span style={{position:"absolute",top:-4,right:-4,background:T.red,color:"#fff",fontSize:8,fontWeight:800,width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{Math.min(unread,9)}</span>}
              </button>
              {notifOpen && (
                <div style={{position:"absolute",right:0,top:40,width:300,background:"#0C1D35",border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.5)",zIndex:300,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:600,color:T.white}}>Notifications</div>
                  <div style={{maxHeight:280,overflowY:"auto"}}>
                    {notifs.length===0
                      ? <div style={{padding:20,textAlign:"center",color:T.muted,fontSize:12}}>Aucune notification</div>
                      : notifs.slice(0,8).map((n,i)=>(
                        <div key={n.id} style={{padding:"10px 16px",borderBottom:i<7?`1px solid ${T.border}`:"none",display:"flex",gap:10,alignItems:"flex-start"}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:n.type==="levelup"?T.green:n.type==="badge"?T.purple:T.gold,marginTop:4,flexShrink:0}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,color:T.off}}>{n.msg}</div>
                            {n.xp>0&&<div style={{fontSize:10,color:T.gold,marginTop:2}}>+{n.xp} XP</div>}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <button onClick={()=>{setProfOpen(!profOpen);setNotifOpen(false);}} style={{width:34,height:34,borderRadius:"50%",background:T.gold,color:T.night,border:"none",fontSize:12,fontWeight:800,fontFamily:T.syne,boxShadow:`0 0 0 2px ${T.gold}30`}}>
              {user?.avatar||"U"}
            </button>

            {/* Burger */}
            <button onClick={()=>setMenu(!menu)} style={{width:34,height:34,borderRadius:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted}}>
              <i className={`ti ${menu?"ti-x":"ti-menu-2"}`} style={{fontSize:16}}/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menu && (
          <div style={{background:T.night,borderTop:`1px solid ${T.border}`,padding:"8px 12px 16px"}}>
            <div style={{marginBottom:12}}><XPBar xp={user?.xp||0} compact/></div>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>go(t.id)} style={{
                display:"flex",alignItems:"center",gap:12,width:"100%",
                padding:"12px 14px",marginBottom:4,borderRadius:10,
                background:active===t.id?T.goldBg:"rgba(255,255,255,0.03)",
                border:active===t.id?`1px solid ${T.gold}25`:"1px solid transparent",
                color:active===t.id?T.gold:T.off,
                fontSize:14,fontWeight:active===t.id?700:400,textAlign:"left",
              }}>
                <i className={`ti ${t.icon}`} style={{fontSize:18}}/>{t.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom nav mobile */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(6,14,26,0.98)",backdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}`,display:"flex",zIndex:150,padding:"4px 0 max(8px,env(safe-area-inset-bottom))"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>go(t.id)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            padding:"4px 0",background:"none",border:"none",
            color:active===t.id?(t.id==="kidsx"?"#FFD700":T.gold):T.muted,
            transition:"color .15s",
          }}>
            <i className={`ti ${t.icon}`} style={{fontSize:19}}/>
            <span style={{fontSize:9,fontWeight:active===t.id?700:400}}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Profile overlay */}
      {profOpen && (
        <div onClick={()=>setProfOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",justifyContent:"flex-end",alignItems:"flex-start",paddingTop:64,paddingRight:12}}>
          <div onClick={e=>e.stopPropagation()} style={{width:360,animation:"scaleIn .2s ease"}}>
            <ProfileCard onClose={()=>setProfOpen(false)}/>
          </div>
        </div>
      )}
    </>
  );
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
const ALL_BADGES = [
  {id:"first_buy",    icon:"📈",name:"Premier Achat"},
  {id:"studieux",     icon:"📚",name:"Studieux"},
  {id:"analyste",     icon:"🔍",name:"Analyste"},
  {id:"expert",       icon:"🧠",name:"Expert Marché"},
  {id:"certifie",     icon:"🎓",name:"Certifié FoutaX"},
  {id:"master",       icon:"🏛️",name:"Master Finance"},
  {id:"daily_7",      icon:"🔥",name:"7 Défis"},
  {id:"top10",        icon:"🏆",name:"Top 10"},
  {id:"legend",       icon:"👑",name:"Légende"},
  {id:"uemoa_pro",    icon:"🌍",name:"UEMOA Pro"},
  {id:"expert_analyse",icon:"📊",name:"Expert Analyse"},
  {id:"early",        icon:"🚀",name:"Early Adopter"},
];

function ProfileCard({onClose}) {
  const {user, logout, isPrem, levelOf:lv} = useAuth();
  if(!user) return null;
  const {cur, nxt, pct, toNext} = levelOf(user.xp||0);
  const earned = ALL_BADGES.filter(b=>user.badges?.includes(b.id));

  return (
    <Card style={{overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.6)"}}>
      <div style={{background:T.navy,padding:"18px 18px 14px",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${T.gold},transparent)`}}/>
        {onClose && <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.07)",border:"none",color:T.muted,width:26,height:26,borderRadius:"50%",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:T.gold,color:T.night,fontSize:16,fontWeight:800,fontFamily:T.syne,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 0 0 3px ${T.gold}25`}}>{user.avatar}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:700,color:T.white,fontFamily:T.syne}}>{user.name}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:1}}>{user.email}</div>
            <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
              <Chip color={isPrem?T.gold:T.muted}>{isPrem?"👑 "+user.plan.toUpperCase():"Gratuit"}</Chip>
              <Chip color={T.gold}>{cur.icon} {cur.name}</Chip>
              {user.country && <Chip color={T.muted} bg="rgba(255,255,255,0.06)">{user.country}</Chip>}
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 18px"}}>
        {/* XP */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:6}}>
            <span style={{color:T.muted}}>Progression N{cur.level}</span>
            <span style={{color:T.gold,fontWeight:700,fontFamily:T.syne}}>{fmt(user.xp||0)} XP</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:6,height:7}}>
            <div style={{width:`${pct}%`,height:7,borderRadius:6,background:`linear-gradient(90deg,${T.goldD},${T.gold})`,boxShadow:`0 0 8px ${T.gold}44`,transition:"width .6s"}}/>
          </div>
          {nxt && <div style={{fontSize:10,color:T.muted,marginTop:4}}>{fmt(toNext)} XP → {nxt.icon} <strong style={{color:T.gold}}>{nxt.name}</strong></div>}
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>
          {[
            {l:"Modules",v:user.completedCourses?.length||0,t:6},
            {l:"Actifs",v:user.analyzedAssets?.length||0,t:45},
            {l:"Badges",v:earned.length,t:ALL_BADGES.length},
            {l:"Streak",v:`${user.streak||0}j`},
          ].map((s,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:T.white,fontFamily:T.syne}}>{s.v}{s.t&&<span style={{fontSize:9,color:T.muted}}>/{s.t}</span>}</div>
              <div style={{fontSize:9,color:T.muted,marginTop:1}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>Badges ({earned.length}/{ALL_BADGES.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {ALL_BADGES.map(b=>{
              const ok=user.badges?.includes(b.id);
              return <div key={b.id} title={b.name} style={{width:34,height:34,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,background:ok?T.goldBg:"rgba(255,255,255,0.04)",border:ok?`1px solid ${T.gold}30`:`1px solid ${T.border}`,opacity:ok?1:0.3,filter:ok?"none":"grayscale(1)",cursor:"help"}}>{b.icon}</div>
            })}
          </div>
        </div>

        {!isPrem && (
          <div style={{background:T.goldBg,border:`1px solid ${T.gold}25`,borderRadius:10,padding:"10px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>👑</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:T.gold,fontFamily:T.syne}}>Passer à Gold</div>
              <div style={{fontSize:10,color:T.muted}}>12 modules · Alertes IA · Données live</div>
            </div>
            <Btn size="sm" onClick={()=>{}}>4 990 FCFA</Btn>
          </div>
        )}

        <Btn full variant="ghost" onClick={logout}>Se déconnecter</Btn>
      </div>
    </Card>
  );
}

// ─── DASHBOARD / MARCHÉS AFRICAINS ────────────────────────────────────────────
function DashboardPage({setActive}) {
  const {user, act} = useAuth();
  const [selectedBourse, setSelectedBourse] = useState(BOURSES[0]);
  const [activeTab, setActiveTab] = useState("1M");
  const [sparkData] = useState(() => STOCKS.reduce((a,s)=>{a[s.ticker]=genSparkData(20,s.chg>0);return a;},{}));
  const [countAnim, setCountAnim] = useState(false);

  useEffect(()=>{setTimeout(()=>setCountAnim(true),200);},[]);

  const genChart = useCallback((days) => {
    const pts = [];
    let v = 415;
    for(let i=0;i<days;i++) { v += (Math.random()-0.47)*2; pts.push(Math.max(400,Math.min(440,v))); }
    return pts;
  }, []);

  const [chartData] = useState({
    "1S": genChart(7), "1M": genChart(30), "3M": genChart(90), "1A": genChart(365),
  });

  const currentData = chartData[activeTab] || chartData["1M"];
  const minV = Math.min(...currentData), maxV = Math.max(...currentData), range = maxV-minV;
  const W=500, H=130, PAD=0;
  const chartPath = currentData.map((v,i)=>`${i===0?"M":"L"}${(i/(currentData.length-1))*(W-PAD*2)+PAD},${H-((v-minV)/range)*(H-8)+4}`).join(" ");
  const areaPath = chartPath + ` L${W-PAD},${H+4} L${PAD},${H+4} Z`;

  return (
    <div style={{padding:"16px 16px 90px",maxWidth:1200,margin:"0 auto"}}>

      {/* Hero */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"22px 22px 18px",marginBottom:16,position:"relative",overflow:"hidden",animation:"fadeUp .4s ease"}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:`linear-gradient(to bottom,${T.gold},transparent)`,borderRadius:"16px 0 0 16px"}}/>
        <div style={{position:"absolute",right:-30,top:-30,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${T.gold}06,transparent)`,pointerEvents:"none"}}/>
        <Chip size={9} style={{marginBottom:10}}>🏦 BOURSE RÉGIONALE · UEMOA</Chip>
        <h1 style={{fontFamily:T.syne,fontSize:22,fontWeight:800,color:T.white,marginBottom:6,letterSpacing:"-0.5px",lineHeight:1.2}}>
          Bonjour, <span style={{color:T.gold}}>{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p style={{color:T.muted,fontSize:13,lineHeight:1.65,marginBottom:16}}>Bienvenue sur FoutaX — le terrain fertile de votre richesse.</p>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn onClick={()=>setActive("simulateur")}>Ouvrir le simulateur</Btn>
          <Btn variant="outline" onClick={()=>setActive("cours")}>Commencer à apprendre</Btn>
        </div>
      </div>

      {/* Métriques indices */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
        {[
          {l:"FoutaX Composite",v:"420.33",c:"▲ +0.84%",up:true},
          {l:"FoutaX 10",v:"197.33",c:"▲ +0.72%",up:true},
          {l:"Volume total",v:"2.4 Mrd",c:"FCFA",up:null},
          {l:"Capitalisation",v:"8.3 Tr",c:"FCFA",up:null},
          {l:"Hausses",v:"28",c:"sur 45",up:true},
          {l:"Baisses",v:"12",c:"sur 45",up:false},
        ].map((m,i)=>(
          <Card key={i} style={{padding:"13px 15px",animation:`countUp .5s ease ${i*0.07}s both`}}>
            <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:5,fontWeight:600}}>{m.l}</div>
            <div style={{fontFamily:T.syne,fontSize:21,fontWeight:800,color:T.white,letterSpacing:"-0.5px"}}>{m.v}</div>
            <div style={{fontSize:11,marginTop:3,fontWeight:600,color:m.up===true?T.green:m.up===false?T.red:T.muted}}>{m.c}</div>
          </Card>
        ))}
      </div>

      {/* Graphique BRVM + News */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:14,marginBottom:16}}>
        {/* Graphique */}
        <Card style={{padding:"18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontFamily:T.syne,fontSize:15,fontWeight:700,color:T.white}}>FoutaX Composite</div>
              <div style={{fontSize:12,color:T.muted,marginTop:2}}>Indice de référence BRVM</div>
            </div>
            <div style={{display:"flex",gap:4}}>
              {["1S","1M","3M","1A"].map(t=>(
                <button key={t} onClick={()=>setActiveTab(t)} style={{
                  background:activeTab===t?T.goldBg:"rgba(255,255,255,0.04)",
                  border:activeTab===t?`1px solid ${T.gold}30`:`1px solid ${T.border}`,
                  color:activeTab===t?T.gold:T.muted,
                  fontSize:11,fontWeight:activeTab===t?700:400,
                  padding:"4px 10px",borderRadius:6,
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:14}}>
            <span style={{fontFamily:T.syne,fontSize:28,fontWeight:800,color:T.white}}>420.33</span>
            <span style={{fontSize:14,fontWeight:700,color:T.green}}>▲ +0.84% aujourd'hui</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H+10}`} style={{width:"100%",height:"auto",overflow:"visible"}}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.gold} stopOpacity="0.25"/>
                <stop offset="100%" stopColor={T.gold} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#chartGrad)"/>
            <path d={chartPath} fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Card>

        {/* Actualités */}
        <Card style={{padding:"18px",display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <i className="ti ti-news" style={{fontSize:15,color:T.gold}}/>
            <span style={{fontFamily:T.syne,fontSize:14,fontWeight:700,color:T.white}}>Actualités</span>
            <span style={{color:T.gold,fontWeight:700}}>Africaines</span>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {NEWS.map((n,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderTop:i>0?`1px solid ${T.border}`:"none",alignItems:"flex-start",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=".8"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}
              >
                <div style={{width:6,height:6,borderRadius:"50%",background:n.hot?T.gold:T.muted,flexShrink:0,marginTop:5}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:T.off,lineHeight:1.45}}>{n.title}</div>
                  <div style={{display:"flex",gap:6,marginTop:4}}>
                    <Chip size={9} color={T.muted} bg="rgba(255,255,255,0.05)">{n.tag}</Chip>
                    <span style={{fontSize:9,color:T.muted}}>{n.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Carte Bourses Africaines */}
      <Card style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{padding:"16px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-map-2" style={{fontSize:16,color:T.gold}}/>
          <span style={{fontFamily:T.syne,fontSize:14,fontWeight:700,color:T.white}}>Marchés Africains</span>
          <span style={{fontSize:12,color:T.muted}}>— 7 bourses en temps réel</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
          {/* Colonne gauche */}
          <div style={{borderRight:`1px solid ${T.border}`}}>
            {BOURSES.slice(0,4).map((b,i)=>(
              <div key={b.id} onClick={()=>setSelectedBourse(b)} style={{
                padding:"12px 16px",
                borderBottom:i<3?`1px solid ${T.border}`:"none",
                cursor:"pointer", transition:"background .15s",
                background:selectedBourse?.id===b.id?`${b.color}08`:"transparent",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=`${b.color}06`}
                onMouseLeave={e=>e.currentTarget.style.background=selectedBourse?.id===b.id?`${b.color}08`:"transparent"}
              >
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:b.color,boxShadow:`0 0 5px ${b.color}60`}}/>
                  <span style={{fontFamily:T.syne,fontSize:14,fontWeight:800,color:T.white}}>{b.name}</span>
                  <span style={{fontSize:9,color:T.muted}}>· {b.region}</span>
                </div>
                <div style={{fontSize:9,color:T.muted,marginBottom:3}}>{b.idx}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:T.syne,fontSize:17,fontWeight:800,color:T.white}}>{b.val}</span>
                  <Chip color={b.up?T.green:T.red} size={10}>{b.up?"▲":"▼"} {b.chg}</Chip>
                </div>
              </div>
            ))}
          </div>
          {/* Colonne droite */}
          <div>
            {BOURSES.slice(4).map((b,i)=>(
              <div key={b.id} onClick={()=>setSelectedBourse(b)} style={{
                padding:"12px 16px",
                borderBottom:i<2?`1px solid ${T.border}`:"none",
                cursor:"pointer", transition:"background .15s",
                background:selectedBourse?.id===b.id?`${b.color}08`:"transparent",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=`${b.color}06`}
                onMouseLeave={e=>e.currentTarget.style.background=selectedBourse?.id===b.id?`${b.color}08`:"transparent"}
              >
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:b.color,boxShadow:`0 0 5px ${b.color}60`}}/>
                  <span style={{fontFamily:T.syne,fontSize:14,fontWeight:800,color:T.white}}>{b.name}</span>
                  <span style={{fontSize:9,color:T.muted}}>· {b.region}</span>
                </div>
                <div style={{fontSize:9,color:T.muted,marginBottom:3}}>{b.idx}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:T.syne,fontSize:17,fontWeight:800,color:T.white}}>{b.val}</span>
                  <Chip color={b.up?T.green:T.red} size={10}>{b.up?"▲":"▼"} {b.chg}</Chip>
                </div>
              </div>
            ))}
            {/* Bourse sélectionnée — détail */}
            {selectedBourse && (
              <div style={{padding:"12px 16px",background:`${selectedBourse.color}06`,borderTop:`1px solid ${T.border}`}}>
                <div style={{fontSize:10,color:T.muted,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>Bourse sélectionnée</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:selectedBourse.color}}/>
                  <span style={{fontFamily:T.syne,fontSize:15,fontWeight:800,color:T.white}}>{selectedBourse.name}</span>
                  <span style={{fontSize:10,color:T.muted}}>— {selectedBourse.region}</span>
                </div>
                <div style={{fontFamily:T.syne,fontSize:20,fontWeight:800,color:T.white,marginBottom:2}}>{selectedBourse.val}</div>
                <Chip color={selectedBourse.up?T.green:T.red}>{selectedBourse.up?"▲":"▼"} {selectedBourse.chg}</Chip>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tableau actifs BRVM */}
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <span style={{fontFamily:T.syne,fontSize:14,fontWeight:700,color:T.white}}>Actifs BRVM</span>
            <span style={{fontSize:11,color:T.muted,marginLeft:8}}>Séance en cours</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:T.green,animation:"pulse 1.5s infinite"}}/>
              En direct
            </div>
            <button onClick={()=>setActive("premium")} style={{fontSize:10,color:T.gold,background:T.goldBg,border:`1px solid ${T.gold}25`,padding:"4px 10px",borderRadius:20,fontWeight:700}}>🔒 Données complètes</button>
          </div>
        </div>
        {/* Header table */}
        <div style={{display:"grid",gridTemplateColumns:"80px 1fr 70px 80px 70px 80px",gap:8,padding:"8px 18px",background:"rgba(255,255,255,0.02)",borderBottom:`1px solid ${T.border}`}}>
          {["Ticker","Société","Cours","Variation","P/E","Action"].map((h,i)=>(
            <div key={i} style={{fontSize:9,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:i>1?"right":"left"}}>{h}</div>
          ))}
        </div>
        {STOCKS.map((s,i)=>(
          <div key={s.ticker} style={{
            display:"grid",gridTemplateColumns:"80px 1fr 70px 80px 70px 80px",
            gap:8, padding:"11px 18px",
            borderTop:i>0?`1px solid ${T.border}`:"none",
            alignItems:"center", cursor:"pointer",
            transition:"background .15s",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div>
              <div style={{fontFamily:T.syne,fontWeight:800,fontSize:12,color:T.white}}>{s.ticker}</div>
              <Chip size={8} color={T.muted} bg="rgba(255,255,255,0.04)" style={{marginTop:3}}>{s.sector}</Chip>
            </div>
            <div>
              <div style={{fontSize:12,color:T.off,marginBottom:2}}>{s.name}</div>
              <Sparkline data={sparkData[s.ticker]} color={s.chg>0?T.green:T.red} height={24} width={70}/>
            </div>
            <div style={{textAlign:"right",fontSize:12,fontWeight:600,color:T.white,filter:i>=5?"blur(5px)":"none"}}>{fmt(s.p)}</div>
            <div style={{textAlign:"right"}}>
              <Chip color={s.chg>0?T.green:T.red} size={10}>{s.chg>0?"▲":"▼"} {Math.abs(s.chg).toFixed(2)}%</Chip>
            </div>
            <div style={{textAlign:"right",fontSize:11,color:T.muted}}>{s.pe}x</div>
            <div style={{textAlign:"right"}}>
              <Btn size="sm" variant="ghost" onClick={()=>act("ANALYZE",{ticker:s.ticker})}>
                <i className="ti ti-chart-line" style={{fontSize:12}}/>
              </Btn>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── WATCHLIST ─────────────────────────────────────────────────────────────────
function WatchlistPage() {
  const {user, act} = useAuth();
  const wl = user?.watchlist || [];
  const [alertStock, setAlertStock] = useState(null);
  const [alertPrice, setAlertPrice] = useState("");
  const [sparkData] = useState(() => STOCKS.reduce((a,s)=>{a[s.ticker]=genSparkData(30,s.chg>0);return a;},{}));

  const toggle = ticker => {
    const list = wl.includes(ticker) ? wl.filter(t=>t!==ticker) : [...wl, ticker];
    act("WATCHLIST", {list});
  };

  const wlStocks = STOCKS.filter(s => wl.includes(s.ticker));
  const otherStocks = STOCKS.filter(s => !wl.includes(s.ticker));

  return (
    <div style={{padding:"16px 16px 90px",maxWidth:1200,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <h1 style={{fontFamily:T.syne,fontSize:20,fontWeight:800,color:T.white,marginBottom:4}}>Ma Watchlist <i className="ti ti-eye" style={{fontSize:18,color:T.gold}}/></h1>
        <p style={{fontSize:13,color:T.muted}}>Suivez vos actifs favoris et définissez des alertes de cours.</p>
      </div>

      {/* Actifs en watchlist */}
      {wlStocks.length===0 ? (
        <Card style={{padding:"32px",textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:32,marginBottom:10}}>👁️</div>
          <div style={{fontSize:14,color:T.muted}}>Votre watchlist est vide.<br/>Ajoutez des actifs depuis la liste ci-dessous.</div>
        </Card>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12,marginBottom:20}}>
          {wlStocks.map(s=>(
            <Card key={s.ticker} style={{padding:"16px",overflow:"hidden"}} hover>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:T.syne,fontSize:15,fontWeight:800,color:T.white}}>{s.ticker}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.sector}</div>
                </div>
                <button onClick={()=>toggle(s.ticker)} style={{background:T.redBg,border:`1px solid ${T.red}30`,color:T.red,width:26,height:26,borderRadius:6,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <i className="ti ti-x"/>
                </button>
              </div>
              <div style={{fontFamily:T.syne,fontSize:22,fontWeight:800,color:T.white,marginBottom:6}}>{fmt(s.p)} <span style={{fontSize:11,color:T.muted,fontWeight:400}}>FCFA</span></div>
              <Sparkline data={sparkData[s.ticker]} color={s.chg>0?T.green:T.red} height={44} width={180}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                <Chip color={s.chg>0?T.green:T.red}>{s.chg>0?"▲":"▼"} {Math.abs(s.chg)}%</Chip>
                <button onClick={()=>{setAlertStock(s);setAlertPrice("");}} style={{fontSize:10,color:T.gold,background:T.goldBg,border:`1px solid ${T.gold}25`,padding:"3px 9px",borderRadius:20,fontWeight:700}}>
                  🔔 Alerte
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ajouter des actifs */}
      <Card style={{overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontFamily:T.syne,fontSize:14,fontWeight:700,color:T.white}}>Ajouter à ma Watchlist</span>
        </div>
        {otherStocks.map((s,i)=>(
          <div key={s.ticker} style={{
            display:"flex",alignItems:"center",gap:12,padding:"10px 18px",
            borderTop:i>0?`1px solid ${T.border}`:"none",cursor:"pointer",transition:"background .15s",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:T.syne,fontSize:13,fontWeight:700,color:T.white}}>{s.ticker}</span>
                <Chip size={9} color={T.muted} bg="rgba(255,255,255,0.04)">{s.sector}</Chip>
              </div>
              <div style={{fontSize:11,color:T.muted}}>{s.name}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:T.syne,fontSize:14,fontWeight:700,color:T.white}}>{fmt(s.p)}</div>
              <Chip color={s.chg>0?T.green:T.red} size={10}>{s.chg>0?"▲":"▼"}{Math.abs(s.chg)}%</Chip>
            </div>
            <Btn size="sm" onClick={()=>toggle(s.ticker)}>+ Ajouter</Btn>
          </div>
        ))}
      </Card>

      {/* Modal alerte */}
      {alertStock && (
        <div onClick={()=>setAlertStock(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0C1D35",border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:360,animation:"scaleIn .2s ease"}}>
            <div style={{fontFamily:T.syne,fontSize:16,fontWeight:700,color:T.white,marginBottom:4}}>
              🔔 Alerte cours — {alertStock.ticker}
            </div>
            <div style={{fontSize:12,color:T.muted,marginBottom:16}}>
              Cours actuel : <strong style={{color:T.white}}>{fmt(alertStock.p)} FCFA</strong>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:T.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:600}}>
                Me notifier quand le cours dépasse :
              </div>
              <input type="number" value={alertPrice} onChange={e=>setAlertPrice(e.target.value)} placeholder={`Ex: ${alertStock.p+1000}`}
                style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.06)",color:T.white,border:`1.5px solid ${T.border}`,fontSize:14,outline:"none"}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn full onClick={()=>{act("ANALYZE",{ticker:alertStock.ticker});setAlertStock(null);}}>Créer l'alerte</Btn>
              <Btn variant="ghost" onClick={()=>setAlertStock(null)}>Annuler</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COURS ─────────────────────────────────────────────────────────────────────
function CoursPage() {
  const {user, act} = useAuth();
  const [selected, setSelected] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [answered, setAnswered] = useState(null);

  const QUIZ_DAILY = [
    {q:"Quel est l'indice de référence de la BRVM ?",opts:["BRVM Composite","CAC 40","Dow Jones","Nikkei"],ans:0},
    {q:"Que signifie 'dividende' ?",opts:["Part des bénéfices distribuée aux actionnaires","Prix d'une action","Volume d'échanges","Taux d'intérêt"],ans:0},
    {q:"Quelle bourse est située en Côte d'Ivoire ?",opts:["BRVM","JSE","NSE","EGX"],ans:0},
    {q:"Qu'est-ce que le PER (P/E) ?",opts:["Prix/Bénéfice — valorisation de l'action","Prix/Échanges — liquidité","Performance/Earning — rendement","Produit/Endettement — risque"],ans:0},
  ];

  const done = user?.completedCourses||[];
  const totalDone = done.length;

  const answerQuiz = (idx) => {
    setAnswered(idx);
    const ok = idx === QUIZ_DAILY[quizStep].ans;
    setTimeout(()=>{
      setAnswered(null);
      if(ok) setQuizScore(s=>s+1);
      if(quizStep >= QUIZ_DAILY.length-1) {
        setQuizDone(true);
        act("DAILY");
      } else setQuizStep(s=>s+1);
    },700);
  };

  return (
    <div style={{padding:"16px 16px 90px",maxWidth:1200,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:T.syne,fontSize:20,fontWeight:800,color:T.white,marginBottom:4}}>Académie FoutaX 🎓</h1>
          <p style={{fontSize:13,color:T.muted}}>Formations structurées pour maîtriser les marchés africains.</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          {[
            {l:"Complétés",v:`${totalDone}/${COURSES.length}`},
            {l:"Progression",v:`${Math.round(totalDone/COURSES.length*100)}%`},
          ].map((s,i)=>(
            <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
              <div style={{fontFamily:T.syne,fontSize:16,fontWeight:800,color:T.white}}>{s.v}</div>
              <div style={{fontSize:10,color:T.muted}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Défi quotidien */}
      <Card style={{marginBottom:16,overflow:"hidden",border:`1px solid ${T.gold}20`}}>
        <div style={{padding:"14px 18px",background:T.goldBg,borderBottom:`1px solid ${T.gold}15`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>⚡</span>
            <div>
              <div style={{fontFamily:T.syne,fontSize:14,fontWeight:700,color:T.white}}>Défi Quotidien</div>
              <div style={{fontSize:11,color:T.muted}}>{user?.dailyDone?"Complété aujourd'hui !":"4 questions · +75 XP · Revient demain"}</div>
            </div>
          </div>
          {!quizActive && !user?.dailyDone && <Btn onClick={()=>{setQuizActive(true);setQuizStep(0);setQuizScore(0);setQuizDone(false);}}>Commencer</Btn>}
          {user?.dailyDone && <Chip color={T.green}>✓ Terminé — +75 XP</Chip>}
        </div>
        {quizActive && !quizDone && (
          <div style={{padding:"20px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted,marginBottom:8}}>
              <span>Question {quizStep+1} / {QUIZ_DAILY.length}</span>
              <span>{quizScore} bonnes réponses</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.06)",borderRadius:4,height:4,marginBottom:16}}>
              <div style={{width:`${(quizStep/QUIZ_DAILY.length)*100}%`,height:4,borderRadius:4,background:T.gold,transition:"width .4s"}}/>
            </div>
            <div style={{fontFamily:T.syne,fontSize:16,fontWeight:700,color:T.white,marginBottom:14}}>{QUIZ_DAILY[quizStep].q}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {QUIZ_DAILY[quizStep].opts.map((o,i)=>{
                let bg="rgba(255,255,255,0.05)", border=T.border, color=T.off;
                if(answered!==null) {
                  if(i===QUIZ_DAILY[quizStep].ans){bg=T.greenBg;border=`${T.green}44`;color=T.green;}
                  else if(i===answered){bg=T.redBg;border=`${T.red}44`;color=T.red;}
                }
                return (
                  <button key={i} onClick={()=>answered===null&&answerQuiz(i)} style={{
                    background:bg,border:`1.5px solid ${border}`,color,
                    padding:"11px 14px",borderRadius:10,fontSize:13,fontWeight:500,
                    textAlign:"left",transition:"all .2s",cursor:answered!==null?"default":"pointer",
                  }}>{o}</button>
                );
              })}
            </div>
          </div>
        )}
        {quizDone && (
          <div style={{padding:"20px 18px",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:8}}>{quizScore>=3?"🏆":quizScore>=2?"⭐":"💪"}</div>
            <div style={{fontFamily:T.syne,fontSize:18,fontWeight:800,color:T.gold,marginBottom:4}}>{quizScore}/{QUIZ_DAILY.length} bonnes réponses !</div>
            <div style={{fontSize:13,color:T.muted,marginBottom:14}}>{quizScore>=3?"Excellent ! Tu maîtrises les marchés africains.":"Continue d'apprendre, tu progresses !"}</div>
            <Chip color={T.green}>+75 XP gagnés !</Chip>
          </div>
        )}
      </Card>

      {/* Grille cours */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
        {COURSES.map((c,i)=>{
          const isDone = done.includes(c.id);
          return (
            <Card key={c.id} style={{overflow:"hidden",animation:`fadeUp .4s ease ${i*0.06}s both`}} hover onClick={()=>setSelected(c)}>
              <div style={{height:80,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,background:"rgba(255,255,255,0.03)",position:"relative"}}>
                {c.icon}
                {isDone && <div style={{position:"absolute",top:8,right:8,background:T.greenBg,border:`1px solid ${T.green}30`,borderRadius:20,padding:"2px 8px",fontSize:9,color:T.green,fontWeight:700}}>✓ Terminé</div>}
                {!c.free && !isDone && <div style={{position:"absolute",top:8,right:8,fontSize:14}}>🔒</div>}
              </div>
              <div style={{padding:"14px 16px"}}>
                <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.8px",color:c.lc,marginBottom:5}}>{c.level}</div>
                <div style={{fontFamily:T.syne,fontSize:13,fontWeight:700,color:T.white,marginBottom:8,lineHeight:1.35}}>{c.title}</div>
                <p style={{fontSize:11,color:T.muted,lineHeight:1.5,marginBottom:10}}>{c.desc.slice(0,80)}…</p>
                {isDone && (
                  <div style={{background:"rgba(255,255,255,0.06)",borderRadius:4,height:4,marginBottom:10}}>
                    <div style={{width:`${c.prog||100}%`,height:4,borderRadius:4,background:c.lc}}/>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",gap:8}}>
                    <span style={{fontSize:10,color:T.muted}}><i className="ti ti-book" style={{fontSize:10}}/> {c.lessons} leçons</span>
                    <span style={{fontSize:10,color:T.muted}}><i className="ti ti-clock" style={{fontSize:10}}/> {c.dur}</span>
                  </div>
                  <Chip color={c.free?T.green:T.gold} size={9}>{c.free?"Gratuit":"Premium"}</Chip>
                </div>
                <Btn full variant={isDone?"ghost":c.free?"gold":"outline"} size="sm" onClick={()=>c.free&&act("COURSE",{id:c.id})}>
                  {isDone?"Revoir":"Commencer"}
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal cours */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0C1D35",border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:440,maxHeight:"80vh",overflowY:"auto",animation:"scaleIn .2s ease",position:"relative"}}>
            <button onClick={()=>setSelected(null)} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.07)",border:"none",color:T.muted,width:28,height:28,borderRadius:"50%",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            <div style={{fontSize:36,marginBottom:10}}>{selected.icon}</div>
            <Chip color={selected.lc} style={{marginBottom:8}}>{selected.level}</Chip>
            <h2 style={{fontFamily:T.syne,fontSize:18,fontWeight:800,color:T.white,marginBottom:8}}>{selected.title}</h2>
            <p style={{fontSize:13,color:T.muted,lineHeight:1.65,marginBottom:18}}>{selected.desc}</p>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:10}}>Programme</div>
              {Array.from({length:selected.lessons}).map((_,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",borderRadius:8,marginBottom:6,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:i<2?T.greenBg:`rgba(255,255,255,0.06)`,border:i<2?`1px solid ${T.green}30`:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<2?T.green:T.muted,flexShrink:0}}>
                    {i<2?"✓":i+1}
                  </div>
                  <span style={{fontSize:13,color:i<2?T.off:T.muted,flex:1}}>Leçon {i+1}</span>
                  <span style={{fontSize:10,color:T.muted}}>{8+i*4} min</span>
                  {!selected.free&&i>1&&<span style={{fontSize:12}}>🔒</span>}
                </div>
              ))}
            </div>
            {selected.free
              ? <Btn full onClick={()=>{act("COURSE",{id:selected.id});setSelected(null);}}>Commencer le module → +{selected.lessons*40} XP</Btn>
              : <Btn full variant="gold">👑 Débloquer avec Premium</Btn>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIMULATEUR ────────────────────────────────────────────────────────────────
function SimulateurPage() {
  const {user, act} = useAuth();
  const [ticker, setTicker] = useState("SONATEL");
  const [qty, setQty] = useState(5);
  const [msg, setMsg] = useState(null);
  const [tab, setTab] = useState("buy");
  const [sparkData] = useState(() => STOCKS.reduce((a,s)=>{a[s.ticker]=genSparkData(40,s.chg>0);return a;},{}));

  const prices = STOCKS.reduce((a,s)=>{a[s.ticker]=s.p;return a;},{});
  const cash = user?.portfolio?.cash ?? 500000;
  const positions = user?.portfolio?.positions || [];
  const total = (prices[ticker]||0) * qty;
  const portfolioValue = positions.reduce((a,p)=>(a+(prices[p.ticker]||p.price)*p.qty),0) + cash;
  const pnlTotal = portfolioValue - 500000;
  const pnlPct = ((portfolioValue-500000)/500000*100).toFixed(2);

  const buy = () => {
    if(total > cash){setMsg({text:"Liquidités insuffisantes",ok:false});return;}
    if(qty<=0){setMsg({text:"Quantité invalide",ok:false});return;}
    const pos = [...positions];
    const ex = pos.find(p=>p.ticker===ticker);
    if(ex){ ex.qty+=qty; ex.price=Math.round((ex.price*ex.qty+prices[ticker]*qty)/(ex.qty+qty)); }
    else pos.push({ticker,qty,price:prices[ticker]});
    act("BUY",{portfolio:{cash:cash-total,positions:pos,history:[...(user?.portfolio?.history||[500000]),portfolioValue-total+prices[ticker]*qty]}});
    setMsg({text:`✓ Acheté ${qty} × ${ticker} pour ${fmt(total)} FCFA`,ok:true});
    setTimeout(()=>setMsg(null),3500);
  };

  const sell = (pticker) => {
    const pos = positions.filter(p=>p.ticker!==pticker);
    const sold = positions.find(p=>p.ticker===pticker);
    if(!sold) return;
    const newCash = cash + sold.qty*(prices[sold.ticker]||sold.price);
    act("BUY",{portfolio:{cash:newCash,positions:pos,history:[...(user?.portfolio?.history||[]),newCash]}});
    setMsg({text:`✓ Position ${pticker} liquidée`,ok:true});
    setTimeout(()=>setMsg(null),3000);
  };

  return (
    <div style={{padding:"16px 16px 90px",maxWidth:1200,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:T.syne,fontSize:20,fontWeight:800,color:T.white,marginBottom:4}}>Simulateur Portefeuille 💼</h1>
          <p style={{fontSize:13,color:T.muted}}>500 000 FCFA virtuels pour apprendre sans risque.</p>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[
            {l:"Valeur totale",v:`${fmt(Math.round(portfolioValue))} FCFA`,c:T.gold},
            {l:"P&L",v:`${pnlTotal>=0?"+":""}${fmt(Math.round(pnlTotal))} FCFA`,c:pnlTotal>=0?T.green:T.red},
            {l:"Rendement",v:`${pnlPct}%`,c:pnlTotal>=0?T.green:T.red},
          ].map((s,i)=>(
            <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
              <div style={{fontFamily:T.syne,fontSize:15,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:T.muted}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {/* Passage d'ordre */}
        <Card style={{padding:"18px"}}>
          {/* Tabs */}
          <div style={{display:"flex",gap:0,marginBottom:18,background:"rgba(255,255,255,0.05)",borderRadius:10,padding:3}}>
            {["buy","sell"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                flex:1,padding:"8px",borderRadius:8,
                background:tab===t?(t==="buy"?T.greenBg:T.redBg):"transparent",
                border:tab===t?`1px solid ${(t==="buy"?T.green:T.red)}30`:"none",
                color:tab===t?(t==="buy"?T.green:T.red):T.muted,
                fontSize:13,fontWeight:tab===t?700:400,
              }}>{t==="buy"?"🟢 Acheter":"🔴 Vendre"}</button>
            ))}
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6,fontWeight:600}}>Action</div>
            <select value={ticker} onChange={e=>setTicker(e.target.value)} style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.06)",color:T.white,border:`1px solid ${T.border}`,borderRadius:10,fontSize:13,outline:"none"}}>
              {STOCKS.map(s=><option key={s.ticker} value={s.ticker}>{s.ticker} — {fmt(s.p)} FCFA</option>)}
            </select>
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6,fontWeight:600}}>Quantité d'actions</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setQty(Math.max(1,qty-1))} style={{width:36,height:36,borderRadius:8,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,color:T.white,fontSize:18}}>−</button>
              <input type="number" value={qty} min={1} max={1000} onChange={e=>setQty(Math.max(1,parseInt(e.target.value)||1))} style={{flex:1,padding:"9px 14px",background:"rgba(255,255,255,0.06)",color:T.white,border:`1px solid ${T.border}`,borderRadius:10,fontSize:14,fontWeight:700,textAlign:"center",outline:"none"}}/>
              <button onClick={()=>setQty(qty+1)} style={{width:36,height:36,borderRadius:8,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,color:T.white,fontSize:18}}>+</button>
            </div>
          </div>

          {/* Résumé ordre */}
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 14px",marginBottom:16}}>
            {[
              {l:"Prix unitaire",v:`${fmt(prices[ticker])} FCFA`},
              {l:"Quantité",v:qty},
              {l:"Commission (0.5%)",v:`${fmt(Math.round(total*0.005))} FCFA`},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.muted,marginBottom:4}}><span>{r.l}</span><span>{r.v}</span></div>
            ))}
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,color:T.white}}>
              <span>Total estimé</span><span style={{color:T.gold,fontFamily:T.syne}}>{fmt(total)} FCFA</span>
            </div>
          </div>

          {msg && <div style={{background:msg.ok?T.greenBg:T.redBg,border:`1px solid ${msg.ok?T.green:T.red}44`,borderRadius:8,padding:"8px 12px",fontSize:12,color:msg.ok?T.green:T.red,marginBottom:12}}>{msg.text}</div>}
          <Btn full variant="green" size="lg" onClick={buy} disabled={total>cash}>Acheter — {fmt(total)} FCFA</Btn>
          <div style={{fontSize:11,color:T.muted,textAlign:"center",marginTop:8}}>Liquidités disponibles : <strong style={{color:T.white}}>{fmt(cash)} FCFA</strong></div>
        </Card>

        {/* Portefeuille */}
        <Card style={{padding:"18px"}}>
          <div style={{fontFamily:T.syne,fontSize:14,fontWeight:700,color:T.white,marginBottom:16}}>Mon Portefeuille</div>

          {/* Allocation visuelle */}
          {positions.length > 0 && (
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:1,marginBottom:8}}>
                {positions.map((p,i)=>{
                  const val = p.qty*(prices[p.ticker]||p.price);
                  const pct = val/portfolioValue*100;
                  const colors=[T.gold,T.green,T.blue,T.purple,T.red,T.cyan];
                  return <div key={p.ticker} style={{width:`${pct}%`,background:colors[i%6],borderRadius:2}}/>;
                })}
                <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:2}}/>
              </div>
            </div>
          )}

          {positions.length === 0
            ? <div style={{textAlign:"center",padding:"32px 0",color:T.muted,fontSize:13}}>Aucune position ouverte.<br/>Achetez votre première action !</div>
            : positions.map((p,i)=>{
              const cur = prices[p.ticker]||p.price;
              const val = p.qty*cur;
              const pnl = val - p.qty*p.price;
              const pnlP = (pnl/(p.qty*p.price)*100).toFixed(2);
              return (
                <div key={p.ticker} style={{borderTop:i>0?`1px solid ${T.border}`:"none",padding:"10px 0",display:"flex",alignItems:"center",gap:10}}>
                  <Sparkline data={sparkData[p.ticker]} color={pnl>=0?T.green:T.red} height={32} width={60}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:T.syne,fontSize:13,fontWeight:700,color:T.white}}>{p.ticker}</div>
                    <div style={{fontSize:10,color:T.muted}}>{p.qty} actions × {fmt(cur)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.white,fontFamily:T.syne}}>{fmt(Math.round(val))}</div>
                    <div style={{fontSize:10,fontWeight:700,color:pnl>=0?T.green:T.red}}>{pnl>=0?"+":""}{fmt(Math.round(pnl))} ({pnlP}%)</div>
                  </div>
                  <button onClick={()=>sell(p.ticker)} style={{width:26,height:26,borderRadius:6,background:T.redBg,border:`1px solid ${T.red}30`,color:T.red,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
              );
            })
          }

          {/* Liquidités */}
          <div style={{background:T.goldBg,border:`1px solid ${T.gold}25`,borderRadius:10,padding:"10px 14px",marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:T.muted}}>Liquidités disponibles</div>
              <div style={{fontFamily:T.syne,fontSize:18,fontWeight:800,color:T.gold}}>{fmt(cash)} FCFA</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:T.muted}}>Positions</div>
              <div style={{fontFamily:T.syne,fontSize:16,fontWeight:700,color:T.white}}>{positions.length}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── KIDSX ACADEMY ─────────────────────────────────────────────────────────────
function KidsXPage() {
  const {user, act} = useAuth();
  const [lesson, setLesson] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [done, setDone] = useState(false);
  const [stars, setStars] = useState([]);

  const QUIZZES = {
    k3:[
      {q:"Qu'est-ce qu'une entreprise ?",opts:["Un groupe de personnes qui travaillent ensemble","Un magasin de jouets","Une école","Un terrain de sport"],ans:0},
      {q:"Comment une entreprise gagne de l'argent ?",opts:["En vendant des produits","En dormant","En jouant","En étudiant"],ans:0},
    ],
    k4:[
      {q:"Qu'est-ce qu'une action ?",opts:["Une petite part d'une entreprise","Un billet","Un ticket","Un livre"],ans:0},
      {q:"Acheter une action SONATEL, c'est devenir...?",opts:["Petit propriétaire","Employé","Directeur","Client"],ans:0},
    ],
    k5:[
      {q:"Où se trouve la BRVM ?",opts:["Abidjan, Côte d'Ivoire","Paris, France","Lagos, Nigéria","Le Caire, Égypte"],ans:0},
      {q:"Combien de pays participent à la BRVM ?",opts:["8 pays UEMOA","5 pays","12 pays","3 pays"],ans:0},
    ],
  };

  const spawnStars = () => {
    setStars(Array.from({length:8},(_,i)=>({id:i,x:Math.random()*90+5,y:Math.random()*80+5,delay:i*0.08})));
    setTimeout(()=>setStars([]),2500);
  };

  const answer = (i) => {
    if(answered!==null) return;
    setAnswered(i);
    const quiz = QUIZZES[lesson?.id]||[];
    const ok = i===quiz[qIdx]?.ans;
    if(ok){setScore(s=>s+1);spawnStars();}
    setTimeout(()=>{
      setAnswered(null);
      if(qIdx>=quiz.length-1){setDone(true);act("DAILY");}
      else setQIdx(q=>q+1);
    },900);
  };

  const doneLessons = KIDS_LESSONS.filter(l=>l.done).length;
  const kidsXP = KIDS_LESSONS.filter(l=>l.done).reduce((a,l)=>a+l.xp,0);

  if(lesson) {
    const quiz = QUIZZES[lesson.id]||[];
    return (
      <div style={{padding:"16px 16px 90px",maxWidth:640,margin:"0 auto"}}>
        <button onClick={()=>{setLesson(null);setQIdx(0);setScore(0);setDone(false);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:T.gold,fontSize:13,fontWeight:600,marginBottom:20,padding:0}}>
          <i className="ti ti-arrow-left"/> Retour à KidsX Academy
        </button>
        <Card style={{padding:"24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          {stars.map(s=>(
            <div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,fontSize:20,animation:`starPop .6s ease ${s.delay}s both`,pointerEvents:"none",zIndex:10}}>⭐</div>
          ))}
          <div style={{fontSize:56,marginBottom:12,animation:"bounce 2s infinite"}}>{lesson.emoji}</div>
          <h2 style={{fontFamily:T.syne,fontSize:20,fontWeight:800,color:T.white,marginBottom:8}}>{lesson.title}</h2>
          <Chip color="#FFD700" style={{marginBottom:20}}>{lesson.level}</Chip>

          {quiz.length===0 ? (
            <div>
              <div style={{fontSize:14,color:T.muted,lineHeight:1.7,marginBottom:20}}>Cette leçon est en cours de préparation. Reviens bientôt !</div>
              <Btn onClick={()=>{act("DAILY");setLesson(null);}}>Terminer → +{lesson.xp} XP</Btn>
            </div>
          ) : !done ? (
            <div style={{textAlign:"left"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted,marginBottom:8}}>
                <span>Question {qIdx+1}/{quiz.length}</span>
                <span style={{color:"#FFD700"}}>{score} ⭐</span>
              </div>
              <div style={{background:"rgba(255,255,255,0.08)",borderRadius:4,height:6,marginBottom:18}}>
                <div style={{width:`${(qIdx/quiz.length)*100}%`,height:6,borderRadius:4,background:"#FFD700",transition:"width .4s"}}/>
              </div>
              <div style={{fontFamily:T.syne,fontSize:17,fontWeight:700,color:T.white,marginBottom:16}}>{quiz[qIdx].q}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {quiz[qIdx].opts.map((o,i)=>{
                  const ok2 = i===quiz[qIdx].ans;
                  let bg="rgba(255,255,255,0.05)",border=T.border,color=T.off;
                  if(answered!==null){
                    if(ok2){bg="rgba(34,197,94,.15)";border=`${T.green}44`;color=T.green;}
                    else if(i===answered){bg="rgba(239,68,68,.15)";border=`${T.red}44`;color=T.red;}
                  }
                  return (
                    <button key={i} onClick={()=>answer(i)} style={{
                      background:bg,border:`1.5px solid ${border}`,color,
                      padding:"13px 12px",borderRadius:12,fontSize:13,fontWeight:500,
                      textAlign:"left",lineHeight:1.4,
                      cursor:answered!==null?"default":"pointer",transition:"all .2s",
                    }}>{o}</button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{animation:"scaleIn .3s ease"}}>
              <div style={{fontSize:52,marginBottom:8}}>{score===quiz.length?"🏆":score>0?"⭐":"💪"}</div>
              <div style={{fontFamily:T.syne,fontSize:20,fontWeight:800,color:"#FFD700",marginBottom:6}}>{score}/{quiz.length} bonnes réponses !</div>
              <div style={{fontSize:13,color:T.muted,marginBottom:18}}>{score===quiz.length?"Parfait ! Tu es un génie de la finance 🎉":score>0?"Bien joué ! Continue comme ça !":"Tu apprendras avec le temps, c'est normal !"}</div>
              <div style={{background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.25)",borderRadius:10,padding:"10px 16px",display:"inline-block",marginBottom:18}}>
                <span style={{color:"#FFD700",fontWeight:800,fontFamily:T.syne}}>+{lesson.xp} XP</span>
                <span style={{color:T.muted,fontSize:12}}> gagnés !</span>
              </div>
              <br/>
              <Btn onClick={()=>{setLesson(null);setQIdx(0);setScore(0);setDone(false);}}>Continuer l'aventure ↗</Btn>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div style={{padding:"16px 16px 90px",maxWidth:1200,margin:"0 auto"}}>
      {/* Hero KidsX */}
      <div style={{background:`linear-gradient(135deg,${T.card} 0%,#1a2a4a 100%)`,borderRadius:16,padding:"22px 20px",marginBottom:16,border:"1px solid rgba(255,215,0,0.15)",position:"relative",overflow:"hidden",animation:"fadeUp .4s ease"}}>
        <div style={{position:"absolute",right:-20,top:-20,fontSize:100,opacity:.05,pointerEvents:"none"}}>🦁</div>
        <div style={{position:"absolute",right:80,bottom:-15,fontSize:70,opacity:.04,pointerEvents:"none"}}>⭐</div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,215,0,0.15)",border:"1px solid rgba(255,215,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🎓</div>
          <div>
            <h1 style={{fontFamily:T.syne,fontSize:22,fontWeight:800,color:"#FFD700",letterSpacing:"-0.5px"}}>KidsX Academy</h1>
            <p style={{fontSize:13,color:T.muted}}>Apprends la finance africaine — c'est fun, facile et super utile !</p>
          </div>
        </div>
        {/* Stats kids */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {[
            {l:"Leçons terminées",v:`${doneLessons}/${KIDS_LESSONS.length}`,c:"#FFD700"},
            {l:"XP gagnés",v:kidsXP,c:"#FFD700"},
            {l:"Badges",v:user?.badges?.length||0,c:T.gold},
          ].map((s,i)=>(
            <div key={i} style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:10,padding:"8px 16px"}}>
              <div style={{fontFamily:T.syne,fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:T.muted}}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Barre prog globale */}
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted,marginBottom:5}}>
            <span>Progression globale</span><span>{Math.round(doneLessons/KIDS_LESSONS.length*100)}%</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:6,height:8}}>
            <div style={{width:`${doneLessons/KIDS_LESSONS.length*100}%`,height:8,borderRadius:6,background:"#FFD700",boxShadow:"0 0 10px rgba(255,215,0,.4)",transition:"width .6s"}}/>
          </div>
        </div>
      </div>

      {/* Grille leçons */}
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:T.syne,fontSize:15,fontWeight:700,color:T.white,marginBottom:12}}>Mes leçons 📚</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
          {KIDS_LESSONS.map((l,i)=>(
            <div key={l.id} onClick={()=>{if(!l.done){setLesson(l);setQIdx(0);setScore(0);setDone(false);}}} style={{
              background:l.done?"rgba(34,197,94,.07)":"#111E33",
              border:l.done?`1px solid ${T.green}25`:`1px solid ${T.border}`,
              borderRadius:14,padding:"14px 12px",textAlign:"center",
              cursor:l.done?"default":"pointer",
              transition:"all .2s",
              animation:`fadeUp .4s ease ${i*0.06}s both`,
            }}
              onMouseEnter={e=>{if(!l.done){e.currentTarget.style.borderColor=l.color+"44";e.currentTarget.style.background="rgba(255,215,0,0.04)";}}}
              onMouseLeave={e=>{if(!l.done){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="#111E33";}}}
            >
              <div style={{fontSize:32,marginBottom:8,filter:l.done?"none":"drop-shadow(0 0 4px rgba(255,215,0,.2))"}}>{l.emoji}</div>
              <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",color:l.color,marginBottom:4}}>{l.level}</div>
              <div style={{fontFamily:T.syne,fontSize:11,fontWeight:700,color:T.white,marginBottom:8,lineHeight:1.3}}>{l.title}</div>
              {l.done
                ? <Chip color={T.green} size={9}>✓ Terminé</Chip>
                : <Chip color="#FFD700" size={9}>+{l.xp} XP</Chip>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Badges kids */}
      <Card style={{padding:"16px",marginBottom:14}}>
        <div style={{fontFamily:T.syne,fontSize:14,fontWeight:700,color:T.white,marginBottom:12}}>Mes trophées 🏅</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[
            {emoji:"🌟",name:"Épargnant",earned:doneLessons>=1},
            {emoji:"📚",name:"Curieux",earned:doneLessons>=2},
            {emoji:"🔍",name:"Analyste",earned:doneLessons>=4},
            {emoji:"💰",name:"Investisseur",earned:doneLessons>=6},
            {emoji:"🦁",name:"Lion BRVM",earned:doneLessons>=8},
            {emoji:"👑",name:"Champion",earned:doneLessons>=8&&user?.xp>=500},
          ].map((b,i)=>(
            <div key={i} title={b.name} style={{
              width:52,height:52,borderRadius:12,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              background:b.earned?"rgba(255,215,0,0.1)":"rgba(255,255,255,0.04)",
              border:b.earned?"1px solid rgba(255,215,0,0.25)":`1px solid ${T.border}`,
              opacity:b.earned?1:0.35,filter:b.earned?"none":"grayscale(1)",
              cursor:"help",gap:2,
            }}>
              <span style={{fontSize:22}}>{b.emoji}</span>
              <span style={{fontSize:7,color:b.earned?"#FFD700":T.muted,fontWeight:700,textAlign:"center",lineHeight:1}}>{b.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Bannière parents */}
      <Card style={{padding:"16px",border:`1px solid ${T.gold}20`}}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{width:44,height:44,borderRadius:12,background:T.goldBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>👨‍👩‍👧</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:T.syne,fontSize:13,fontWeight:700,color:T.white,marginBottom:2}}>Espace Parents</div>
            <div style={{fontSize:12,color:T.muted,lineHeight:1.5}}>Suivez la progression de votre enfant et accédez au contenu éducatif complet avec KidsX Premium.</div>
          </div>
          <Btn size="sm" onClick={()=>{}}>En savoir plus</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── PREMIUM ───────────────────────────────────────────────────────────────────
function PremiumPage() {
  const {upgrade, isPrem} = useAuth();

  const plans = [
    {name:"Gratuit",price:"0",per:"",cta:"Plan actuel",dis:true,
     features:[
       {t:"4 modules de formation",ok:true},
       {t:"Données différées 15min",ok:true},
       {t:"Simulateur 500k FCFA",ok:true},
       {t:"Watchlist 5 actifs",ok:true},
       {t:"Alertes de cours",ok:false},
       {t:"Analyses IA",ok:false},
       {t:"KidsX complet",ok:false},
       {t:"Certification",ok:false},
     ]},
    {name:"Gold",price:"4 990",per:"/mois",cta:"Choisir Gold",feat:true,
     features:[
       {t:"12 modules complets",ok:true},
       {t:"Données quasi temps réel",ok:true},
       {t:"Simulateur illimité",ok:true},
       {t:"Watchlist illimitée",ok:true},
       {t:"10 alertes/mois",ok:true},
       {t:"Analyses IA quotidiennes",ok:true},
       {t:"KidsX Academy complet",ok:true},
       {t:"Certification FoutaX",ok:true},
     ]},
    {name:"Pro",price:"9 990",per:"/mois",cta:"Choisir Pro",
     features:[
       {t:"Tout Gold inclus",ok:true},
       {t:"Données live temps réel",ok:true},
       {t:"API données UEMOA",ok:true},
       {t:"Alertes illimitées",ok:true},
       {t:"Signaux IA hebdomadaires",ok:true},
       {t:"Rapport mensuel PDF",ok:true},
       {t:"Accès bêta fonctionnalités",ok:true},
       {t:"Support prioritaire 1-to-1",ok:true},
     ]},
  ];

  return (
    <div style={{padding:"16px 16px 90px",maxWidth:1200,margin:"0 auto"}}>
      {/* Hero */}
      <div style={{textAlign:"center",background:T.card,borderRadius:16,padding:"36px 24px",marginBottom:20,border:`1px solid ${T.border}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%, rgba(232,160,32,.04), transparent 60%)",pointerEvents:"none"}}/>
        <div style={{fontSize:40,marginBottom:12}}>👑</div>
        <h1 style={{fontFamily:T.syne,fontSize:26,fontWeight:800,color:T.white,marginBottom:8,letterSpacing:"-0.5px"}}>Débloquez tout FoutaX</h1>
        <p style={{fontSize:14,color:T.muted,maxWidth:400,margin:"0 auto 24px",lineHeight:1.7}}>Données avancées, analyses IA, KidsX Academy complet et formations certifiantes pour devenir un investisseur expert.</p>
        {!isPrem && (
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            {[["📊","Données live"],["🤖","Analyses IA"],["🎓","KidsX complet"],["📜","Certification"]].map(([ic,lb],i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:T.goldBg,border:`1px solid ${T.gold}25`,borderRadius:20,padding:"6px 14px"}}>
                <span style={{fontSize:14}}>{ic}</span>
                <span style={{fontSize:12,color:T.gold,fontWeight:600}}>{lb}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plans */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:20}}>
        {plans.map(p=>(
          <div key={p.name} style={{
            background:p.feat?T.goldBg:T.card,
            border:p.feat?`2px solid ${T.gold}44`:`1px solid ${T.border}`,
            borderRadius:14,padding:"20px 18px",
            position:"relative",
          }}>
            {p.feat && <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:T.gold,color:T.night,fontSize:10,fontWeight:800,padding:"3px 14px",borderRadius:20,whiteSpace:"nowrap",fontFamily:T.syne}}>⭐ Plus populaire</div>}
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:T.muted,marginBottom:8}}>{p.name}</div>
            <div style={{fontFamily:T.syne,fontSize:28,fontWeight:800,color:T.white,marginBottom:2}}>
              {p.price}<span style={{fontSize:11,fontWeight:400,color:T.muted}}> FCFA{p.per}</span>
            </div>
            <ul style={{listStyle:"none",margin:"14px 0",padding:0}}>
              {p.features.map((f,i)=>(
                <li key={i} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"4px 0",fontSize:12,color:f.ok?T.off:T.muted}}>
                  <span style={{color:f.ok?T.green:T.muted,flexShrink:0,marginTop:1}}>{f.ok?"✓":"✕"}</span>{f.t}
                </li>
              ))}
            </ul>
            <Btn full variant={p.dis?"ghost":p.feat?"gold":"outline"} size="md" disabled={p.dis||isPrem} onClick={()=>!p.dis&&upgrade(p.name.toLowerCase())}>
              {isPrem&&p.feat?"Plan actuel":p.cta}
            </Btn>
          </div>
        ))}
      </div>

      {/* FAQ rapide */}
      <Card style={{padding:"20px"}}>
        <div style={{fontFamily:T.syne,fontSize:15,fontWeight:700,color:T.white,marginBottom:16}}>Questions fréquentes</div>
        {[
          {q:"Comment régler mon abonnement ?",r:"Via Orange Money, Wave, carte bancaire ou Mobile Money. Paiement 100% sécurisé via CinetPay."},
          {q:"Puis-je annuler à tout moment ?",r:"Oui, sans engagement. L'annulation prend effet à la fin de la période de facturation en cours."},
          {q:"KidsX Academy est-il inclus dans Gold ?",r:"Oui, entièrement. Les 8 leçons, les quiz, les badges et l'espace parents sont inclus dans Gold et Pro."},
          {q:"Que contient la Certification FoutaX ?",r:"Une attestation PDF officielle valable comme justificatif de formation en finance africaine."},
        ].map((f,i)=>(
          <div key={i} style={{borderTop:i>0?`1px solid ${T.border}`:"none",padding:"12px 0"}}>
            <div style={{fontSize:13,fontWeight:600,color:T.white,marginBottom:5}}>{f.q}</div>
            <div style={{fontSize:12,color:T.muted,lineHeight:1.65}}>{f.r}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── LOADING ───────────────────────────────────────────────────────────────────
function Loading() {
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.night}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:14,background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.syne,fontSize:20,fontWeight:800,color:T.night,margin:"0 auto 16px",boxShadow:`0 0 30px ${T.gold}40`,animation:"glow 2s infinite"}}>FX</div>
        <div style={{fontFamily:T.syne,fontSize:22,fontWeight:800,color:T.white,letterSpacing:"-0.5px"}}>Fouta<span style={{color:T.gold}}>X</span></div>
        <div style={{fontSize:12,color:T.muted,marginTop:8}}>Chargement…</div>
        <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:16}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.gold,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD PRINCIPAL ───────────────────────────────────────────────────────
function Dashboard() {
  const [active, setActive] = useState("dashboard");
  const PAGES = {
    dashboard:  <DashboardPage setActive={setActive}/>,
    watchlist:  <WatchlistPage/>,
    cours:      <CoursPage/>,
    simulateur: <SimulateurPage/>,
    kidsx:      <KidsXPage/>,
    premium:    <PremiumPage/>,
  };
  return (
    <div style={{minHeight:"100vh",background:T.night}}>
      <Navbar active={active} setActive={setActive}/>
      <div style={{paddingBottom:2,animation:"fadeIn .3s ease"}}>
        {PAGES[active] || PAGES.dashboard}
      </div>
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
function Inner() {
  const {isAuth, loading} = useAuth();
  if(loading) return <Loading/>;
  return <>{isAuth ? <Dashboard/> : <AuthPage/>}<Toast/></>;
}

export default function App() {
  return <AuthProvider><Inner/></AuthProvider>;
}
