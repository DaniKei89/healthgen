import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import { useUserData } from "./hooks/useUserData";
import { RG } from "./data/referenceRanges";
import { uploadDocument, validateFile, formatFileSize, getEmojiForType } from "./services/storage";
import { addDocument, updateDocument } from "./services/firestore";
import { chatWithAI, analyzeDocument, isAIAvailable } from "./services/ai";
import { getAvailableIntegrations, connectService, disconnectService, isNativeApp } from "./services/wearables";

/* ═══ ICONS ═══ */
const S=p=>(<svg width={p.z||20} height={p.z||20} viewBox="0 0 24 24" fill="none" stroke={p.sk||"currentColor"} strokeWidth={p.sw||1.7} strokeLinecap="round" strokeLinejoin="round" style={p.style}>{p.children}</svg>);
const I={
Logo:p=>{const sz=p.z||20;return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" style={p.style}><path d="M1 12C4 5,8 5,12 12C16 19,20 19,23 12" stroke={p.sk||"currentColor"} strokeWidth={p.sw||1.7} strokeLinecap="round" fill="none" opacity="0.5"/><path d="M1 12C4 19,8 19,12 12C16 5,20 5,23 12" stroke={p.sk||"currentColor"} strokeWidth={p.sw||1.7} strokeLinecap="round" fill="none"/><line x1="6" y1="8" x2="6" y2="16" stroke={p.sk||"currentColor"} strokeWidth="1" opacity="0.3" strokeLinecap="round"/><line x1="12" y1="6" x2="12" y2="18" stroke={p.sk||"currentColor"} strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/><line x1="18" y1="8" x2="18" y2="16" stroke={p.sk||"currentColor"} strokeWidth="1" opacity="0.3" strokeLinecap="round"/><circle cx="12" cy="6" r="2" fill={p.sk||"currentColor"}/><circle cx="8" cy="17" r="1.5" fill={p.sk||"currentColor"} opacity="0.6"/><circle cx="16" cy="17" r="1.5" fill={p.sk||"currentColor"} opacity="0.6"/></svg>},
Heart:p=><S {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></S>,
User:p=><S {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></S>,
Users:p=><S {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></S>,
Act:p=><S {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></S>,
File:p=><S {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></S>,
Shield:p=><S {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></S>,
TUp:p=><S {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></S>,
TDn:p=><S {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></S>,
Warn:p=><S {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></S>,
Ok:p=><S {...p}><polyline points="20 6 9 17 4 12"/></S>,
Dn:p=><S {...p}><polyline points="7 13 12 18 17 13"/><line x1="12" y1="18" x2="12" y2="6"/></S>,
Share:p=><S {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></S>,
Chv:p=><S {...p}><polyline points="9 18 15 12 9 6"/></S>,
DNA:p=><S {...p}><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M17 6l-2.5-2.5"/><path d="M7 18l2.5 2.5"/></S>,
Drop:p=><S {...p}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></S>,
Spark:p=><S {...p}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></S>,
Brain:p=><S {...p}><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></S>,
Bell:p=><S {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></S>,
Plus:p=><S {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></S>,
Scan:p=><S {...p}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></S>,
Leaf:p=><S {...p}><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2.5 1.5 7c0 4.5-2.5 7.5-7.5 9.5z"/><path d="M12 20V10"/></S>,
Run:p=><S {...p}><circle cx="12" cy="5" r="2.5"/><path d="M5 22l3-9 4 2 3-7"/><path d="M15 13l3 9"/><path d="M8 13l-3 2"/></S>,
Chat:p=><S {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></S>,
Eye:p=><S {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></S>,
Pill:p=><S {...p}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></S>,
Send:p=><S {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></S>,
Pulse:p=><S {...p}><path d="M3 12h4l3-9 4 18 3-9h4"/></S>,
Scale:p=><S {...p}><path d="M8 21h8"/><path d="M12 17V3"/><path d="m17 8-5 5-5-5"/></S>,
Ruler:p=><S {...p}><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/></S>,
Transfer:p=><S {...p}><path d="M18 8L22 12L18 16"/><path d="M2 12H22"/><path d="M6 16L2 12L6 8"/></S>,
Watch:p=><S {...p}><rect x="5" y="2" width="14" height="20" rx="7" ry="7"/><path d="M12 9v3l1.5 1.5"/></S>,
Steps:p=><S {...p}><path d="M4 16c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M14 5c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2z"/><path d="M6.5 14L16 5"/></S>,
Sleep:p=><S {...p}><path d="M2 4h4l3 12h10"/><path d="M17 8h4"/><path d="M19 6v4"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10"/></S>,
Oxy:p=><S {...p}><path d="M2 12a5 5 0 0 1 5-5c3 0 4 2 5 2s2-2 5-2a5 5 0 0 1 5 5c0 6-10 10-10 10S2 18 2 12z"/></S>,
Lock:p=><S {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></S>,
Key:p=><S {...p}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></S>,
Link:p=><S {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></S>,
QR:p=><S {...p}><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><path d="M14 14h2v2h-2z"/><path d="M20 14h2v2h-2z"/><path d="M14 20h2v2h-2z"/><path d="M20 20h2v2h-2z"/><path d="M17 17h2v2h-2z"/></S>,
Copy:p=><S {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></S>,
Trash:p=><S {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></S>,
X:p=><S {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></S>,
Download:p=><S {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></S>,
Grid:p=><S {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></S>,
List:p=><S {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></S>,
LogOut:p=><S {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></S>,
};

/* ═══ DATA — Demo data comes from useUserData hook ═══ */
const IC_MAP = { Leaf: I.Leaf, Run: I.Run, Eye: I.Eye, Pill: I.Pill };

/* ═══ THEME ═══ */
const C={bg:"#F4F5F9",bg2:"#EAECF2",card:"#FFFFFF",glass:"rgba(255,255,255,0.8)",brd:"#DFE2EB",brd2:"#CDD1DE",tx:"#0F1117",tx2:"#555970",tx3:"#8E93A8",pri:"#4F6AE8",priL:"#EEF1FD",priS:"#D0D8FA",priD:"#3548B0",dan:"#E5484D",danL:"#FFF0F0",danS:"#FECDD3",wrn:"#FF8B3E",wrnL:"#FFF5ED",wrnS:"#FFE0C2",suc:"#30A46C",sucL:"#ECFDF5",sucS:"#BBF7D0",pur:"#7C66DC",purL:"#F5F2FF",pnk:"#E93D82",pnkL:"#FFF0F6",blu:"#0091FF",bluL:"#E8F4FF"};

/* ═══ SHARED COMPONENTS ═══ */
const Bd=({s,t})=>{const m={g:{bg:C.sucL,c:C.suc,bd:C.sucS},w:{bg:C.wrnL,c:C.wrn,bd:C.wrnS},r:{bg:C.danL,c:C.dan,bd:C.danS},b:{bg:C.priL,c:C.pri,bd:C.priS},p:{bg:C.purL,c:C.pur,bd:"#E4DEFF"}};const st=m[s]||m.b;return <span style={{background:st.bg,color:st.c,border:`1px solid ${st.bd}`,padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:700,display:"inline-flex",alignItems:"center"}}>{t}</span>};
const Sk=({data,color=C.pri,w=70,h=20})=>{if(!data?.length)return null;const mn=Math.min(...data)*0.9,mx=Math.max(...data)*1.1,r=mx-mn||1;const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/r)*h}`).join(" ");return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/><circle cx={w} cy={h-((data[data.length-1]-mn)/r)*h} r="2.5" fill="white" stroke={color} strokeWidth="2"/></svg>};
const Ch=({data,dk,rng,color})=>{const W=600,H=200,pL=50,pR=20,pT=24,pB=35,iW=W-pL-pR,iH=H-pT-pB;const vs=data.map(d=>d[dk]),all=[...vs,rng.n,rng.x],dN=Math.min(...all)*0.85,dX=Math.max(...all)*1.15,rr=dX-dN||1;const tX=i=>pL+(i/(data.length-1))*iW,tY=v=>pT+iH-((v-dN)/rr)*iH;const pts=vs.map((v,i)=>`${tX(i)},${tY(v)}`).join(" ");const ar=`${tX(0)},${tY(vs[0])} ${pts} ${tX(vs.length-1)},${pT+iH} ${tX(0)},${pT+iH}`;return <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{height:"auto"}}><defs><linearGradient id={`cg${dk}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.14"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs><rect x={pL} y={tY(rng.x)} width={iW} height={Math.max(0,tY(rng.n)-tY(rng.x))} fill={C.suc} opacity={0.05} rx={4}/><line x1={pL} y1={tY(rng.x)} x2={pL+iW} y2={tY(rng.x)} stroke={C.suc} strokeWidth="1" strokeDasharray="5,5" opacity={0.2}/><line x1={pL} y1={tY(rng.n)} x2={pL+iW} y2={tY(rng.n)} stroke={C.suc} strokeWidth="1" strokeDasharray="5,5" opacity={0.2}/><polygon points={ar} fill={`url(#cg${dk})`}/><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>{vs.map((v,i)=><g key={i}><circle cx={tX(i)} cy={tY(v)} r="5" fill="white" stroke={color} strokeWidth="2"/><text x={tX(i)} y={tY(v)-12} textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{v}</text></g>)}{data.map((d,i)=><text key={i} x={tX(i)} y={H-6} textAnchor="middle" fill={C.tx3} fontSize="10">{d.d}</text>)}</svg>};
const TV=({ms,cn,onS,sl})=>(<div style={{position:"relative",width:"100%",paddingBottom:"55%"}}><svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 100 100">{cn.map(([f,t],i)=>{const a=ms.find(m=>m.id===f),b=ms.find(m=>m.id===t);if(!a||!b)return null;const mid=(a.y+b.y)/2;return <path key={i} d={`M${a.x} ${a.y+3}C${a.x} ${mid},${b.x} ${mid},${b.x} ${b.y-3}`} stroke={C.brd2} strokeWidth="0.35" fill="none" strokeDasharray={a.gn===0?"1.5,1.5":"none"}/>})}{ms.map(m=>{const iS=sl===m.id,gc={0:"#9498AD",1:C.pur,2:C.pri,3:C.pnk},bc=m.me?C.pri:gc[m.gn]||C.pri;return <g key={m.id} onClick={()=>onS(m.id)} style={{cursor:"pointer"}}><circle cx={m.x} cy={m.y} r={m.me?4.5:3.2} fill={iS?bc:"white"} stroke={bc} strokeWidth={iS?0.8:0.5}/>{m.me&&<circle cx={m.x} cy={m.y} r="6" fill="none" stroke={bc} strokeWidth="0.25" opacity="0.5"><animate attributeName="r" values="5.5;7.5;5.5" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/></circle>}<text x={m.x} y={m.y+(m.gn===3?7:-6)} textAnchor="middle" fill={iS?bc:C.tx} fontSize="2.3" fontWeight={m.me||iS?"700":"500"}>{m.nm}</text><text x={m.x} y={m.y+(m.gn===3?9.5:-3.5)} textAnchor="middle" fill={C.tx3} fontSize="1.5">{m.rl}</text>{m.co.length>0&&<circle cx={m.x+3.5} cy={m.y-2.5} r="1.1" fill={C.wrn}/>}</g>})}</svg></div>);
const Cd=({children,style,onClick})=>(<div onClick={onClick} style={{background:C.card,borderRadius:16,border:`1px solid ${C.brd}`,boxShadow:"0 1px 4px rgba(0,0,0,0.03)",...style}}>{children}</div>);
const RB=({pct,color})=>(<div style={{width:"100%",height:5,borderRadius:3,background:C.bg2}}><div style={{width:`${pct}%`,height:"100%",borderRadius:3,background:`linear-gradient(90deg,${color}66,${color})`}}/></div>);
const Ring=({pct,color,sz=44,sw=4})=>{const r=(sz-sw)/2,circ=2*Math.PI*r;return <svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={C.bg2} strokeWidth={sw}/><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-Math.min(pct,100)/100)}/></svg>};

/* ═══ OTP Component ═══ */
const OTPShare=({onClose})=>{
  const[code]=useState(()=>String(Math.floor(100000+Math.random()*900000)));
  const[sec,setSec]=useState(10);
  const[copied,setCopied]=useState(false);
  useEffect(()=>{if(sec<=0){onClose();return}const t=setInterval(()=>setSec(s=>s-1),1000);return()=>clearInterval(t)},[sec,onClose]);
  return <div style={{textAlign:"center",padding:"8px 0"}}>
    <div style={{width:56,height:56,borderRadius:18,background:`linear-gradient(135deg,${C.pri}15,${C.pur}15)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><I.Key z={26} style={{color:C.pri}}/></div>
    <p style={{fontSize:13,color:C.tx2,marginBottom:16}}>Código de verificación temporal</p>
    <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:12}}>{code.split("").map((d,i)=><div key={i} style={{width:48,height:58,borderRadius:12,background:C.bg,border:`2px solid ${C.pri}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:C.tx,fontFamily:"'JetBrains Mono',monospace"}}>{d}</div>)}</div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:16}}>
      <div style={{position:"relative",width:28,height:28}}><Ring pct={(sec/10)*100} color={sec<=3?C.dan:C.pri} sz={28} sw={3}/><span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:sec<=3?C.dan:C.pri}}>{sec}</span></div>
      <span style={{fontSize:12,color:sec<=3?C.dan:C.tx3,fontWeight:600}}>segundos restantes</span>
    </div>
    <button onClick={()=>{navigator.clipboard?.writeText(code);setCopied(true)}} style={{display:"flex",alignItems:"center",gap:6,margin:"0 auto",padding:"8px 20px",borderRadius:12,fontSize:13,fontWeight:700,color:copied?C.suc:C.pri,background:copied?C.sucL:C.priL,border:`1px solid ${copied?C.sucS:C.priS}`,cursor:"pointer"}}>{copied?<I.Ok z={13} style={{color:C.suc}}/>:<I.Copy z={13} style={{color:C.pri}}/>}{copied?"Copiado":"Copiar código"}</button>
  </div>
};

/* ═══ DOC TYPES ═══ */
const DOC_TYPES=[{l:"Analítica",e:"🩸"},{l:"Radiografía",e:"🦴"},{l:"MRI/TAC",e:"🧠"},{l:"Informe",e:"📋"},{l:"Receta",e:"💊"},{l:"Oftalm.",e:"👁️"},{l:"Dermat.",e:"🧴"},{l:"Otro",e:"📄"}];

/* ═══ DESKTOP APP ═══ */
export default function DesktopApp(){
  const{t,i18n}=useTranslation();
  const{onboardingData,handleLogout,user}=useAuth();
  const userData=useUserData();
  const{profile:realProfile,documents:realDocs,isEmpty,isDemo,demo,integrations}=userData;
  // Resolve data: use real data when available, demo data as fallback
  const U=realProfile||(isDemo?demo.profile:null);
  const WEAR=isDemo?demo.wear:null;
  const TM=isDemo&&isEmpty.family?demo.family:userData.familyMembers;
  const CN=isDemo&&isEmpty.family?demo.connections:userData.connections;
  const HR=isDemo&&isEmpty.family?demo.risks:userData.hereditaryRisks;
  const BL=isDemo&&isEmpty.labs?demo.labs:userData.labResults;
  const INS=isDemo&&isEmpty.labs?demo.insights:userData.insights;
  const TIPS_DATA=isDemo?demo.tips.map(t=>({...t,ic:IC_MAP[t.icKey]||I.Leaf})):userData.tips.map(t=>({...t,ic:IC_MAP[t.icKey||"Leaf"]||I.Leaf}));
  const CHAT_INIT=demo.chatInit;
  const AI_R=demo.aiResponses;
  const[tab,sT]=useState("d");
  const[bio,sB]=useState("ir");
  const[fam,sF]=useState("me");
  const[mod,sM]=useState(null);
  const[exp,sE]=useState(null);
  const[msgs,setMsgs]=useState(CHAT_INIT);
  const[inp,setInp]=useState("");
  const[tipCat,setTC]=useState("all");
  const[docs,setDocs]=useState([]);
  const[uploadType,setUploadType]=useState(null);
  const[uploading,setUploading]=useState(false);
  const[uploadProg,setUploadProg]=useState(0);
  const[dragging,setDragging]=useState(false);
  const[docView,setDocView]=useState("grid");
  const[previewDoc,setPreviewDoc]=useState(null);
  const chatRef=useRef(null);
  const fileRef=useRef(null);
  const closeOTP=useCallback(()=>sM(null),[]);
  const nextId=useRef(8);
  const[dismissed,setDismissed]=useState(()=>{try{return JSON.parse(localStorage.getItem("ledora_dismissed_tips")||"[]")}catch{return[]}});
  const dismiss=(id)=>{const next=[...dismissed,id];setDismissed(next);localStorage.setItem("ledora_dismissed_tips",JSON.stringify(next))};
  const od=onboardingData||{};
  const tips=[];
  if(!od.selectedIntegrations||od.selectedIntegrations.length===0)tips.push({id:"devices",icon:"⌚",color:C.pri,title:"Conecta un dispositivo",desc:"Sincroniza tu wearable para datos en tiempo real."});
  if(!od.familyConditions||od.familyConditions.length===0)tips.push({id:"family",icon:"👨‍👩‍👧",color:C.pur,title:"Completa tu historial familiar",desc:"Registra datos de padres, hermanos e hijos."});
  tips.push({id:"docs",icon:"📄",color:C.suc,title:"Sube documentos médicos",desc:"Centraliza analíticas e informes en un solo lugar."});
  const activeTips=tips.filter(t=>!dismissed.includes(t.id));

  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight},[msgs]);

  const mem=TM.find(m=>m.id===fam),lat=BL.length>0?BL[BL.length-1]:null;
  const tabs=[{id:"d",l:"Home",ic:I.Heart},{id:"f",l:"Familia",ic:I.DNA},{id:"e",l:"Datos",ic:I.Act},{id:"a",l:"IA",ic:I.Chat},{id:"t",l:"Tips",ic:I.Leaf},{id:"w",l:t("nav.wearables"),ic:I.Watch},{id:"o",l:"Docs",ic:I.File},{id:"p",l:"Perfil",ic:I.User}];
  const alertCount=INS.filter(i=>i.ur!=="low").length;

  const sendMsg=async(text)=>{if(!text.trim())return;setMsgs(p=>[...p,{r:"user",t:text}]);setInp("");
    setMsgs(p=>[...p,{r:"ai",t:"..."}]);
    try{
      const userContext={profile:U,labResults:BL.length>0?{latest:BL[BL.length-1],history:BL}:null,family:TM.length>0?TM.map(m=>({name:m.nm,relation:m.rl,conditions:m.co})):null,wearables:WEAR||null};
      let resp;
      if(isAIAvailable()){resp=await chatWithAI(text,userContext)}
      else{resp=AI_R[text]||`I analyzed your question about "${text}".\n\nBased on your profile, I recommend consulting with your doctor.\n\n\u26a0\ufe0f *Informational only. Always consult your doctor.*`}
      setMsgs(p=>[...p.slice(0,-1),{r:"ai",t:resp},{r:"sug",t:null,opts:demo.chatSuggestions}]);
    }catch(e){setMsgs(p=>[...p.slice(0,-1),{r:"ai",t:"Sorry, I couldn't process that. Please try again.\n\n\u26a0\ufe0f *Always consult your doctor.*"}])}};

  /* ═══ FILE UPLOAD HANDLER ═══ */
  const handleFiles=async(files)=>{
    const fileArr=Array.from(files);
    for(const file of fileArr){
      const type=uploadType||"Otro";
      const emoji=DOC_TYPES.find(d=>d.l===type)?.e||"📄";
      const now=new Date();
      const dt=`${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${String(now.getFullYear()).slice(-2)}`;
      const isImage=file.type.startsWith("image/");
      const isPDF=file.type==="application/pdf";
      let preview=null;
      if(isImage) preview=URL.createObjectURL(file);
      // Upload to Firebase Storage if user is logged in
      if(user){
        const v=validateFile(file);
        if(!v.valid){alert(v.error);continue;}
        setUploading(true);setUploadProg(0);
        try{
          const{path,downloadUrl}=await uploadDocument(user.uid,file,(p)=>setUploadProg(p));
          await addDocument(user.uid,{name:file.name.replace(/\.[^.]+$/,""),emoji:getEmojiForType(type),type,date:dt,size:formatFileSize(file.size),storageUrl:path,downloadUrl,mimeType:file.type,aiAnalysis:null,aiStatus:"pending"});
        }catch(err){alert("Error al subir: "+err.message)}
        finally{setUploading(false);setUploadProg(0)}
      } else {
        // Fallback: local-only (no user)
        const sizeKB=file.size/1024;
        const sizeStr=sizeKB>=1024?`${(sizeKB/1024).toFixed(1)} MB`:`${Math.round(sizeKB)} KB`;
        const newDoc={id:nextId.current++,n:file.name,e:emoji,dt,type,size:sizeStr,preview,isPDF,isImage,file};
        setDocs(prev=>[newDoc,...prev]);
      }
    }
    setUploadType(null);
    sM(null);
    setDragging(false);
  };
  const onDrop=(e)=>{e.preventDefault();setDragging(false);handleFiles(e.dataTransfer.files)};
  const onDragOver=(e)=>{e.preventDefault();setDragging(true)};
  const onDragLeave=()=>setDragging(false);
  const deleteDoc=(id)=>{setDocs(prev=>{const doc=prev.find(d=>d.id===id);if(doc?.preview)URL.revokeObjectURL(doc.preview);return prev.filter(d=>d.id!==id)});if(previewDoc?.id===id)setPreviewDoc(null)};

  /* ═══ HOME ═══ */
  const Dash=()=>{if(!lat)return <div style={{display:"flex",flexDirection:"column",gap:16}}>{isDemo&&<div style={{padding:"10px 16px",borderRadius:12,background:`linear-gradient(135deg,${C.wrnL},${C.wrnS}40)`,border:`1px solid ${C.wrnS}`,display:"flex",alignItems:"center",gap:8}}><I.Eye z={14} style={{color:C.wrn}}/><p style={{fontSize:12,fontWeight:600,color:C.wrn}}>{t("demo.banner")}</p></div>}<div><p style={{fontSize:14,color:C.tx3}}>Buenos días</p><h1 style={{fontSize:32,fontWeight:900,color:C.tx}}>{realProfile?.firstName||"User"}</h1></div><Cd style={{padding:24,textAlign:"center"}}><I.Act z={32} style={{color:C.pri,opacity:0.3,margin:"0 auto 10px"}}/><p style={{fontSize:15,fontWeight:700,color:C.tx}}>Welcome to Ledora AI</p><p style={{fontSize:13,color:C.tx3,marginTop:6}}>Upload your first lab results or medical document to get started.</p></Cd></div>;
  const oob=Object.entries(RG).filter(([k])=>k!=="wt").filter(([k,r])=>lat[k]<r.n||lat[k]>r.x);const ok=Object.entries(RG).filter(([k])=>k!=="wt").filter(([k,r])=>lat[k]>=r.n&&lat[k]<=r.x);
  return <div style={{display:"flex",flexDirection:"column",gap:20}}>
    {/* Welcome */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      {isDemo&&<div style={{padding:"10px 16px",borderRadius:12,background:`linear-gradient(135deg,${C.wrnL},${C.wrnS}40)`,border:`1px solid ${C.wrnS}`,display:"flex",alignItems:"center",gap:8,marginBottom:8}}><I.Eye z={14} style={{color:C.wrn}}/><p style={{fontSize:12,fontWeight:600,color:C.wrn}}>Modo demo — datos de ejemplo. Añade tus datos reales para personalizar.</p></div>}
      <div><p style={{fontSize:14,color:C.tx3,fontWeight:500}}>Buenos días</p><h1 style={{fontSize:32,fontWeight:900,color:C.tx,letterSpacing:-0.5}}>{realProfile?.firstName||U?.name?.split(" ")[0]||"—"}</h1></div>
      <Cd style={{padding:"10px 16px",background:`linear-gradient(135deg,${C.card},${C.priL})`,border:`1px solid ${C.priS}`,cursor:"pointer"}} onClick={()=>sM("otp")}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><I.QR z={18} style={{color:C.pri}}/><div><p style={{fontSize:9,color:C.tx3,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>Blockchain ID</p><p style={{fontSize:14,fontWeight:800,color:C.tx,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1}}>{realProfile?.bid||U?.bid||"—"}</p></div></div>
      </Cd>
    </div>
    {/* Smart Tips */}
    {activeTips.length>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(activeTips.length,3)},1fr)`,gap:10}}>{activeTips.map(tip=><div key={tip.id} style={{padding:"14px 16px",borderRadius:14,background:`linear-gradient(135deg,${tip.color}08,${tip.color}15)`,border:`1px solid ${tip.color}25`,position:"relative"}}><button onClick={()=>dismiss(tip.id)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.tx3,lineHeight:1}}>×</button><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:20}}>{tip.icon}</span><span style={{fontSize:13,fontWeight:800,color:C.tx}}>{tip.title}</span></div><p style={{fontSize:12,color:C.tx2,lineHeight:1.4}}>{tip.desc}</p></div>)}</div>}
    {/* Vitals Row */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>{[{l:"Altura",v:`${realProfile?.h||U?.h||"—"}cm`,ic:I.Ruler,cl:C.pri},{l:"Peso",v:`${realProfile?.w||U?.w||"—"}kg`,ic:I.Scale,cl:C.pur},{l:"Pulso",v:`${realProfile?.hr||U?.hr||"—"}bpm`,ic:I.Pulse,cl:C.dan},{l:"Tensión",v:realProfile?.bp||U?.bp||"—",ic:I.Heart,cl:C.suc},{l:"SpO2",v:`${realProfile?.sp02||U?.sp02||"—"}%`,ic:I.Oxy,cl:C.blu},{l:"Sangre",v:realProfile?.bl||U?.bl||"—",ic:I.Drop,cl:C.pnk}].map((s,i)=><Cd key={i} style={{padding:"14px 16px"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><s.ic z={14} style={{color:s.cl}}/><span style={{fontSize:10,color:C.tx3,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4}}>{s.l}</span></div><span style={{fontSize:20,fontWeight:800,color:C.tx}}>{s.v}</span></Cd>)}</div>
    {/* Two column: Wearables + Alerts */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {/* Wearables */}
      <Cd style={{padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:17,fontWeight:800,color:C.tx,display:"flex",alignItems:"center",gap:6}}><I.Watch z={17} style={{color:C.pur}}/>Wearables</h2><span style={{fontSize:11,color:C.tx3}}>Hoy, en directo</span></div>
        {WEAR?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>{Object.entries(WEAR).map(([k,w])=>{const pct=Math.min((w.v/w.g)*100,100);return <div key={k} style={{textAlign:"center",padding:10,borderRadius:12,background:C.bg}}>
          <div style={{position:"relative",width:50,height:50,margin:"0 auto 6px"}}><Ring pct={pct} color={w.cl} sz={50} sw={4}/><span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:w.cl}}>{k==="sleep"?w.v:Math.round(pct)}%</span></div>
          <p style={{fontSize:14,fontWeight:800,color:C.tx}}>{typeof w.v==="number"&&w.v>=1000?(w.v/1000).toFixed(1)+"k":w.v}</p>
          <p style={{fontSize:10,color:C.tx3}}>{w.l}</p>
          <p style={{fontSize:9,color:C.tx3,opacity:0.6}}>{w.src}</p>
        </div>})}</div>:<div style={{textAlign:"center",padding:"30px 20px"}}><I.Watch z={32} style={{color:C.tx3,opacity:0.4,margin:"0 auto 8px"}}/><p style={{fontSize:14,fontWeight:700,color:C.tx}}>Conecta tus wearables</p><p style={{fontSize:12,color:C.tx3,marginTop:4}}>Sincroniza tu reloj o pulsera para ver datos en tiempo real.</p></div>}
      </Cd>
      {/* Alerts + Out of range */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {alertCount>0&&<Cd style={{padding:"14px 18px",cursor:"pointer",borderLeft:`3px solid ${C.dan}`,background:`linear-gradient(90deg,${C.danL},${C.card})`}} onClick={()=>sT("a")}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><I.Spark z={20} style={{color:C.dan}}/><div style={{flex:1}}><p style={{fontSize:15,fontWeight:800,color:C.dan}}>{alertCount} alertas IA</p><p style={{fontSize:12,color:C.tx2}}>Hierro · Vit C · Colesterol</p></div><I.Chv z={16} style={{color:C.dan,opacity:0.4}}/></div>
        </Cd>}
        {oob.map(([k,r])=>{const v=lat[k],lo=v<r.n,prev=BL[BL.length-2]?.[k],diff=prev?(((v-prev)/prev)*100).toFixed(1):null;return <Cd key={k} style={{padding:"12px 16px",cursor:"pointer",borderLeft:`3px solid ${C.dan}`}} onClick={()=>{sB(k);sT("e")}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><span style={{fontSize:13,fontWeight:700,color:C.tx}}>{r.l}</span><Bd s="r" t={lo?"Bajo":"Alto"}/></div><div style={{display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontWeight:900,color:C.dan}}>{v}</span><span style={{fontSize:10,color:C.tx3}}>{r.u}</span>{diff&&<span style={{fontSize:11,fontWeight:700,color:C.dan,marginLeft:4}}>{Number(diff)>0?"+":""}{diff}%</span>}</div></div><Sk data={BL.map(d=>d[k])} color={C.dan} w={70} h={28}/></div>
        </Cd>})}
      </div>
    </div>
    {/* Two column: In Range + Family */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Cd style={{padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><h2 style={{fontSize:17,fontWeight:800,color:C.tx}}>En rango</h2><button onClick={()=>sT("e")} style={{fontSize:12,fontWeight:700,color:C.pri,background:"none",border:"none",cursor:"pointer"}}>Ver todo →</button></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{ok.map(([k,r])=><div key={k} onClick={()=>{sB(k);sT("e")}} style={{padding:"12px 14px",borderRadius:12,background:C.bg,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.tx3,fontWeight:600}}>{r.l}</span><Bd s="g" t="OK"/></div>
          <div style={{display:"flex",alignItems:"end",justifyContent:"space-between"}}><span style={{fontSize:20,fontWeight:900,color:C.suc}}>{lat[k]}<span style={{fontSize:10,color:C.tx3,marginLeft:2}}>{r.u}</span></span><Sk data={BL.map(d=>d[k])} color={C.suc} w={50} h={16}/></div>
        </div>)}</div>
      </Cd>
      <Cd style={{padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><h2 style={{fontSize:17,fontWeight:800,color:C.tx}}>Familia</h2><button onClick={()=>sT("f")} style={{fontSize:12,fontWeight:700,color:C.pri,background:"none",border:"none",cursor:"pointer"}}>Árbol →</button></div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>{TM.filter(m=>["p1","p2","me","s1","c1"].includes(m.id)).map(m=><div key={m.id} onClick={()=>{sF(m.id);sT("f")}} style={{textAlign:"center",cursor:"pointer"}}><div style={{width:44,height:44,borderRadius:14,background:m.me?`linear-gradient(135deg,${C.pri}18,${C.pur}18)`:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,border:m.me?`2px solid ${C.pri}`:`1px solid ${C.brd}`}}>{m.av}</div><p style={{fontSize:10,fontWeight:m.me?700:500,color:m.me?C.pri:C.tx2,marginTop:3}}>{m.nm.split(" ")[0]}</p></div>)}</div>
        {HR.slice(0,3).map((h,i)=><div key={i} style={{padding:"8px 0",borderTop:i>0?`1px solid ${C.brd}`:"none"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><I.DNA z={13} style={{color:h.c}}/><span style={{flex:1,fontSize:12,fontWeight:700,color:C.tx}}>{h.p}</span><span style={{fontSize:12,fontWeight:800,color:h.c}}>{h.risk}%</span></div><RB pct={h.risk} color={h.c}/></div>)}
      </Cd>
    </div>
  </div>};

  /* ═══ FAMILY ═══ */
  const Fam=()=><div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:24,fontWeight:900,color:C.tx}}>Árbol Familiar</h2><button onClick={()=>sM("add")} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,color:"white",border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.pri},${C.pur})`}}><I.Plus z={12} sk="white"/>Añadir</button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Cd style={{overflow:"hidden",padding:0}}><div style={{padding:"10px 16px 0",display:"flex",gap:14,fontSize:11,color:C.tx3}}>{[{c:"#9498AD",l:"Abuelos"},{c:C.pur,l:"Padres"},{c:C.pri,l:"Tú"},{c:C.pnk,l:"Hijos"}].map((x,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:4,background:x.c}}/>{x.l}</span>)}</div><TV ms={TM} cn={CN} onS={sF} sl={fam}/></Cd>
      {mem&&<Cd style={{padding:20}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><div style={{width:54,height:54,borderRadius:16,background:mem.me?`linear-gradient(135deg,${C.pri}12,${C.pur}12)`:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:mem.me?`2px solid ${C.pri}`:`1px solid ${C.brd}`}}>{mem.av}</div><div style={{flex:1}}><h3 style={{fontSize:20,fontWeight:800,color:C.tx}}>{mem.nm}</h3><p style={{fontSize:13,color:C.tx2}}>{mem.rl} · {mem.ag}{typeof mem.ag==="string"?"":" años"} · <span style={{color:C.dan,fontWeight:700}}>{mem.bl}</span></p></div></div>{mem.co.length>0?<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{mem.co.map((c,i)=><span key={i} style={{padding:"4px 10px",borderRadius:8,fontSize:12,background:C.wrnL,color:C.wrn}}>{c}</span>)}</div>:<p style={{fontSize:12,color:C.tx3,fontStyle:"italic"}}>Sin condiciones</p>}</Cd>}
    </div>
    <h3 style={{fontSize:18,fontWeight:800,color:C.tx}}>Patrones Hereditarios</h3>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {HR.map((h,i)=><Cd key={i} style={{overflow:"hidden"}}><button style={{width:"100%",padding:"14px 16px",textAlign:"left",display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer"}} onClick={()=>sE(exp===`h${i}`?null:`h${i}`)}><div style={{width:36,height:36,borderRadius:10,background:`${h.c}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.DNA z={15} style={{color:h.c}}/></div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:14,fontWeight:700,color:C.tx}}>{h.p}</span><span style={{fontSize:11,fontWeight:800,color:h.c}}>{h.risk}%</span></div><p style={{fontSize:11,color:C.tx3}}>{h.m.join(" → ")}</p></div><I.Chv z={14} style={{color:C.tx3,transform:exp===`h${i}`?"rotate(90deg)":"none",transition:"transform 0.2s"}}/></button>{exp===`h${i}`&&<div style={{padding:"0 16px 14px"}}><RB pct={h.risk} color={h.c}/><div style={{borderRadius:10,padding:12,background:C.bg,marginTop:8}}><p style={{fontSize:12,color:C.tx2,lineHeight:1.5}}>{h.i}</p></div></div>}</Cd>)}
    </div>
  </div>;

  /* ═══ EVOLUTION ═══ */
  const Evo=()=>{if(!lat||BL.length===0)return <div style={{display:"flex",flexDirection:"column",gap:16}}><h2 style={{fontSize:22,fontWeight:900,color:C.tx}}>Evolution</h2><Cd style={{padding:24,textAlign:"center"}}><p style={{fontSize:14,color:C.tx3}}>No lab data yet. Upload your first results to see trends.</p></Cd></div>;
  const r=RG[bio],v=lat[bio],f=BL[0][bio],cg=(((v-f)/f)*100).toFixed(1),lo=v<r.n,hi=v>r.x,oo=lo||hi,clr=oo?C.dan:C.suc;
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <h2 style={{fontSize:24,fontWeight:900,color:C.tx}}>Evolución</h2>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{Object.entries(RG).map(([k,rr])=>{const vv=lat[k],o2=vv<rr.n||vv>rr.x,at=bio===k;return <button key={k} onClick={()=>sB(k)} style={{padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:at?700:500,cursor:"pointer",background:at?C.pri:C.card,color:at?"white":C.tx2,border:`1px solid ${at?C.pri:o2?C.danS:C.brd}`,boxShadow:at?`0 2px 8px ${C.pri}35`:"none"}}>{o2&&!at&&<span style={{display:"inline-block",width:5,height:5,borderRadius:3,background:C.dan,marginRight:4}}/>}{rr.l}</button>})}</div>
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16}}>
      <Cd style={{padding:24}}><span style={{fontSize:14,color:C.tx2,fontWeight:600}}>{r.l}</span><div style={{margin:"8px 0"}}><Bd s={oo?"r":"g"} t={lo?"Bajo":hi?"Alto":"Normal"}/></div><div style={{display:"flex",alignItems:"baseline",gap:5}}><span style={{fontSize:48,fontWeight:900,color:C.tx,letterSpacing:-2}}>{v}</span><span style={{fontSize:14,color:C.tx3}}>{r.u}</span></div><span style={{fontSize:14,fontWeight:800,color:clr}}>{Number(cg)>0?"+":""}{cg}%</span><p style={{fontSize:12,color:C.tx3,marginTop:8}}>Rango: {r.n}–{r.x} {r.u}</p></Cd>
      <Cd style={{padding:"16px 12px"}}><Ch data={BL} dk={bio} rng={r} color={clr}/></Cd>
    </div>
    <Cd style={{overflow:"hidden"}}>{Object.entries(RG).map(([k,rr],i)=>{const vv=lat[k],ff=BL[0][k],pc=(((vv-ff)/ff)*100).toFixed(1),o2=vv<rr.n||vv>rr.x;return <div key={k} onClick={()=>sB(k)} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 18px",cursor:"pointer",borderTop:i>0?`1px solid ${C.brd}`:"none",background:bio===k?C.priL:"transparent",transition:"background 0.15s"}}><span style={{fontSize:13,color:C.tx,flex:1,fontWeight:bio===k?700:500}}>{rr.l}</span><Sk data={BL.map(d=>d[k])} color={o2?C.dan:C.suc} w={50} h={16}/><span style={{fontSize:14,fontWeight:700,color:o2?C.dan:C.suc,width:42,textAlign:"right"}}>{vv}</span><span style={{fontSize:11,fontWeight:600,width:50,textAlign:"right",color:Number(pc)<0?(k==="ch"?C.suc:C.dan):(k==="ch"?C.dan:C.suc)}}>{Number(pc)>0?"+":""}{pc}%</span></div>})}</Cd>
  </div>};

  /* ═══ AI CHAT ═══ */
  const AiChat=()=><div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 100px)"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${C.pri},${C.pur})`,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Spark z={18} sk="white"/></div><div><h2 style={{fontSize:20,fontWeight:800,color:C.tx}}>Asistente IA</h2><p style={{fontSize:11,color:C.tx3}}>Informativo · Consulta siempre tu médico</p></div></div>
    <div ref={chatRef} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:10}}>
      {msgs.map((m,i)=>{
        if(m.r==="ai")return <div key={i} style={{maxWidth:"70%",padding:"14px 18px",borderRadius:"4px 16px 16px 16px",background:C.card,border:`1px solid ${C.brd}`,boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:6}}><I.Spark z={11} style={{color:C.pri}}/><span style={{fontSize:10,fontWeight:700,color:C.pri}}>Ledora AI</span></div><div style={{fontSize:13,color:C.tx2,lineHeight:1.6,whiteSpace:"pre-wrap"}} dangerouslySetInnerHTML={{__html:m.t.replace(/\*\*(.*?)\*\*/g,'<b style="color:#0F1117">$1</b>')}}></div></div>;
        if(m.r==="user")return <div key={i} style={{maxWidth:"60%",padding:"10px 16px",borderRadius:"16px 16px 4px 16px",background:`linear-gradient(135deg,${C.pri},${C.priD})`,color:"white",fontSize:13,alignSelf:"flex-end",boxShadow:`0 2px 8px ${C.pri}30`}}>{m.t}</div>;
        if(m.r==="sug")return <div key={i} style={{display:"flex",flexWrap:"wrap",gap:6}}>{m.opts.map((o,j)=><button key={j} onClick={()=>sendMsg(o)} style={{padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:600,color:C.pri,background:C.priL,border:`1px solid ${C.priS}`,cursor:"pointer",transition:"all 0.15s"}}>{o}</button>)}</div>;
        return null;
      })}
    </div>
    <div style={{display:"flex",gap:8,padding:"8px 0"}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg(inp)} placeholder="Pregunta sobre tu salud..." style={{flex:1,padding:"12px 18px",borderRadius:12,border:`1.5px solid ${C.brd}`,background:C.card,fontSize:13,color:C.tx,outline:"none"}}/><button onClick={()=>sendMsg(inp)} style={{width:46,height:46,borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.pri},${C.pur})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${C.pri}30`}}><I.Send z={17} sk="white"/></button></div>
  </div>;

  /* ═══ TIPS ═══ */
  const TipsView=()=>{const filtered=tipCat==="all"?TIPS_DATA:TIPS_DATA.filter(t=>t.cat===tipCat);return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}><I.Leaf z={22} style={{color:C.suc}}/><h2 style={{fontSize:24,fontWeight:900,color:C.tx}}>Recomendaciones</h2></div>
    <Cd style={{padding:"12px 18px",background:C.sucL,border:`1px solid ${C.sucS}`}}><p style={{fontSize:12,color:C.tx2}}>Sugerencias basadas en tus datos. <b style={{color:C.suc}}>Consulta siempre tu médico.</b></p></Cd>
    <div style={{display:"flex",gap:6}}>{[{id:"all",l:"Todo"},{id:"diet",l:"🥗 Dieta"},{id:"exercise",l:"🏃 Ejercicio"},{id:"natural",l:"🌿 Natural"},{id:"meds",l:"💊 Medicación"}].map(c=><button key={c.id} onClick={()=>setTC(c.id)} style={{padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:tipCat===c.id?700:500,cursor:"pointer",background:tipCat===c.id?C.pri:C.card,color:tipCat===c.id?"white":C.tx2,border:`1px solid ${tipCat===c.id?C.pri:C.brd}`}}>{c.l}</button>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {filtered.map((tip,i)=><Cd key={i} style={{padding:18}}><div style={{display:"flex",alignItems:"start",gap:12}}><div style={{width:42,height:42,borderRadius:12,background:`${tip.cl}10`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><tip.ic z={18} style={{color:tip.cl}}/></div><div style={{flex:1}}><h3 style={{fontSize:14,fontWeight:700,color:C.tx}}>{tip.title}</h3><p style={{fontSize:12,color:C.tx2,marginTop:3,lineHeight:1.5}}>{tip.desc}</p><div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>{tip.tags.map((t,j)=><span key={j} style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:600,background:`${tip.cl}0d`,color:tip.cl}}>{t}</span>)}</div></div></div></Cd>)}
    </div>
  </div>};

  /* ═══ DOCUMENTS (FUNCTIONAL) ═══ */
  const DocView=()=><div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h2 style={{fontSize:24,fontWeight:900,color:C.tx}}>Documentos</h2>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",background:C.bg,borderRadius:10,padding:2}}>
          <button onClick={()=>setDocView("grid")} style={{padding:"6px 10px",borderRadius:8,border:"none",cursor:"pointer",background:docView==="grid"?C.card:"transparent",boxShadow:docView==="grid"?"0 1px 3px rgba(0,0,0,0.1)":"none"}}><I.Grid z={14} style={{color:docView==="grid"?C.pri:C.tx3}}/></button>
          <button onClick={()=>setDocView("list")} style={{padding:"6px 10px",borderRadius:8,border:"none",cursor:"pointer",background:docView==="list"?C.card:"transparent",boxShadow:docView==="list"?"0 1px 3px rgba(0,0,0,0.1)":"none"}}><I.List z={14} style={{color:docView==="list"?C.pri:C.tx3}}/></button>
        </div>
        <button onClick={()=>sM("upload")} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,color:"white",border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.pri},${C.pur})`}}><I.Plus z={13} sk="white"/>Subir documento</button>
      </div>
    </div>
    {/* Drop zone */}
    <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.doc,.docx,.txt,.dicom,.dcm" style={{display:"none"}} onChange={e=>{if(e.target.files.length)handleFiles(e.target.files);e.target.value=""}}/>
    <Cd style={{padding:30,textAlign:"center",cursor:"pointer",border:`2px dashed ${dragging?C.pri:C.priS}`,background:dragging?`${C.pri}08`:C.priL,transition:"all 0.2s"}} onClick={()=>{setUploadType("Otro");fileRef.current?.click()}} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
      <I.Scan z={32} style={{color:C.pri,opacity:0.4,margin:"0 auto 8px"}}/>
      <p style={{fontSize:15,fontWeight:700,color:C.tx}}>{dragging?"Suelta los archivos aquí":"Arrastra archivos aquí o haz clic para subir"}</p>
      <p style={{fontSize:12,color:C.tx3,marginTop:4}}>PDF, imágenes, documentos médicos · IA extrae datos automáticamente</p>
    </Cd>
    {/* Upload progress */}
    {uploading&&<Cd style={{padding:"14px 18px"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><I.Scan z={14} style={{color:C.pri}}/><span style={{fontSize:13,fontWeight:700,color:C.pri}}>Subiendo... {uploadProg}%</span></div><RB pct={uploadProg} color={C.pri}/></Cd>}
    {/* Stats */}
    <div style={{display:"flex",gap:12}}>
      {(()=>{const allDocs=realDocs.length>0?realDocs:(isDemo?demo.docsDesktop:[]);return[{l:"Total",v:allDocs.length,cl:C.pri},{l:"Analíticas",v:allDocs.filter(d=>(d.type||d.type)==="Analítica").length,cl:C.suc},{l:"Informes",v:allDocs.filter(d=>(d.type||d.type)==="Informe").length,cl:C.pur},{l:"Imágenes",v:allDocs.filter(d=>["Radiografía","MRI/TAC"].includes(d.type||d.type)).length,cl:C.blu}]})().map((s,i)=><Cd key={i} style={{flex:1,padding:"12px 16px"}}><p style={{fontSize:10,color:C.tx3,fontWeight:600,textTransform:"uppercase"}}>{s.l}</p><p style={{fontSize:24,fontWeight:900,color:s.cl}}>{s.v}</p></Cd>)}
    </div>
    {/* Document preview modal */}
    {previewDoc&&<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)"}} onClick={()=>setPreviewDoc(null)}>
      <div style={{background:C.card,borderRadius:20,padding:24,maxWidth:700,width:"90%",maxHeight:"85vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><h3 style={{fontSize:18,fontWeight:800,color:C.tx}}>{previewDoc.n}</h3><button onClick={()=>setPreviewDoc(null)} style={{width:32,height:32,borderRadius:8,border:"none",background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><I.X z={16} style={{color:C.tx3}}/></button></div>
        {previewDoc.isImage&&previewDoc.preview?<img src={previewDoc.preview} alt={previewDoc.n} style={{width:"100%",borderRadius:12,maxHeight:"60vh",objectFit:"contain"}}/>
        :previewDoc.isPDF?<div style={{padding:40,textAlign:"center",background:C.bg,borderRadius:12}}><I.File z={48} style={{color:C.pri,margin:"0 auto 12px"}}/><p style={{fontSize:14,fontWeight:600,color:C.tx}}>Archivo PDF</p><p style={{fontSize:12,color:C.tx3,marginTop:4}}>{previewDoc.size}</p></div>
        :<div style={{padding:40,textAlign:"center",background:C.bg,borderRadius:12}}><span style={{fontSize:48}}>{previewDoc.e}</span><p style={{fontSize:14,fontWeight:600,color:C.tx,marginTop:8}}>{previewDoc.type}</p><p style={{fontSize:12,color:C.tx3,marginTop:4}}>{previewDoc.size}</p></div>}
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <div style={{flex:1,padding:"8px 12px",borderRadius:8,background:C.bg}}><p style={{fontSize:10,color:C.tx3}}>Tipo</p><p style={{fontSize:12,fontWeight:600,color:C.tx}}>{previewDoc.type}</p></div>
          <div style={{flex:1,padding:"8px 12px",borderRadius:8,background:C.bg}}><p style={{fontSize:10,color:C.tx3}}>Tamaño</p><p style={{fontSize:12,fontWeight:600,color:C.tx}}>{previewDoc.size}</p></div>
          <div style={{flex:1,padding:"8px 12px",borderRadius:8,background:C.bg}}><p style={{fontSize:10,color:C.tx3}}>Fecha</p><p style={{fontSize:12,fontWeight:600,color:C.tx}}>{previewDoc.dt}</p></div>
        </div>
      </div>
    </div>}
    {/* Document grid/list */}
    {realDocs.length>0?(
      docView==="grid"?
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
          {realDocs.map(d=><Cd key={d.id} style={{padding:0,overflow:"hidden",cursor:"pointer",transition:"transform 0.15s,box-shadow 0.15s"}} onClick={()=>setPreviewDoc({...d,n:d.name,e:d.emoji||"📄",dt:d.date||"—"})}>
            <div style={{height:120,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <span style={{fontSize:40}}>{d.emoji||"📄"}</span>
            </div>
            <div style={{padding:"10px 14px"}}><p style={{fontSize:12,fontWeight:700,color:C.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</p><div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><span style={{fontSize:10,color:C.tx3}}>{d.date||"—"}</span>{d.size&&<span style={{fontSize:10,color:C.tx3}}>{d.size}</span>}{d.aiStatus==="complete"?<Bd s="g" t="IA ✓"/>:d.aiStatus==="analyzing"?<Bd s="b" t="Analizando..."/>:<Bd s="b" t={d.type||"Subido"}/>}</div></div>
          </Cd>)}
        </div>
      :
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {realDocs.map(d=><Cd key={d.id} style={{padding:"12px 18px",cursor:"pointer"}} onClick={()=>setPreviewDoc({...d,n:d.name,e:d.emoji||"📄",dt:d.date||"—"})}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:10,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:20}}>{d.emoji||"📄"}</span></div>
              <div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:700,color:C.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</p><div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}><span style={{fontSize:11,color:C.tx3}}>{d.date||"—"}</span>{d.size&&<span style={{fontSize:11,color:C.tx3}}>{d.size}</span>}{d.aiStatus==="complete"?<Bd s="g" t="IA ✓"/>:d.aiStatus==="analyzing"?<Bd s="b" t="Analizando..."/>:<Bd s="b" t={d.type||"Subido"}/>}</div></div>
            </div>
          </Cd>)}
        </div>
    ):(
      docView==="grid"?
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
          {docs.map(d=><Cd key={d.id} style={{padding:0,overflow:"hidden",cursor:"pointer",transition:"transform 0.15s,box-shadow 0.15s"}} onClick={()=>setPreviewDoc(d)}>
            <div style={{height:120,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {d.isImage&&d.preview?<img src={d.preview} alt={d.n} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:40}}>{d.e}</span>}
              <button onClick={e=>{e.stopPropagation();deleteDoc(d.id)}} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Trash z={13} style={{color:C.dan}}/></button>
            </div>
            <div style={{padding:"10px 14px"}}><p style={{fontSize:12,fontWeight:700,color:C.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.n}</p><div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><span style={{fontSize:10,color:C.tx3}}>{d.dt}</span><span style={{fontSize:10,color:C.tx3}}>{d.size}</span><Bd s="b" t={d.type}/></div></div>
          </Cd>)}
        </div>
      :
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {docs.map(d=><Cd key={d.id} style={{padding:"12px 18px",cursor:"pointer"}} onClick={()=>setPreviewDoc(d)}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:10,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
                {d.isImage&&d.preview?<img src={d.preview} alt={d.n} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:20}}>{d.e}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:700,color:C.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.n}</p><div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}><span style={{fontSize:11,color:C.tx3}}>{d.dt}</span><span style={{fontSize:11,color:C.tx3}}>{d.size}</span><Bd s="b" t={d.type}/></div></div>
              <button onClick={e=>{e.stopPropagation();deleteDoc(d.id)}} style={{width:32,height:32,borderRadius:8,background:C.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.Trash z={14} style={{color:C.dan}}/></button>
            </div>
          </Cd>)}
        </div>
    )}
  </div>;

  /* ═══ PROFILE ═══ */
  const Prof=()=><div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Cd style={{padding:24,background:`linear-gradient(135deg,${C.priL},${C.purL})`}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:68,height:68,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:"white",background:`linear-gradient(135deg,${C.pri},${C.pur})`,boxShadow:`0 6px 16px ${C.pri}30`,flexShrink:0}}>{realProfile?.firstName?realProfile.firstName.charAt(0).toUpperCase():"CM"}</div>
          <div><h2 style={{fontSize:24,fontWeight:900,color:C.tx}}>{realProfile?.name||U?.name||"—"}</h2><p style={{fontSize:14,color:C.tx2}}>{realProfile?.age||U?.age||"—"} años · {realProfile?.h||U?.h||"—"}cm · {realProfile?.w||U?.w||"—"}kg</p><div style={{marginTop:6,display:"flex",gap:6}}><span style={{padding:"3px 12px",borderRadius:20,background:C.danL,fontSize:13,fontWeight:800,color:C.dan}}>{realProfile?.bl||U?.bl||"—"}</span><span style={{padding:"3px 12px",borderRadius:20,background:C.bg,fontSize:13,fontWeight:600,color:C.tx2}}>IMC {realProfile?.bmi||U?.bmi||"—"}</span></div></div>
        </div>
      </Cd>
      <Cd style={{padding:"16px 20px",background:`linear-gradient(135deg,${C.card},${C.priL})`,border:`1.5px solid ${C.priS}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><I.Link z={18} style={{color:C.pri}}/><div style={{flex:1}}><p style={{fontSize:10,color:C.tx3,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>Blockchain ID</p><p style={{fontSize:16,fontWeight:800,color:C.tx,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1}}>{realProfile?.bid||U?.bid||"—"}</p></div><button onClick={()=>sM("otp")} style={{padding:"8px 14px",borderRadius:8,fontSize:11,fontWeight:700,color:"white",background:C.pri,border:"none",cursor:"pointer"}}>Compartir</button></div>
        <div style={{marginTop:12,display:"flex",alignItems:"center",gap:8}}><I.Watch z={14} style={{color:C.pur}}/><span style={{fontSize:12,fontWeight:600,color:C.tx}}>3 dispositivos conectados</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:8}}>{[{n:"Apple Watch Series 9",s:"Conectado",cl:C.suc},{n:"iPhone 15 Pro",s:"Conectado",cl:C.suc},{n:"Withings Scale",s:"Desconectado",cl:C.tx3}].map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:6,height:6,borderRadius:3,background:d.cl}}/><span style={{fontSize:11,color:C.tx,flex:1}}>{d.n}</span><span style={{fontSize:10,color:d.cl,fontWeight:600}}>{d.s}</span></div>)}</div>
      </Cd>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {[{t:"Alergias",ic:I.Warn,it:realProfile?.al||U?.al||[],cl:C.wrn,bg:C.wrnL},{t:"Condiciones",ic:I.Eye,it:realProfile?.co||U?.co||[],cl:C.dan,bg:C.danL},{t:"Vacunas",ic:I.Shield,it:realProfile?.va||U?.va||[],cl:C.suc,bg:C.sucL},{t:"Medicación",ic:I.Pill,it:realProfile?.meds||U?.meds||[],cl:C.pnk,bg:C.pnkL}].map((s,i)=><Cd key={i} style={{padding:"14px 18px"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><s.ic z={16} style={{color:s.cl}}/><h3 style={{fontSize:14,fontWeight:700,color:C.tx}}>{s.t}</h3></div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{s.it.map((x,j)=><span key={j} style={{padding:"4px 12px",borderRadius:8,fontSize:12,background:s.bg,color:s.cl}}>{x}</span>)}</div></Cd>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {[{l:"Compartir con médico",d:"Código OTP temporal",ic:I.Key,cl:C.pri,act:()=>sM("otp")},{l:"Transferir a hijo/a (18+)",d:"Traspaso completo de historial",ic:I.Transfer,cl:C.pnk},{l:"Añadir familiar",d:"Hijos, padres o hermanos",ic:I.Users,cl:C.pur,act:()=>sM("add")},{l:"Exportar historial",d:"PDF, FHIR o HL7",ic:I.File,cl:C.blu}].map((b,i)=><Cd key={i} style={{padding:"14px 18px",cursor:"pointer"}} onClick={b.act||undefined}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:40,height:40,borderRadius:12,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><b.ic z={17} style={{color:b.cl}}/></div><div style={{flex:1}}><p style={{fontSize:13,fontWeight:700,color:C.tx}}>{b.l}</p><p style={{fontSize:11,color:C.tx3}}>{b.d}</p></div><I.Chv z={14} style={{color:C.tx3,opacity:0.3}}/></div></Cd>)}
    </div>
    <Cd style={{padding:"12px 18px",background:C.sucL,border:`1px solid ${C.sucS}`}}><div style={{display:"flex",alignItems:"center",gap:10}}><I.Shield z={17} style={{color:C.suc}}/><div><p style={{fontSize:12,fontWeight:700,color:C.suc}}>Datos protegidos</p><p style={{fontSize:11,color:C.tx2}}>Cifrado E2E · Blockchain · GDPR · HIPAA</p></div></div></Cd>
    <button onClick={handleLogout} style={{width:"100%",padding:"14px 0",borderRadius:14,fontSize:14,fontWeight:700,color:C.dan,background:C.danL,border:`1px solid ${C.danS}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.15s"}}><I.LogOut z={16} style={{color:C.dan}}/>Cerrar sesión</button>
  </div>;

  /* WEARABLES */
  const WearView=()=>{
    const[loading,setLoading]=useState(null);
    const allServices=getAvailableIntegrations();
    const native=isNativeApp();
    const merged=allServices.map(s=>{const ui=integrations.find(i=>i.serviceId===s.id);return{...s,connected:ui?ui.connected:false}});
    const handleToggle=async(svc)=>{
      setLoading(svc.id);
      try{if(svc.connected){await disconnectService(user.uid,svc.id)}else{await connectService(user.uid,svc.id)}}catch(e){console.error(e)}
      setLoading(null);
    };
    const nativeOnly=["apple_health","samsung_health"];
    return <div style={{maxWidth:900}}>
      <div style={{marginBottom:16}}>
        <h2 style={{fontSize:22,fontWeight:900,color:C.tx}}>{t("wearables.title")}</h2>
        <p style={{fontSize:13,color:C.tx2,marginTop:4}}>{t("wearables.subtitle")}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {merged.map(svc=><Cd key={svc.id} style={{padding:"16px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:48,borderRadius:14,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{svc.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <p style={{fontSize:14,fontWeight:700,color:C.tx}}>{svc.name}</p>
                <Bd s={svc.connected?"g":"w"} t={svc.connected?t("wearables.connected"):t("wearables.disconnected")}/>
              </div>
              <p style={{fontSize:12,color:C.tx3,marginTop:2}}>{svc.description}</p>
              {!native&&nativeOnly.includes(svc.id)&&<p style={{fontSize:10,color:C.wrn,marginTop:2}}>{t("wearables.nativeOnly")}</p>}
            </div>
            <button disabled={loading===svc.id||(!native&&nativeOnly.includes(svc.id))} onClick={()=>handleToggle(svc)} style={{padding:"8px 18px",borderRadius:10,fontSize:12,fontWeight:700,cursor:loading===svc.id?"wait":"pointer",border:`1px solid ${svc.connected?C.danS:C.priS}`,background:svc.connected?C.danL:C.priL,color:svc.connected?C.dan:C.pri,opacity:(loading===svc.id||(!native&&nativeOnly.includes(svc.id)))?0.5:1}}>
              {loading===svc.id?"...":svc.connected?t("wearables.disconnect"):t("wearables.connect")}
            </button>
          </div>
        </Cd>)}
      </div>
      <Cd style={{padding:"14px 18px",background:C.sucL,border:`1px solid ${C.sucS}`,marginTop:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <I.Shield z={17} style={{color:C.suc}}/>
          <p style={{fontSize:12,color:C.suc,fontWeight:600}}>{t("wearables.dataPrivacy")}</p>
        </div>
      </Cd>
    </div>;
  };

  const pg={d:Dash,f:Fam,e:Evo,a:AiChat,t:TipsView,w:WearView,o:DocView,p:Prof},P=pg[tab]||Dash;

  return (<div onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>e.preventDefault()} style={{minHeight:"100vh",display:"flex",background:`linear-gradient(180deg,${C.bg},${C.bg2})`,fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700;800;900&display=swap');*{margin:0;padding:0;box-sizing:border-box;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;-webkit-font-smoothing:antialiased}button{outline:none}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.brd};border-radius:3px}::-webkit-scrollbar-thumb:hover{background:${C.brd2}}input::placeholder{color:${C.tx3}}`}</style>
    {/* SIDEBAR */}
    <div style={{width:240,minHeight:"100vh",background:C.card,borderRight:`1px solid ${C.brd}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,zIndex:30}}>
      {/* Logo */}
      <div style={{padding:"20px 20px 16px",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.pri},${C.pur})`,boxShadow:`0 2px 8px ${C.pri}30`}}><I.Logo z={16} sk="white" sw={2.2}/></div>
        <span style={{fontSize:16,fontWeight:900,color:C.tx}}>Ledora<span style={{color:C.pri}}>AI</span></span>
      </div>
      <div style={{padding:"0 12px",flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",marginBottom:12}}><I.Lock z={11} style={{color:C.suc,opacity:0.5}}/><span style={{fontSize:8.5,fontWeight:700,color:C.suc,opacity:0.5}}>BLOCKCHAIN SECURED</span></div>
        {tabs.map(t=>{const at=tab===t.id;return <button key={t.id} onClick={()=>sT(t.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",marginBottom:2,background:at?C.priL:"transparent",transition:"all 0.15s"}}>
          <t.ic z={17} style={{color:at?C.pri:C.tx3}}/>
          <span style={{fontSize:13,fontWeight:at?700:500,color:at?C.pri:C.tx2}}>{t.l}</span>
          {t.id==="a"&&alertCount>0&&<span style={{marginLeft:"auto",width:18,height:18,borderRadius:9,background:C.dan,color:"white",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{alertCount}</span>}
        </button>})}
      </div>
      {/* User card */}
      <div style={{padding:12,borderTop:`1px solid ${C.brd}`}} onClick={()=>sT("p")}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 8px",borderRadius:10,cursor:"pointer",background:tab==="p"?C.priL:"transparent"}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${C.pri},${C.pur})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:800}}>{realProfile?.firstName?realProfile.firstName.charAt(0).toUpperCase():"CM"}</div>
          <div><p style={{fontSize:12,fontWeight:700,color:C.tx}}>{realProfile?.firstName||"Carlos M."}</p><p style={{fontSize:10,color:C.tx3}}>{realProfile?.bl||"A+"} · {realProfile?.age||34} años</p></div>
        </div>
      </div>
    </div>
    {/* MAIN CONTENT */}
    <div style={{flex:1,marginLeft:240,padding:"24px 32px 32px",overflowY:"auto",minHeight:"100vh"}}>
      <P/>
    </div>
    {/* MODALS */}
    {mod&&<div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.3)",backdropFilter:"blur(6px)"}} onClick={()=>sM(null)}>
      <div style={{width:"100%",maxWidth:500,borderRadius:22,padding:28,background:"white",display:"flex",flexDirection:"column",gap:14,maxHeight:"80vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
        {mod==="upload"&&<>
          <h3 style={{fontSize:20,fontWeight:900,color:C.tx,textAlign:"center"}}>Subir Documento</h3>
          <p style={{fontSize:12,color:C.tx3,textAlign:"center"}}>Selecciona el tipo de documento</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {DOC_TYPES.map((t,i)=><button key={i} onClick={()=>{setUploadType(t.l);fileRef.current?.click()}} style={{borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:10,background:uploadType===t.l?C.priL:C.bg,border:`1px solid ${uploadType===t.l?C.priS:C.brd}`,cursor:"pointer",transition:"all 0.15s"}}><span style={{fontSize:22}}>{t.e}</span><span style={{fontSize:13,fontWeight:600,color:C.tx}}>{t.l}</span></button>)}
          </div>
          {/* Drop area */}
          <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} style={{padding:24,textAlign:"center",borderRadius:12,border:`2px dashed ${dragging?C.pri:C.priS}`,background:dragging?`${C.pri}08`:C.priL,cursor:"pointer",transition:"all 0.2s"}} onClick={()=>{if(!uploadType)setUploadType("Otro");fileRef.current?.click()}}>
            <I.Download z={28} style={{color:C.pri,opacity:0.4,margin:"0 auto 8px"}}/>
            <p style={{fontSize:13,fontWeight:600,color:C.tx}}>Arrastra aquí o haz clic</p>
            <p style={{fontSize:11,color:C.tx3,marginTop:3}}>PDF, imágenes, DICOM</p>
          </div>
        </>}
        {mod==="add"&&<><h3 style={{fontSize:20,fontWeight:900,color:C.tx,textAlign:"center"}}>Añadir Familiar</h3><p style={{fontSize:12,color:C.tx3,textAlign:"center"}}>La IA analizará patrones hereditarios</p>{[{l:"Hijo/a",d:"Desde recién nacido. Crea su historial desde el día 1.",e:"👶",cl:C.pnk},{l:"Padre/Madre",d:"Datos de padres para patrones hereditarios.",e:"👨‍👩‍👧",cl:C.pur},{l:"Hermano/a",d:"Comparte patrones genéticos.",e:"👫",cl:C.blu}].map((t,i)=><button key={i} style={{borderRadius:14,padding:16,display:"flex",alignItems:"center",gap:12,background:C.bg,border:`1px solid ${C.brd}`,cursor:"pointer",textAlign:"left",width:"100%"}}><span style={{fontSize:28,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:14,background:`${t.cl}10`}}>{t.e}</span><div><p style={{fontSize:14,fontWeight:700,color:C.tx}}>{t.l}</p><p style={{fontSize:11,color:C.tx3,marginTop:2}}>{t.d}</p></div></button>)}<div style={{borderRadius:10,padding:12,background:C.sucL,border:`1px solid ${C.sucS}`}}><p style={{fontSize:11,color:C.tx2}}><b style={{color:C.suc}}>Transferencia 18+:</b> Al cumplir 18, transfiere el historial completo a su propia cuenta Ledora AI.</p></div></>}
        {mod==="otp"&&<><h3 style={{fontSize:20,fontWeight:900,color:C.tx,textAlign:"center"}}>Compartir con Médico</h3><p style={{fontSize:12,color:C.tx3,textAlign:"center"}}>Tu ID: <b style={{fontFamily:"'JetBrains Mono',monospace",color:C.tx}}>{realProfile?.bid||U?.bid||"—"}</b></p><OTPShare onClose={closeOTP}/><div style={{borderRadius:10,padding:12,background:C.bg}}><p style={{fontSize:11,color:C.tx2,lineHeight:1.5}}>El médico introduce tu <b>Blockchain ID</b> + este <b>código de 6 dígitos</b> para acceder temporalmente a tu historial. El acceso expira automáticamente.</p></div></>}
        <button onClick={()=>{sM(null);setUploadType(null)}} style={{width:"100%",padding:8,fontSize:13,color:C.tx3,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Cerrar</button>
      </div>
    </div>}
  </div>);
}
