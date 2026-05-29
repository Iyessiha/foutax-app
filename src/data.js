export const STOCKS = [
  {ticker:"SONATEL",  name:"Sonatel SA",         sector:"Télécom",    p:29000, chg:2.84,  mktCap:"3.2T", volume:"7 282",  pe:7.0,  div:5.71, country:"SN"},
  {ticker:"PALM-CI",  name:"Palmci",              sector:"Agro",       p:4800,  chg:1.50,  mktCap:"420G", volume:"210K",   pe:9.2,  div:3.4,  country:"CI"},
  {ticker:"BOA-CI",   name:"Bank of Africa CI",   sector:"Banque",     p:6200,  chg:-0.80, mktCap:"580G", volume:"85K",    pe:5.8,  div:4.2,  country:"CI"},
  {ticker:"SOLIBRA",  name:"Solibra",             sector:"Boisson",    p:95000, chg:0.40,  mktCap:"1.1T", volume:"3 200",  pe:12.1, div:2.8,  country:"CI"},
  {ticker:"NESTLE-CI",name:"Nestlé CI",           sector:"Agroalim",   p:7300,  chg:-1.20, mktCap:"890G", volume:"67K",    pe:14.2, div:1.9,  country:"CI"},
  {ticker:"SIB",      name:"Société Ivoirienne",  sector:"Banque",     p:4650,  chg:0.90,  mktCap:"520G", volume:"123K",   pe:6.4,  div:3.8,  country:"CI"},
  {ticker:"SICABLE",  name:"SICABLE",             sector:"Industrie",  p:1250,  chg:3.10,  mktCap:"95G",  volume:"450K",   pe:4.2,  div:6.1,  country:"CI"},
  {ticker:"CFAO-CI",  name:"CFAO CI",             sector:"Commerce",   p:3100,  chg:-0.50, mktCap:"310G", volume:"98K",    pe:8.7,  div:2.5,  country:"CI"},
];

export const BOURSES = [
  {id:"brvm",  name:"BRVM",  region:"UEMOA",        idx:"Composite", val:"420.33", chg:"+0.48%", up:true,  color:"#E8A020", x:"20%",y:"46%"},
  {id:"nse",   name:"NSE",   region:"Nigéria",       idx:"NGX All Share", val:"50 124", chg:"+0.72%", up:true, color:"#22C55E",x:"28%",y:"52%"},
  {id:"jse",   name:"JSE",   region:"Afrique du Sud",idx:"FTSE/JSE", val:"72 815", chg:"+0.63%", up:true,  color:"#3B82F6", x:"46%",y:"75%"},
  {id:"egx",   name:"EGX",   region:"Égypte",        idx:"EGX 30",  val:"11 240", chg:"-0.35%", up:false, color:"#EF4444", x:"55%",y:"20%"},
  {id:"bvc",   name:"BVC",   region:"Maroc",         idx:"MASI",    val:"13 278", chg:"+0.41%", up:true,  color:"#E8A020", x:"34%",y:"14%"},
  {id:"bvmac", name:"BVMAC", region:"CEMAC",         idx:"BVMAC",   val:"187.56", chg:"+0.55%", up:true,  color:"#8B5CF6", x:"32%",y:"56%"},
  {id:"nse_ke",name:"NSE",   region:"Kenya",         idx:"KENE 20", val:"1 845",  chg:"+0.58%", up:true,  color:"#06B6D4", x:"58%",y:"52%"},
];

export const NEWS = [
  {title:"Zone de libre-échange : nouvelles opportunités pour la BRVM", time:"2h", tag:"BRVM", hot:true},
  {title:"Nigeria Stock Exchange : record historique franchi", time:"3h", tag:"NSE", hot:false},
  {title:"SONATEL annonce un dividende exceptionnel 2025", time:"4h", tag:"SONATEL", hot:true},
  {title:"BVMAC : hausse continue de l'indice depuis 3 mois", time:"5h", tag:"BVMAC", hot:false},
  {title:"Investissements étrangers en hausse de 18% au Sénégal", time:"6h", tag:"SN", hot:false},
  {title:"Orange CI finalise l'acquisition de deux opérateurs", time:"8h", tag:"CI", hot:false},
];

export const COURSES = [
  {id:"intro",   icon:"📈", title:"Introduction aux marchés BRVM",    level:"Débutant",      lc:null,  lessons:5, dur:"2h30", free:true,  prog:60, desc:"Les fondamentaux de la Bourse Régionale des Valeurs Mobilières — structure, acteurs, fonctionnement."},
  {id:"rapports",icon:"📋", title:"Lire un rapport financier",          level:"Débutant",      lc:null,  lessons:4, dur:"2h",   free:true,  prog:20, desc:"Bilan, compte de résultat, flux de trésorerie — tout comprendre en pratique sur des cas BRVM."},
  {id:"analyse", icon:"🏦", title:"Analyse fondamentale africaine",     level:"Intermédiaire", lc:null,   lessons:6, dur:"4h",   free:false, prog:0,  desc:"Méthodes DCF, comparables sectoriels et spécificités des marchés UEMOA."},
  {id:"strategie",icon:"📊",title:"Stratégies de portefeuille",         level:"Intermédiaire", lc:null,   lessons:7, dur:"5h",   free:false, prog:0,  desc:"Diversification, gestion du risque, allocation d'actifs sur les marchés africains."},
  {id:"trading", icon:"⚡", title:"Trading & analyse technique",        level:"Avancé",        lc:null,    lessons:8, dur:"6h",   free:false, prog:0,  desc:"Supports, résistances, RSI, MACD — application directe sur les actifs BRVM."},
  {id:"options", icon:"🎯", title:"Produits dérivés & obligations",     level:"Avancé",        lc:null,    lessons:6, dur:"4h30", free:false, prog:0,  desc:"Obligations d'État UEMOA, produits structurés et couverture de risque."},
];

export const KIDS_LESSONS = [
  {id:"k1", emoji:"🌱", title:"C'est quoi l'argent ?",          level:"Niveau 1", xp:40,  color:null, done:true},
  {id:"k2", emoji:"🐷", title:"Épargner son argent de poche",   level:"Niveau 1", xp:40,  color:null, done:true},
  {id:"k3", emoji:"🏪", title:"Une entreprise, c'est quoi ?",   level:"Niveau 2", xp:60,  color:null, done:false},
  {id:"k4", emoji:"📈", title:"Les actions en images",          level:"Niveau 2", xp:60,  color:null, done:false},
  {id:"k5", emoji:"🌍", title:"Les bourses africaines",         level:"Niveau 3", xp:80,  color:null, done:false},
  {id:"k6", emoji:"🦁", title:"Devenir investisseur lion",      level:"Niveau 3", xp:100, color:null,done:false},
  {id:"k7", emoji:"🏆", title:"Le jeu des entreprises",         level:"Niveau 4", xp:120, color:null, done:false},
  {id:"k8", emoji:"👑", title:"Champion de la finance",         level:"Niveau 4", xp:150, color:null,done:false},
];

export const KIDS_QUIZ_DB = {
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

export const fmt = n => typeof n==="number" ? n.toLocaleString("fr-FR") : n;
export const fmtFcfa = n => `${fmt(n)} FCFA`;

export function genSparkData(len=20, up=true, volatility=0.08) {
  let v = 50;
  return Array.from({length:len}, (_,i) => {
    v += (Math.random()-0.47)*volatility*100 + (up ? 0.3 : -0.3);
    return Math.max(10, Math.min(90, v));
  });
}
