import React,{useState,useEffect} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useApp} from "../App";
import {getCrop} from "../i18n/cropData";

export default function History(){
  const {t,lang}=useApp();
  const navigate=useNavigate();
  const [recs,setRecs]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    axios.get("/api/history").then(r=>setRecs(r.data.data||[])).catch(()=>setRecs([])).finally(()=>setLoading(false));
  },[]);

  const deleteOne=async(id)=>{
    await axios.delete(`/api/history/${id}`).catch(()=>{});
    setRecs(r=>r.filter(x=>x._id!==id));
  };
  const clearAll=async()=>{
    if(!window.confirm("Clear all history?"))return;
    await axios.delete("/api/history/all").catch(()=>{});
    setRecs([]);
  };

  if(loading)return<div style={{textAlign:"center",padding:60,fontSize:32}}>⏳</div>;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontSize:26,fontWeight:900,color:"var(--g)"}}>📋 {t.history.title}</h2>
        {recs.length>0&&(
          <button onClick={clearAll} style={{background:"#fdecea",color:"var(--r)",border:"none",padding:"8px 20px",borderRadius:20,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)",fontSize:14}}>
            🗑️ {t.history.clearAll}
          </button>
        )}
      </div>

      {recs.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{fontSize:72,marginBottom:16}}>🌱</div>
          <div style={{fontSize:18,color:"var(--mu)",marginBottom:24}}>{t.history.empty}</div>
          <button className="btn-p" onClick={()=>navigate("/input")}>Get Recommendation</button>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:16}}>
          {recs.map((rec,i)=>{
            const c=getCrop(rec.topCrop);
            const name=lang!=="en"&&c[lang]?`${c.en} / ${c[lang]}`:c.en;
            return(
              <div key={rec._id||i} style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"var(--sh)",display:"flex",flexDirection:"column"}}>
                {c.img?(
                  <img src={c.img} alt={c.en} style={{width:"100%",height:120,objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                ):(
                  <div style={{width:"100%",height:120,background:"var(--gp)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>{c.emoji}</div>
                )}
                <div style={{padding:16,flex:1}}>
                  <div style={{fontSize:20,fontWeight:800,color:"var(--g)",marginBottom:4}}>{c.emoji} {name}</div>
                  <div style={{fontSize:13,color:"var(--mu)"}}>
                    Soil Health: <strong>{rec.soilHealth?.toFixed(0)}/100</strong> &nbsp;·&nbsp; {rec.mode==="advanced"?"🔬 Advanced":"👆 Simple"}
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                    {rec.inputs?.soilType&&<span style={{background:"var(--gp)",color:"var(--g)",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>🪨 {rec.inputs.soilType}</span>}
                    {rec.inputs?.season&&<span style={{background:"var(--gp)",color:"var(--g)",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>🌤 {rec.inputs.season}</span>}
                    {rec.district&&<span style={{background:"var(--gp)",color:"var(--g)",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>📍 {rec.district}</span>}
                    {rec.rythuBandhu&&<span style={{background:"#fff3cd",color:"#856404",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>🌾 Rythu Bandhu</span>}
                    {rec.pmfbyCovered&&<span style={{background:"#e8f4fd",color:"var(--b)",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>🛡️ PMFBY</span>}
                  </div>
                  {rec.createdAt&&<div style={{fontSize:11,color:"var(--mu)",marginTop:8}}>📅 {new Date(rec.createdAt).toLocaleString()}</div>}
                  <button onClick={()=>deleteOne(rec._id)} style={{background:"#fdecea",color:"var(--r)",border:"none",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",marginTop:10,fontFamily:"var(--font)"}}>
                    🗑️ {t.history.deleteOne}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
