import React,{useState,useEffect,useRef} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useApp} from "../App";
import {getCrop} from "../i18n/cropData";

const SLIDES=[
  {icon:"📍",title:"Step 1 — Detect Location",desc:"Tap GPS or pick your farm on the map. We auto-fill weather and detect soil type from SoilGrids satellite data."},
  {icon:"🪨",title:"Step 2 — Confirm Soil",desc:"Soil auto-detected from your coordinates. Upload a soil photo for AI image analysis. Change if needed."},
  {icon:"🎯",title:"Step 3 — Set Priority",desc:"Choose Simple or Advanced mode. Set your preference — profit, yield, low water, or pest resistance."},
  {icon:"🌾",title:"Step 4 — Get Results",desc:"ML model analyzes 7 parameters. Get crop recommendation, rotation advice, fertilizer guide, and live mandi price."},
];

export default function Home(){
  const {t,lang,locInfo}=useApp();
  const navigate=useNavigate();
  const [slide,setSlide]=useState(0);
  const [stats,setStats]=useState([]);
  const [total,setTotal]=useState(0);
  const timer=useRef();

  useEffect(()=>{
    timer.current=setInterval(()=>setSlide(s=>(s+1)%SLIDES.length),3500);
    return()=>clearInterval(timer.current);
  },[]);

  useEffect(()=>{
    const d=locInfo?.district||"";
    axios.get(d?`/api/community?district=${encodeURIComponent(d)}`:"/api/community")
      .then(r=>{setStats(r.data.data||[]);setTotal(r.data.total||0);}).catch(()=>{});
  },[locInfo]);

  const S=SLIDES[slide];
  const max=stats.length?Math.max(...stats.map(s=>s.count)):1;

  return(
    <div>
      <div className="hero">
        <div style={{fontSize:60,marginBottom:10}}>🌾</div>
        <h1 className="hero-title">{t.home.hero}</h1>
        <p className="hero-sub">{t.home.heroSub}</p>
        <div className="hero-stats">
          <div><div className="hs-num">84.6%</div><div className="hs-lbl">Model Accuracy</div></div>
          <div><div className="hs-num">22</div><div className="hs-lbl">Crop Types</div></div>
          <div><div className="hs-num">11,000+</div><div className="hs-lbl">Training Samples</div></div>
        </div>
        <button className="sub-btn" style={{width:"auto",padding:"15px 40px",fontSize:17,display:"inline-flex"}} onClick={()=>navigate("/input")}>
          🚀 {t.home.cta}
        </button>
      </div>

      {/* HOW TO USE SLIDESHOW */}
      <div className="how-box" style={{background:"linear-gradient(135deg,#f8fff8,#e8f5e9)",border:"2px solid #D4E6D4",borderRadius:18,padding:28,marginBottom:24}}>
        <div style={{fontSize:19,fontWeight:800,color:"var(--g)",marginBottom:20}}>📖 {t.home.howTitle}</div>
        <div style={{textAlign:"center",padding:10}}>
          <div style={{fontSize:56,marginBottom:12}}>{S.icon}</div>
          <div style={{fontSize:20,fontWeight:800,color:"var(--g)",marginBottom:8}}>{S.title}</div>
          <div style={{fontSize:15,color:"var(--mu)",lineHeight:1.7,maxWidth:460,margin:"0 auto"}}>{S.desc}</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:18}}>
          {SLIDES.map((_,i)=>(
            <button key={i} onClick={()=>{setSlide(i);clearInterval(timer.current);}}
              style={{width:10,height:10,borderRadius:"50%",border:"none",background:i===slide?"var(--g)":"#ccc",cursor:"pointer",padding:0,transform:i===slide?"scale(1.4)":"scale(1)",transition:"all .2s"}}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:14}}>
          <button disabled={slide===0} onClick={()=>setSlide(s=>s-1)} style={{background:"var(--g)",color:"#fff",border:"none",padding:"7px 18px",borderRadius:30,fontWeight:700,cursor:"pointer",opacity:slide===0?.4:1}}>← Prev</button>
          <button disabled={slide===SLIDES.length-1} onClick={()=>setSlide(s=>s+1)} style={{background:"var(--g)",color:"#fff",border:"none",padding:"7px 18px",borderRadius:30,fontWeight:700,cursor:"pointer",opacity:slide===SLIDES.length-1?.4:1}}>Next →</button>
        </div>
      </div>

      {/* FEATURES */}
      <div className="feat-grid">
        {[{icon:"📍",t:t.home.f1,d:t.home.f1d},{icon:"🔬",t:t.home.f2,d:t.home.f2d},{icon:"🔄",t:t.home.f3,d:t.home.f3d},{icon:"📈",t:t.home.f4,d:t.home.f4d}].map(f=>(
          <div className="feat" key={f.t}>
            <div className="feat-icon">{f.icon}</div>
            <div className="feat-title">{f.t}</div>
            <div className="feat-desc">{f.d}</div>
          </div>
        ))}
      </div>

      {/* COMMUNITY STATS */}
      <div className="comm-box">
        <div className="sec-head">📊 {t.home.communityTitle}</div>
        <div className="sec-sub">{locInfo?.district?`${locInfo.district} District`:"All India"} · {t.home.communitySub}</div>
        {stats.length===0?(
          <p style={{color:"var(--mu)",fontSize:15,padding:"16px 0"}}>{t.home.communityEmpty}</p>
        ):stats.map((s,i)=>{
          const c=getCrop(s.crop);
          return(
            <div className="comm-row" key={i}>
              <div className="comm-lbl">{c.emoji} {lang!=="en"&&c[lang]?c[lang]:c.en}</div>
              <div className="comm-bar"><div className="comm-fill" style={{width:`${(s.count/max)*100}%`}}/></div>
              <div className="comm-cnt">{s.count} farmers</div>
            </div>
          );
        })}
        {total>0&&<div style={{fontSize:12,color:"var(--mu)",marginTop:8}}>Total recommendations: {total}</div>}
      </div>

      <div className="card" style={{textAlign:"center",fontSize:14,color:"var(--mu)",lineHeight:2}}>
        🏫 <strong>Vignan's University</strong> — Dept. of CSE | Field Project 2025–26<br/>
        Project Guide: <strong>Mr. S. Ranjeeth</strong>
      </div>
    </div>
  );
}
