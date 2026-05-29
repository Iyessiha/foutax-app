import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth, FOUTAX_THEME as T } from "./context/AuthContext";
import { XPToast, XPBar } from "./components/XPToast";
import AuthPage from "./pages/AuthPage";
import UserProfile from "./pages/UserProfile";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0A1628;color:#fff;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0A1628}
::-webkit-scrollbar-thumb{background:#2A3A55;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#E8A020}
button{cursor:pointer;font-family:'DM Sans',sans-serif}
input::placeholder{color:rgba(255,255,255,0.2)}
select option{background:#0F1F38;color:#fff}
::selection{background:rgba(232,160,32,0.3)}
*{-webkit-tap-highlight-color:transparent}
@keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes starPop{0%{transform:scale(0) rotate(-30deg)}60%{transform:scale(1.3) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
.fade-in{animation:fadeIn .4s ease forwards}
.count-up{animation:countUp .5s ease forwards}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const BOURSES = [
  { id:"brvm", name:"BRVM", sub:"UEMOA",      index:"BRVM Composite", val:"420.33", chg:"+0.48%", up:true,  x:"22%", y:"38%", color:"#E8A020" },
  { id:"nse",  name:"NSE",  sub:"NIGÉRIA",    index:"NGX All Share",  val:"50,124.67",chg:"+0.72%",up:true, x:"26%", y:"44%", color:"#3DCF8E" },
  { id:"bvmac",name:"BVMAC",sub:"CEMAC",      index:"BVMAC Index",    val:"187.56",  chg:"+0.55%",up:true,  x:"30%", y:"52%", color:"#7F77DD" },
  { id:"jse",  name:"JSE",  sub:"AFRIQUE DU SUD",index:"FTSE/JSE All Share",val:"72,815.12",chg:"+0.63%",up:true,x:"48%",y:"72%",color:"#3DCF8E"},
  { id:"egx",  name:"EGX",  sub:"ÉGYPTE",     index:"EGX 30",         val:"11,240.56",chg:"-0.35%",up:false,x:"54%", y:"22%", color:"#F06060" },
  { id:"bvc",  name:"BVC",  sub:"MAROC",      index:"MASI",           val:"13,278.45",chg:"+0.41%",up:true,  x:"34%", y:"16%", color:"#E8A020" },
  { id:"nse2", name:"NSE",  sub:"KENYA",      index:"KENE 20",        val:"1,845.32", chg:"+0.58%",up:true,  x:"56%", y:"50%", color:"#3DCF8E" },
];

const NEWS = [
  { text:"Zone de libre-échange continentale africaine en expansion",  time:"2h" },
  { text:"Le Nigeria Stock Exchange atteint un nouveau sommet",          time:"3h" },
  { text:"Bourse du Maroc MASI en hausse constante depuis janvier",     time:"5h" },
  { text:"Hausse des investissements en Afrique du Sud",                 time:"7h" },
  { text:"SONATEL annonce un dividende exceptionnel 2025",               time:"8h" },
];

const STOCKS = [
  { ticker:"SONATEL",   name:"Sonatel SA",        price:"29 000", chg:"+2.84%", up:true  },
  { ticker:"PALM-CI",   name:"Palmci",             price:"4 800",  chg:"+1.50%", up:true  },
  { ticker:"BOA-CI",    name:"Bank of Africa CI",  price:"6 200",  chg:"-0.80%", up:false },
  { ticker:"SOLIBRA",   name:"Solibra",             price:"95 000", chg:"+0.40%", up:true  },
  { ticker:"NESTLE-CI", name:"Nestlé CI",           price:"7 300",  chg:"-1.20%", up:false },
];

const KIDSX_LESSONS = [
  { id:1, emoji:"🌱", title:"C'est quoi la bourse ?",     level:"Niveau 1", xp:50,  color:"#3DCF8E", done:true  },
  { id:2, emoji:"🐷", title:"Épargner son argent de poche",level:"Niveau 1", xp:50,  color:"#3DCF8E", done:true  },
  { id:3, emoji:"📈", title:"Les actions, c'est quoi ?",   level:"Niveau 2", xp:80,  color:"#E8A020", done:false },
  { id:4, emoji:"🏪", title:"Acheter des parts d'une boutique",level:"Niveau 2",xp:80,color:"#E8A020",done:false},
  { id:5, emoji:"🌍", title:"Les bourses africaines",      level:"Niveau 3", xp:100, color:"#7F77DD", done:false },
  { id:6, emoji:"🦁", title:"Devenir un investisseur lion", level:"Niveau 3", xp:150, color:"#F06060", done:false },
];

const KIDSX_BADGES = [
  { emoji:"🌟", name:"Épargnant",  earned:true  },
  { emoji:"📚", name:"Curieux",    earned:true  },
  { emoji:"💰", name:"Investisseur",earned:false },
  { emoji:"🦁", name:"Lion BRVM",  earned:false },
  { emoji:"🏆", name:"Champion",   earned:false },
  { emoji:"👑", name:"Légende",    earned:false },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const card = (extra={}) => ({
  background:"#0F1F38", border:"1px solid rgba(255,255,255,0.07)",
  borderRadius:12, ...extra,
});
const gold = (extra={}) => ({
  background:T.gold, color:T.night, border:"none",
  fontFamily:"'Syne',sans-serif", fontWeight:800,
  borderRadius:10, cursor:"pointer", ...extra,
});

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ color="#E8A020", up=true }) {
  const pts = Array.from({length:20},(_,i)=>50+Math.sin(i/2)*15+(up?i:-i)*1.2+(Math.random()-0.5)*8);
  const min=Math.min(...pts), max=Math.max(...pts), range=max-min||1;
  const w=80,h=28;
  const d = pts.map((v,i)=>`${i===0?"M":"L"}${(i/(pts.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  return (
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </svg>
  );
}

// ─── MINI CHART (multi-ligne) ─────────────────────────────────────────────────
function MultiLineChart() {
  const W=500, H=120, PAD=30;
  const points = 40;
  const series = [
    { name:"BRVM Composite", color:"#E8A020", base:0.6 },
    { name:"NGX All Share",   color:"#3DCF8E", base:0.4 },
    { name:"FTSE/JSE",        color:"#7F77DD", base:0.7 },
  ];
  const data = series.map(s=>({
    ...s,
    pts: Array.from({length:points},(_,i)=>
      s.base + Math.sin(i/5+s.base*10)*0.15 + (i/points)*0.25 + (Math.random()-0.5)*0.05
    )
  }));
  const allVals = data.flatMap(s=>s.pts);
  const minV=Math.min(...allVals), maxV=Math.max(...allVals), range=maxV-minV||1;
  const px=(i)=>PAD+(i/(points-1))*(W-PAD*2);
  const py=(v)=>H-PAD-((v-minV)/range)*(H-PAD*2);
  const labels=["0","1S","1M","3M","1A"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      {[0.25,0.5,0.75,1].map(t=>(
        <line key={t} x1={PAD} y1={py(minV+t*range)} x2={W-PAD} y2={py(minV+t*range)}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>
      ))}
      {labels.map((l,i)=>(
        <text key={i} x={PAD+(i/(labels.length-1))*(W-PAD*2)} y={H-6}
          fill="rgba(255,255,255,0.35)" fontSize={9} textAnchor="middle">{l}</text>
      ))}
      {data.map(s=>{
        const d=s.pts.map((v,i)=>`${i===0?"M":"L"}${px(i)},${py(v)}`).join(" ");
        return <path key={s.name} d={d} fill="none" stroke={s.color} strokeWidth={1.8} strokeLinecap="round"/>;
      })}
    </svg>
  );
}

// ─── AFRICA MAP SVG (simplifié) ────────────────────────────────────────────────
function AfricaMap({ onSelect, selected }) {
  return (
    <div style={{position:"relative",width:"100%",maxWidth:360,margin:"0 auto"}}>
      <svg viewBox="0 0 300 340" style={{width:"100%",opacity:.7}}>
        <path d="M100,20 L180,15 L220,40 L240,80 L250,130 L240,180 L220,230 L190,280 L160,310 L140,320 L120,310 L100,280 L80,240 L60,200 L50,160 L55,110 L70,70 Z"
          fill="#0F1F38" stroke="rgba(255,255,255,0.12)" strokeWidth={1}/>
        <path d="M80,100 L100,90 L120,95 L110,120 L90,125 Z" fill="#162840"/>
        <path d="M60,170 L90,160 L100,180 L80,195 L60,190 Z" fill="#162840"/>
        <path d="M160,60 L190,55 L210,70 L200,90 L170,88 Z" fill="#162840"/>
        <path d="M190,160 L220,155 L235,175 L215,190 L190,185 Z" fill="#162840"/>
        <path d="M160,230 L185,225 L195,245 L175,258 L158,250 Z" fill="#162840"/>
      </svg>
      {BOURSES.map(b=>(
        <button key={b.id+b.sub} onClick={()=>onSelect(b)} style={{
          position:"absolute", left:b.x, top:b.y,
          background:selected?.id===b.id?"rgba(232,160,32,0.25)":"rgba(15,31,56,0.9)",
          border:`1px solid ${selected?.id===b.id?T.gold:"rgba(255,255,255,0.15)"}`,
          borderRadius:6, padding:"3px 7px", cursor:"pointer",
          transform:"translate(-50%,-50%)",
          transition:"all .2s",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:b.color,flexShrink:0}}/>
            <span style={{fontSize:9,fontWeight:700,color:T.white,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"}}>{b.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ active, setActive }) {
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const tabs = [
    { id:"dashboard",  label:"Marché",     icon:"ti-chart-bar" },
    { id:"cours",      label:"Apprendre",  icon:"ti-book" },
    { id:"simulateur", label:"Simulateur", icon:"ti-briefcase" },
    { id:"kidsx",      label:"KidsX",      icon:"ti-star" },
    { id:"premium",    label:"Premium",    icon:"ti-crown" },
  ];

  const go = id => { setActive(id); setMenu(false); };

  return (
    <>
      <style>{G}</style>
      <nav style={{background:"#060E1A",borderBottom:"1px solid rgba(255,255,255,0.07)",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(0,0,0,0.4)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",height:54,maxWidth:1100,margin:"0 auto"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
            <div style={{width:32,height:32,borderRadius:8,background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:T.night}}>FX</div>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:T.white,letterSpacing:"-0.5px"}}>Fouta<span style={{color:T.gold}}>X</span></span>
          </div>
          {/* Desktop tabs */}
          <div style={{display:"flex",gap:2,alignItems:"center"}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>go(t.id)} style={{
                background:active===t.id?"rgba(232,160,32,0.12)":"transparent",
                border:active===t.id?"1px solid rgba(232,160,32,0.25)":"1px solid transparent",
                color:active===t.id?T.gold:"rgba(255,255,255,0.5)",
                fontSize:12,fontWeight:active===t.id?700:400,
                padding:"6px 12px",borderRadius:7,transition:"all .15s",
                display:"flex",alignItems:"center",gap:5,
              }}>
                <i className={`ti ${t.icon}`} aria-hidden="true" style={{fontSize:13}}/>
                {t.id==="kidsx"?<span style={{color:active==="kidsx"?"#FFD700":"rgba(255,215,0,0.6)",fontWeight:700}}>{t.label}</span>:t.label}
              </button>
            ))}
          </div>
          {/* Droite */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{background:"rgba(232,160,32,0.1)",border:"1px solid rgba(232,160,32,0.2)",borderRadius:20,padding:"4px 10px",fontSize:11,color:T.gold,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
              <i className="ti ti-trophy" aria-hidden="true" style={{fontSize:12}}/>
              {(user?.xp||0).toLocaleString("fr-FR")} XP
            </div>
            <button onClick={()=>setShowProfile(true)} style={{width:34,height:34,borderRadius:"50%",background:T.gold,color:T.night,border:"none",fontSize:12,fontWeight:800,fontFamily:"'Syne',sans-serif",boxShadow:"0 0 0 2px rgba(232,160,32,0.25)",flexShrink:0}}>
              {user?.avatar||"U"}
            </button>
            <button onClick={()=>setMenu(!menu)} style={{background:"rgba(255,255,255,0.07)",border:"none",color:T.white,width:34,height:34,borderRadius:7,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className={`ti ${menu?"ti-x":"ti-menu-2"}`} aria-hidden="true"/>
            </button>
          </div>
        </div>
        {/* Menu mobile */}
        {menu&&(
          <div style={{background:"#0A1628",borderTop:"1px solid rgba(255,255,255,0.07)",padding:"8px 12px 12px"}}>
            <div style={{marginBottom:10}}><XPBar xp={user?.xp||0} compact/></div>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>go(t.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 14px",marginBottom:4,borderRadius:8,background:active===t.id?"rgba(232,160,32,0.1)":"rgba(255,255,255,0.03)",border:active===t.id?"1px solid rgba(232,160,32,0.2)":"1px solid transparent",color:active===t.id?T.gold:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:active===t.id?700:400,textAlign:"left"}}>
                <i className={`ti ${t.icon}`} aria-hidden="true" style={{fontSize:16}}/>{t.label}
              </button>
            ))}
          </div>
        )}
      </nav>
      {/* Bottom nav mobile */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#060E1A",borderTop:"1px solid rgba(255,255,255,0.1)",display:"flex",zIndex:90,padding:"4px 0 8px"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>go(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0",background:"none",border:"none",color:active===t.id?(t.id==="kidsx"?"#FFD700":T.gold):"rgba(255,255,255,0.4)",transition:"color .15s"}}>
            <i className={`ti ${t.icon}`} aria-hidden="true" style={{fontSize:18}}/>
            <span style={{fontSize:9,fontWeight:active===t.id?700:400}}>{t.label}</span>
          </button>
        ))}
      </div>
      {/* Overlay profil */}
      {showProfile&&(
        <div onClick={()=>setShowProfile(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",justifyContent:"center",alignItems:"flex-start",paddingTop:64,padding:"64px 12px 12px"}}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:380}}>
            <UserProfile onClose={()=>setShowProfile(false)}/>
          </div>
        </div>
      )}
    </>
  );
}

// ─── PAGE DASHBOARD — MARCHÉS AFRICAINS ───────────────────────────────────────
function DashboardPage({ setActive }) {
  const { user, trackAction } = useAuth();
  const [selected, setSelected] = useState(BOURSES[0]);
  const [animated, setAnimated] = useState(false);
  useEffect(()=>{ setTimeout(()=>setAnimated(true),100); },[]);

  return (
    <div style={{padding:"16px 16px 80px",maxWidth:1100,margin:"0 auto"}}>
      {/* Hero titre */}
      <div style={{marginBottom:20,animation:"fadeIn .4s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <span style={{fontSize:22}}>📊</span>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:T.white,letterSpacing:"-0.5px"}}>
            Marchés Africains
          </h1>
          <span style={{fontSize:20}}>🌍</span>
        </div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>Les principales bourses du continent africain en un coup d'œil.</p>
      </div>

      {/* Layout principal : cartes gauche + carte droite + centre */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        {/* Colonne gauche */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {BOURSES.slice(0,3).map((b,i)=>(
            <button key={b.id+i} onClick={()=>setSelected(b)} style={{
              ...card(), padding:"14px 16px", textAlign:"left", width:"100%",
              border:selected?.id===b.id?`1px solid ${b.color}44`:"1px solid rgba(255,255,255,0.07)",
              background:selected?.id===b.id?"rgba(232,160,32,0.05)":"#0F1F38",
              transition:"all .2s", cursor:"pointer",
              animation:`countUp .4s ease ${i*0.1}s both`,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:b.color}}/>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:T.white}}>{b.name}</span>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:500}}>– {b.sub}</span>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{b.index}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:T.white}}>{b.val}</span>
                <span style={{fontSize:12,fontWeight:700,color:b.up?T.green:T.red}}>{b.up?"▲":"▼"} {b.chg}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Centre : mini carte Afrique */}
        <div style={{...card(),padding:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gridRow:"1/3",position:"relative",overflow:"hidden"}}>
          <AfricaMap onSelect={setSelected} selected={selected}/>
          {selected&&(
            <div style={{
              position:"absolute",bottom:12,left:12,right:12,
              background:"rgba(10,22,40,0.95)",border:`1px solid ${selected.color}44`,
              borderRadius:10,padding:"10px 14px",
              animation:"countUp .25s ease",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:selected.color}}/>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:T.white}}>{selected.name}</span>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>– {selected.sub}</span>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:3}}>{selected.index}</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:T.white}}>{selected.val}</span>
                <span style={{fontSize:12,fontWeight:700,color:selected.up?T.green:T.red}}>{selected.up?"▲":"▼"} {selected.chg}</span>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {BOURSES.slice(3,6).map((b,i)=>(
            <button key={b.id+i} onClick={()=>setSelected(b)} style={{
              ...card(), padding:"14px 16px", textAlign:"left", width:"100%",
              border:selected?.id===b.id?`1px solid ${b.color}44`:"1px solid rgba(255,255,255,0.07)",
              background:selected?.id===b.id?"rgba(232,160,32,0.05)":"#0F1F38",
              transition:"all .2s", cursor:"pointer",
              animation:`countUp .4s ease ${i*0.1+0.3}s both`,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:b.color}}/>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:T.white}}>{b.name}</span>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>– {b.sub}</span>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{b.index}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:T.white}}>{b.val}</span>
                <span style={{fontSize:12,fontWeight:700,color:b.up?T.green:T.red}}>{b.up?"▲":"▼"} {b.chg}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Graphique + News */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        {/* Graphique multi-indices */}
        <div style={{...card(),padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <i className="ti ti-chart-bar" aria-hidden="true" style={{fontSize:16,color:T.gold}}/>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:T.white}}>Performance des indices</span>
          </div>
          <MultiLineChart/>
          <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>
            {[{c:"#E8A020",l:"BRVM Composite",v:"+0.49%"},{c:"#3DCF8E",l:"NGX All Share",v:"+0.72%"},{c:"#7F77DD",l:"FTSE/JSE",v:"+0.63%"}].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:2,background:s.c,borderRadius:2}}/>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>{s.l}</span>
                <span style={{fontSize:10,fontWeight:700,color:T.green}}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actualités */}
        <div style={{...card(),padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <i className="ti ti-bell" aria-hidden="true" style={{fontSize:16,color:T.gold}}/>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:T.white}}>Actualités </span>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:T.gold}}>Régionales</span>
          </div>
          {NEWS.map((n,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderTop:i>0?"1px solid rgba(255,255,255,0.05)":"none",alignItems:"flex-start"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.5,flex:1}}>{n.text}</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",flexShrink:0}}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau BRVM */}
      <div style={{...card(),overflow:"hidden"}}>
        <div style={{padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:T.white}}>Actifs BRVM en vedette</span>
          <span style={{fontSize:11,color:T.gold,cursor:"pointer",fontWeight:600}} onClick={()=>setActive("premium")}>🔒 Données complètes</span>
        </div>
        {STOCKS.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",padding:"11px 16px",borderTop:i>0?"1px solid rgba(255,255,255,0.05)":"none",gap:10}}>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12,color:T.white,width:80,flexShrink:0}}>{s.ticker}</span>
            <span style={{flex:1,fontSize:11,color:"rgba(255,255,255,0.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
            <Sparkline color={s.up?T.green:T.red} up={s.up}/>
            <span style={{fontSize:12,fontWeight:600,color:T.white,width:70,textAlign:"right",flexShrink:0,filter:i>=3?"blur(4px)":"none"}}>{s.price} FCFA</span>
            <span style={{background:s.up?"rgba(61,207,142,0.12)":"rgba(240,96,96,0.12)",color:s.up?T.green:T.red,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,flexShrink:0,width:70,textAlign:"center"}}>{s.up?"▲":"▼"} {s.chg}</span>
            <button onClick={()=>trackAction("ASSET_ANALYZE",{ticker:s.ticker})} style={{background:"rgba(232,160,32,0.08)",color:T.gold,border:"1px solid rgba(232,160,32,0.2)",padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:700,flexShrink:0}}>
              Analyser
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE KIDSX ACADEMY ───────────────────────────────────────────────────────
function KidsXPage() {
  const { user, trackAction } = useAuth();
  const [activeLesson, setActiveLesson] = useState(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [stars, setStars] = useState([]);

  const QUIZ = [
    { q:"C'est quoi la bourse ?", opts:["Un marché pour acheter des actions","Un supermarché","Une banque","Un terrain de sport"], ans:0 },
    { q:"Qu'est-ce qu'une action ?",opts:["Une part d'une entreprise","Une pièce de monnaie","Un billet d'avion","Un livre"],ans:0 },
    { q:"Quelle bourse est en Côte d'Ivoire ?",opts:["BRVM","JSE","NSE","EGX"],ans:0 },
  ];

  const spawnStars = () => {
    const s = Array.from({length:8},(_,i)=>({ id:i, x:Math.random()*100, y:Math.random()*100, delay:i*0.1 }));
    setStars(s);
    setTimeout(()=>setStars([]),2500);
  };

  const answerQuiz = (idx) => {
    const correct = idx === QUIZ[quizStep].ans;
    if(correct){ setQuizScore(s=>s+1); spawnStars(); }
    if(quizStep>=QUIZ.length-1){
      setQuizDone(true);
      if(correct) trackAction("COURSE_COMPLETE",{courseId:"kidsx-quiz"});
    } else {
      setTimeout(()=>setQuizStep(s=>s+1), correct?600:400);
    }
  };

  const kidsDone = KIDSX_LESSONS.filter(l=>l.done).length;
  const kidsTotal = KIDSX_LESSONS.length;
  const kidsXP = KIDSX_LESSONS.filter(l=>l.done).reduce((a,l)=>a+l.xp,0);

  if(activeLesson) return (
    <div style={{padding:"16px 16px 80px",maxWidth:640,margin:"0 auto"}}>
      <button onClick={()=>{setActiveLesson(null);setQuizStep(0);setQuizScore(0);setQuizDone(false);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:T.gold,fontSize:13,fontWeight:600,marginBottom:16,padding:0}}>
        <i className="ti ti-arrow-left" aria-hidden="true"/> Retour
      </button>

      <div style={{...card(),padding:24,textAlign:"center",marginBottom:16,position:"relative",overflow:"hidden"}}>
        {/* Étoiles animées */}
        {stars.map(s=>(
          <div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,fontSize:20,animation:`starPop .6s ease ${s.delay}s both`,pointerEvents:"none"}}>⭐</div>
        ))}
        <div style={{fontSize:56,marginBottom:12,animation:"bounce 2s infinite"}}>{activeLesson.emoji}</div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:T.white,marginBottom:8}}>{activeLesson.title}</h2>
        <div style={{display:"inline-block",background:"rgba(255,215,0,0.12)",color:"#FFD700",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:20,marginBottom:16}}>{activeLesson.level}</div>

        {!quizDone ? (
          <div>
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"14px 16px",marginBottom:16,textAlign:"left"}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Question {quizStep+1} / {QUIZ.length}</div>
              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:6,height:4,marginBottom:14}}>
                <div style={{width:`${((quizStep)/QUIZ.length)*100}%`,height:4,borderRadius:6,background:"#FFD700",transition:"width .4s"}}/>
              </div>
              <p style={{fontSize:16,fontWeight:600,color:T.white,marginBottom:14,fontFamily:"'Syne',sans-serif"}}>{QUIZ[quizStep].q}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {QUIZ[quizStep].opts.map((o,i)=>(
                  <button key={i} onClick={()=>answerQuiz(i)} style={{
                    background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:10,padding:"12px",fontSize:13,color:T.white,fontWeight:500,
                    transition:"all .15s",textAlign:"center",
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,215,0,0.1)";e.currentTarget.style.borderColor="#FFD70044";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}
                  >{o}</button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{animation:"countUp .4s ease"}}>
            <div style={{fontSize:48,marginBottom:8}}>{quizScore===QUIZ.length?"🏆":quizScore>=2?"⭐":"💪"}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#FFD700",marginBottom:6}}>
              {quizScore}/{QUIZ.length} bonnes réponses !
            </div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:16}}>
              {quizScore===QUIZ.length?"Parfait ! Tu es un génie de la finance 🎉":quizScore>=2?"Très bien joué ! Continue comme ça !":"Continue d'apprendre, tu vas y arriver !"}
            </div>
            <div style={{background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:10,padding:"10px 16px",display:"inline-block",marginBottom:16}}>
              <span style={{color:"#FFD700",fontWeight:800,fontFamily:"'Syne',sans-serif"}}>+{activeLesson.xp} XP</span>
              <span style={{color:"rgba(255,255,255,0.5)",fontSize:12}}> gagnés !</span>
            </div>
            <br/>
            <button onClick={()=>{setActiveLesson(null);setQuizStep(0);setQuizScore(0);setQuizDone(false);}} style={{...gold(),padding:"11px 24px",fontSize:13}}>
              Continuer l'aventure ↗
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{padding:"16px 16px 80px",maxWidth:1100,margin:"0 auto"}}>
      {/* Hero KidsX */}
      <div style={{background:"linear-gradient(135deg,#0F1F38 0%,#1a2a4a 100%)",borderRadius:14,padding:"24px 20px",marginBottom:16,border:"1px solid rgba(255,215,0,0.15)",position:"relative",overflow:"hidden",animation:"fadeIn .4s ease"}}>
        <div style={{position:"absolute",right:-20,top:-20,fontSize:80,opacity:.08,pointerEvents:"none"}}>🦁</div>
        <div style={{position:"absolute",right:60,bottom:-10,fontSize:60,opacity:.06,pointerEvents:"none"}}>⭐</div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <span style={{fontSize:28}}>🎓</span>
          <div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#FFD700",letterSpacing:"-0.5px"}}>KidsX Academy</h1>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>Apprends la finance dès maintenant — c'est fun et facile !</p>
          </div>
        </div>
        {/* Progression globale */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:14,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:5}}>
              <span>Progression</span><span>{kidsDone}/{kidsTotal} leçons</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:6,height:8}}>
              <div style={{width:`${(kidsDone/kidsTotal)*100}%`,height:8,borderRadius:6,background:"#FFD700",transition:"width .6s",boxShadow:"0 0 8px rgba(255,215,0,0.4)"}}/>
            </div>
          </div>
          <div style={{background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:10,padding:"6px 14px",textAlign:"center"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#FFD700"}}>{kidsXP}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>XP GAGNÉS</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"6px 14px",textAlign:"center"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:T.white}}>{KIDSX_BADGES.filter(b=>b.earned).length}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>BADGES</div>
          </div>
        </div>
      </div>

      {/* Grille leçons */}
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:T.white,marginBottom:10}}>Mes leçons 📚</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
          {KIDSX_LESSONS.map((l,i)=>(
            <button key={l.id} onClick={()=>!l.done&&setActiveLesson(l)} style={{
              ...card(), padding:"16px 14px", textAlign:"center", border:"none",
              background:l.done?"rgba(61,207,142,0.08)":"#0F1F38",
              border:l.done?"1px solid rgba(61,207,142,0.2)":"1px solid rgba(255,255,255,0.07)",
              cursor:l.done?"default":"pointer", transition:"all .2s",
              animation:`countUp .4s ease ${i*0.08}s both`,
            }}
              onMouseEnter={e=>{ if(!l.done){ e.currentTarget.style.borderColor=l.color+"44"; e.currentTarget.style.background="rgba(255,215,0,0.04)"; }}}
              onMouseLeave={e=>{ if(!l.done){ e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.background="#0F1F38"; }}}
            >
              <div style={{fontSize:32,marginBottom:8,filter:l.done?"none":"grayscale(0)"}}>{l.emoji}</div>
              <div style={{fontSize:10,color:l.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>{l.level}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:T.white,lineHeight:1.3,marginBottom:8}}>{l.title}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                {l.done
                  ? <span style={{background:"rgba(61,207,142,0.15)",color:T.green,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>✓ Terminé</span>
                  : <span style={{background:"rgba(255,215,0,0.1)",color:"#FFD700",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>+{l.xp} XP</span>
                }
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Badges KidsX */}
      <div style={{...card(),padding:16,marginBottom:14}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:T.white,marginBottom:12}}>Mes badges 🏅</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {KIDSX_BADGES.map((b,i)=>(
            <div key={i} title={b.name} style={{
              width:52,height:52,borderRadius:12,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              background:b.earned?"rgba(255,215,0,0.1)":"rgba(255,255,255,0.04)",
              border:b.earned?"1px solid rgba(255,215,0,0.25)":"1px solid rgba(255,255,255,0.07)",
              filter:b.earned?"none":"grayscale(1)",opacity:b.earned?1:0.4,
              cursor:"help",gap:2,
            }}>
              <span style={{fontSize:22}}>{b.emoji}</span>
              <span style={{fontSize:8,color:b.earned?"#FFD700":T.gray2,fontWeight:b.earned?700:400}}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bannière parents */}
      <div style={{...card(),padding:16,border:"1px solid rgba(232,160,32,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:24}}>👨‍👩‍👧</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:T.white,marginBottom:2}}>Espace Parents</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.5}}>Suivez la progression de votre enfant et débloquez du contenu premium KidsX Academy.</div>
          </div>
          <button style={{...gold(),padding:"9px 16px",fontSize:12,flexShrink:0}}>
            En savoir plus ↗
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE COURS ────────────────────────────────────────────────────────────────
function CoursPage() {
  const { trackAction } = useAuth();
  const courses = [
    { id:"bases",    icon:"📈", level:"Débutant",      color:T.green,  title:"Les bases des marchés africains", lessons:5, free:true  },
    { id:"rapports", icon:"💰", level:"Débutant",      color:T.green,  title:"Lire un rapport financier",        lessons:4, free:true  },
    { id:"analyse",  icon:"🏦", level:"Intermédiaire", color:T.gold,   title:"Analyse fondamentale UEMOA",       lessons:6, free:false },
    { id:"portfolio",icon:"📊", level:"Avancé",        color:T.red,    title:"Stratégies de portefeuille",       lessons:8, free:false },
  ];
  return (
    <div style={{padding:"16px 16px 80px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:T.white,marginBottom:4,letterSpacing:"-0.3px"}}>Académie FoutaX</div>
      <div style={{fontSize:13,color:T.gray2,marginBottom:18}}>Formations pour maîtriser les marchés africains</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
        {courses.map((c,i)=>(
          <div key={c.id} style={{...card(),overflow:"hidden",transition:"border-color .2s",animation:`countUp .4s ease ${i*0.1}s both`}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=c.color+"44"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}
          >
            <div style={{height:72,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,background:"rgba(255,255,255,0.03)",position:"relative"}}>
              {c.icon}{!c.free&&<div style={{position:"absolute",top:6,right:8,fontSize:12}}>🔒</div>}
            </div>
            <div style={{padding:"12px 14px"}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.8px",color:c.color,marginBottom:4}}>{c.level}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:T.white,marginBottom:8,lineHeight:1.35}}>{c.title}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:10,color:T.gray2}}>{c.lessons} leçons</span>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:c.free?"rgba(61,207,142,0.12)":"rgba(232,160,32,0.12)",color:c.free?T.green:T.gold}}>{c.free?"Gratuit":"Premium"}</span>
              </div>
              <button onClick={()=>c.free&&trackAction("COURSE_COMPLETE",{courseId:c.id})} style={{...gold(c.free?{}:{background:"rgba(232,160,32,0.1)",color:T.gold,border:`1px solid rgba(232,160,32,0.2)`}),padding:"8px",width:"100%",fontSize:12}}>
                {c.free?"Commencer":"Débloquer"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE SIMULATEUR ──────────────────────────────────────────────────────────
function SimulateurPage() {
  const { user, trackAction } = useAuth();
  const [qty,setQty]=useState(5);
  const [ticker,setTicker]=useState("SONATEL");
  const [msg,setMsg]=useState("");
  const prices={SONATEL:29000,"BOA-CI":6200,"PALM-CI":4800,SOLIBRA:95000,"NESTLE-CI":7300};
  const cash=user?.portfolio?.cash??500000;
  const total=(prices[ticker]||0)*qty;
  const buy=()=>{
    if(total>cash){setMsg("❌ Liquidités insuffisantes");return;}
    trackAction("PORTFOLIO_BUY",{portfolio:{cash:cash-total,positions:[...(user?.portfolio?.positions||[]),{ticker,qty,price:prices[ticker]}]}});
    setMsg(`✓ Acheté ${qty} × ${ticker}`);
    setTimeout(()=>setMsg(""),3000);
  };
  return (
    <div style={{padding:"16px 16px 80px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:T.white,letterSpacing:"-0.3px"}}>Simulateur</div>
        <div style={{background:"rgba(232,160,32,0.08)",border:`1px solid rgba(232,160,32,0.2)`,borderRadius:8,padding:"7px 14px",fontSize:12,color:T.gold,fontWeight:600}}>
          💰 <span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800}}>{cash.toLocaleString("fr-FR")}</span> FCFA
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{...card(),padding:16}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:T.white,marginBottom:14}}>➕ Passer un ordre</div>
          {[{l:"Action",ch:<select value={ticker} onChange={e=>setTicker(e.target.value)} style={{width:"100%",padding:"10px 12px",background:"#0A1628",color:T.white,border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,outline:"none"}}>
            {Object.entries(prices).map(([k,v])=><option key={k} value={k}>{k} — {v.toLocaleString("fr-FR")} FCFA</option>)}
          </select>},{l:"Quantité",ch:<input type="number" value={qty} min={1} max={100} onChange={e=>setQty(+e.target.value)} style={{width:"100%",padding:"10px 12px",background:"#0A1628",color:T.white,border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:13,outline:"none"}}/>}].map((f,i)=>(
            <div key={i} style={{marginBottom:12}}>
              <div style={{fontSize:10,color:T.gray2,textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:500,marginBottom:5}}>{f.l}</div>
              {f.ch}
            </div>
          ))}
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.gray2,marginBottom:3}}><span>Prix unitaire</span><span>{prices[ticker]?.toLocaleString("fr-FR")} FCFA</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,color:T.white}}><span>Total</span><span>{total.toLocaleString("fr-FR")} FCFA</span></div>
          </div>
          <button onClick={buy} style={{...gold({background:T.green}),padding:11,width:"100%",fontSize:13}}>Acheter</button>
          {msg&&<div style={{fontSize:12,textAlign:"center",marginTop:8,color:msg.includes("❌")?T.red:T.green}}>{msg}</div>}
        </div>
        <div style={{...card(),padding:16}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:T.white,marginBottom:14}}>💼 Mon portefeuille</div>
          {!user?.portfolio?.positions?.length?(
            <div style={{textAlign:"center",padding:"24px 0",color:T.gray2,fontSize:13}}>Aucune position.<br/>Achetez votre première action !</div>
          ):user.portfolio.positions.map((p,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i>0?"1px solid rgba(255,255,255,0.06)":"none"}}>
              <div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:T.white,fontSize:13}}>{p.ticker}</div><div style={{fontSize:11,color:T.gray2}}>{p.qty} actions</div></div>
              <div style={{fontSize:13,fontWeight:600,color:T.white}}>{(p.qty*(prices[p.ticker]||p.price)).toLocaleString("fr-FR")} FCFA</div>
            </div>
          ))}
          <div style={{background:"rgba(232,160,32,0.08)",border:`1px solid rgba(232,160,32,0.15)`,borderRadius:8,padding:"10px 14px",marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,color:T.gray2}}>Liquidités</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:T.gold}}>{cash.toLocaleString("fr-FR")} FCFA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PREMIUM ─────────────────────────────────────────────────────────────
function PremiumPage() {
  const { upgradePlan } = useAuth();
  const plans = [
    { name:"Gratuit", price:"0", per:"", cta:"Plan actuel", disabled:true, features:[["4 modules",true],["Données différées",true],["Simulateur 500k",true],["Alertes cours",false],["Analyses IA",false],["Certification",false]] },
    { name:"Gold",    price:"4 990", per:"/mois", cta:"Choisir Gold", featured:true, features:[["12 modules",true],["Données temps réel",true],["Simulateur illimité",true],["10 alertes/mois",true],["Analyses IA",true],["Certification FoutaX",true]] },
    { name:"Pro",     price:"9 990", per:"/mois", cta:"Choisir Pro", features:[["Tout Gold",true],["Données live",true],["API UEMOA",true],["Alertes illimitées",true],["Signaux IA",true],["Support 1-to-1",true]] },
  ];
  return (
    <div style={{padding:"16px 16px 80px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{textAlign:"center",background:"#0F1F38",borderRadius:14,padding:"28px 20px",marginBottom:20,border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{fontSize:32,marginBottom:10}}>👑</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:T.white,marginBottom:6,letterSpacing:"-0.5px"}}>Débloquez tout FoutaX</div>
        <div style={{fontSize:13,color:T.gray2,maxWidth:320,margin:"0 auto 24px"}}>Données avancées, analyses IA et formations certifiantes.</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,maxWidth:580,margin:"0 auto"}}>
          {plans.map(p=>(
            <div key={p.name} style={{...card(),padding:"18px 16px",position:"relative",background:p.featured?"rgba(232,160,32,0.07)":"#0A1628",border:p.featured?`2px solid rgba(232,160,32,0.35)`:"1px solid rgba(255,255,255,0.07)"}}>
              {p.featured&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",...gold({borderRadius:20,fontSize:10,padding:"2px 12px",whiteSpace:"nowrap"})()}}>⭐ Populaire</div>}
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:T.gray2,marginBottom:6}}>{p.name}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:T.white,marginBottom:2}}>{p.price}<span style={{fontSize:11,fontWeight:400,color:T.gray2}}> FCFA{p.per}</span></div>
              <ul style={{listStyle:"none",margin:"12px 0",padding:0}}>
                {p.features.map(([f,ok],i)=>(
                  <li key={i} style={{fontSize:11,color:ok?"rgba(255,255,255,0.7)":T.gray2,padding:"3px 0",display:"flex",gap:6}}>
                    <span style={{color:ok?T.green:T.gray2,flexShrink:0}}>{ok?"✓":"✕"}</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={()=>!p.disabled&&upgradePlan(p.name.toLowerCase())} disabled={p.disabled} style={{width:"100%",padding:"10px",borderRadius:8,background:p.disabled?"rgba(255,255,255,0.05)":p.featured?T.gold:"rgba(232,160,32,0.1)",color:p.disabled?T.gray2:p.featured?T.night:T.gold,border:"none",fontSize:12,fontWeight:800,cursor:p.disabled?"not-allowed":"pointer",fontFamily:"'Syne',sans-serif"}}>{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOADING ──────────────────────────────────────────────────────────────────
function Loading() {
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.night}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:52,height:52,borderRadius:12,background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:T.night,margin:"0 auto 14px"}}>FX</div>
        <div style={{fontFamily:"'Syne',sans-serif",color:T.white,fontSize:20,fontWeight:800,letterSpacing:"-0.5px"}}>Fouta<span style={{color:T.gold}}>X</span></div>
        <div style={{fontSize:12,color:T.gray2,marginTop:6}}>Chargement…</div>
      </div>
    </div>
  );
}

// ─── DASHBOARD WRAPPER ────────────────────────────────────────────────────────
function Dashboard() {
  const [active,setActive]=useState("dashboard");
  const pages = {
    dashboard:  <DashboardPage setActive={setActive}/>,
    cours:      <CoursPage/>,
    simulateur: <SimulateurPage/>,
    kidsx:      <KidsXPage/>,
    premium:    <PremiumPage/>,
  };
  return (
    <div style={{minHeight:"100vh",background:T.night}}>
      <Navbar active={active} setActive={setActive}/>
      <div style={{paddingBottom:4}}>{pages[active]}</div>
    </div>
  );
}

function AppInner() {
  const { isAuthenticated, loading } = useAuth();
  if(loading) return <Loading/>;
  return <>{isAuthenticated?<Dashboard/>:<AuthPage/>}<XPToast/></>;
}

export default function App() {
  return <AuthProvider><AppInner/></AuthProvider>;
}
