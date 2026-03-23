import React,{useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useApp} from "../App";
import {getCrop} from "../i18n/cropData";

const mColor=s=>s>=70?"#27AE60":s>=40?"#F4C430":"#E74C3C";
const npkColor=v=>v>=80?"#27AE60":v>=50?"#F4C430":"#E74C3C";

export default function Result(){
  const {t,lang,result}=useApp();
  const navigate=useNavigate();
  useEffect(()=>{if(!result)navigate("/input");},[result,navigate]);
  if(!result)return null;

  const crop=getCrop(result.topCrop);
  const native=lang!=="en"?crop[lang]:null;
  const score=result.soilHealth||50;
  const col=mColor(score);
  const mandi=result.mandi;

  const shareWA=()=>{
    const msg=`🌾 CROP Recommendation\nCrop: ${result.topCrop}${native?` (${native})`:""}
Confidence: ${result.confidence}%
Soil Health: ${score}/100
${mandi?`Market Price: ₹${mandi.avg}/quintal\n`:""}Next Season: ${result.rotationSuggestions?.join(", ")||"—"}
Get yours: https://crop-app.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  return(
    <div>
      {/* HERO — full crop image background */}
      <div style={{position:"relative",borderRadius:18,overflow:"hidden",marginBottom:20,minHeight:380,background:"#0a3d20"}}>
        {crop.img&&<img src={crop.img} alt={crop.en} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.45}} onError={e=>e.target.style.display="none"}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,40,0,.8))"}}/>
        <div style={{position:"relative",zIndex:2,padding:"44px 28px",textAlign:"center",color:"#fff"}}>
          <p style={{opacity:.8,fontSize:15,marginBottom:6}}>{t.result.bestCrop}</p>
          <div style={{fontSize:"clamp(38px,7vw,64px)",fontWeight:900,lineHeight:1.1,marginBottom:6}}>
            {crop.emoji} {crop.en}
          </div>
          {native&&<div style={{fontSize:22,opacity:.88,marginBottom:12}}>{native}</div>}
          <div style={{display:"inline-block",background:"#F4C430",color:"#1a2e1a",padding:"7px 24px",borderRadius:50,fontSize:18,fontWeight:800,marginBottom:8}}>
            {result.confidence}% {t.result.confidence}
          </div>
          <div style={{fontSize:13,opacity:.7,marginBottom:16}}>🤖 Model CV Accuracy: {result.modelAccuracy}%</div>

          {/* LIVE MANDI PRICE */}
          {mandi&&mandi.prices?.length>0?(
            <div style={{display:"inline-flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.15)",backdropFilter:"blur(6px)",border:"1.5px solid rgba(255,255,255,.3)",padding:"12px 24px",borderRadius:50,marginBottom:12}}>
              <span style={{fontSize:22}}>📈</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:11,opacity:.75,textTransform:"uppercase",letterSpacing:1}}>{t.result.marketTitle} · {mandi.prices[0].market}, {mandi.prices[0].state}</div>
                <div style={{fontSize:22,fontWeight:900}}>₹{mandi.avg?.toLocaleString()}/quintal</div>
                <div style={{fontSize:11,opacity:.65}}>Min ₹{mandi.min} · Max ₹{mandi.max} · {mandi.prices[0].date}</div>
              </div>
            </div>
          ):(
            <div style={{fontSize:13,opacity:.6,marginBottom:8}}>{t.result.marketNone}</div>
          )}

          {/* TELANGANA SCHEME BADGES */}
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginTop:8}}>
            {result.rythuBandhu&&(
              <div style={{background:"rgba(244,196,48,.9)",color:"#333",padding:"6px 16px",borderRadius:50,fontWeight:800,fontSize:13}}>
                🌾 Rythu Bandhu Eligible — ₹10,000/acre support
              </div>
            )}
            {result.pmfbyCovered&&(
              <div style={{background:"rgba(41,128,185,.85)",color:"#fff",padding:"6px 16px",borderRadius:50,fontWeight:800,fontSize:13}}>
                🛡️ PMFBY Crop Insurance Covered
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESULT GRID */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18,marginBottom:18}}>

        {/* SOIL HEALTH */}
        <div className="card-sm">
          <div style={{fontSize:17,fontWeight:800,color:"var(--g)",marginBottom:12}}>🌍 {t.result.soilHealth}</div>
          <div style={{fontSize:40,fontWeight:900,color:col}}>{score}/100</div>
          <div style={{height:20,background:"#eee",borderRadius:10,overflow:"hidden",margin:"10px 0"}}>
            <div style={{height:"100%",width:`${score}%`,background:col,borderRadius:10,transition:"width 1.2s ease"}}/>
          </div>
          <div style={{fontSize:13,color:"var(--mu)"}}>{score>=70?`✅ ${t.result.good}`:score>=40?`⚠️ ${t.result.medium}`:`🔴 ${t.result.poor}`}</div>
          <div style={{fontSize:12,color:"var(--mu)",marginTop:6}}>Water Requirement: <strong>{result.waterRequirement}</strong></div>
        </div>

        {/* TOP 3 */}
        <div className="card-sm">
          <div style={{fontSize:17,fontWeight:800,color:"var(--g)",marginBottom:12}}>🏆 {t.result.top3}</div>
          {result.top3?.map((item,i)=>{
            const c=getCrop(item.crop);
            const rankBg=["#F4C430","#ccc","#cd7f32"][i];
            return(
              <div key={item.crop} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<2?"1px solid #f0f0f0":"none"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:rankBg,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,flexShrink:0}}>{i+1}</div>
                <span style={{flex:1,fontWeight:700,fontSize:14}}>{c.emoji} {c.en}{lang!=="en"&&c[lang]?` / ${c[lang]}`:""}</span>
                <div style={{width:70,height:8,background:"#eee",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${item.confidence}%`,background:"var(--g2)",borderRadius:4}}/>
                </div>
                <span style={{fontSize:13,color:"var(--mu)",minWidth:38,textAlign:"right"}}>{item.confidence}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* NPK ADEQUACY */}
      {result.npkAdequacy&&(
        <div className="card-sm" style={{marginBottom:18}}>
          <div style={{fontSize:17,fontWeight:800,color:"var(--g)",marginBottom:4}}>{t.result.npkTitle}</div>
          <div style={{fontSize:13,color:"var(--mu)",marginBottom:14}}>{t.result.npkSub}</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {Object.entries(result.npkAdequacy).map(([k,v])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontSize:13,fontWeight:800,width:20,color:"var(--g)"}}>{k}</div>
                <div style={{flex:1,height:18,background:"#eee",borderRadius:9,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${v}%`,background:npkColor(v),borderRadius:9,transition:"width 1s ease"}}/>
                </div>
                <span style={{fontSize:13,fontWeight:700,minWidth:44,textAlign:"right",color:npkColor(v)}}>{v}%</span>
                <span style={{fontSize:12,color:"var(--mu)"}}>{v>=80?"✅ Adequate":v>=50?"⚠️ Low":"🔴 Deficient"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FERTILIZER RECOMMENDATIONS */}
      {result.fertilizerRecommendation?.length>0&&(
        <div className="card-sm" style={{marginBottom:18}}>
          <div style={{fontSize:17,fontWeight:800,color:"var(--g)",marginBottom:12}}>{t.result.fertTitle}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {result.fertilizerRecommendation.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:8,background:"var(--gp)",padding:"8px 12px",borderRadius:8,fontSize:14}}>
                <span>💊</span><span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROTATION */}
      {result.rotationSuggestions?.length>0&&(
        <div className="card-sm" style={{marginBottom:18}}>
          <div style={{fontSize:17,fontWeight:800,color:"var(--g)",marginBottom:4}}>🔄 {t.result.rotation}</div>
          <div style={{fontSize:13,color:"var(--mu)",marginBottom:12}}>{t.result.rotationSub}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {result.rotationSuggestions.map(name=>{
              const c=getCrop(name);
              return <span key={name} style={{background:"var(--gp)",border:"2px solid var(--g2)",color:"var(--g)",padding:"7px 16px",borderRadius:50,fontWeight:800,fontSize:14}}>{c.emoji} {c.en}{lang!=="en"&&c[lang]?` / ${c[lang]}`:""}</span>;
            })}
          </div>
        </div>
      )}

      {/* INPUT SUMMARY */}
      <div className="card-sm" style={{marginBottom:18}}>
        <div style={{fontSize:17,fontWeight:800,color:"var(--g)",marginBottom:12}}>📊 {t.result.inputSummary}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:10}}>
          {result.inputs&&Object.entries(result.inputs)
            .filter(([k])=>!["previousCrop","lat","lon","soilType","season","preference","waterAvailability","district","state","mode"].includes(k))
            .map(([k,v])=>(
              <div key={k} style={{background:"var(--bg)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"var(--mu)",fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>{k}</div>
                <div style={{fontSize:18,fontWeight:800,color:"var(--g)",marginTop:2}}>{typeof v==="number"?v.toFixed(1):v||"—"}</div>
              </div>
            ))
          }
          {result.inputs?.soilType&&<div style={{background:"var(--bg)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:10,color:"var(--mu)",fontWeight:800,textTransform:"uppercase"}}>Soil</div><div style={{fontSize:15,fontWeight:800,color:"var(--g)",marginTop:2}}>{result.inputs.soilType}</div></div>}
          {result.inputs?.district&&<div style={{background:"var(--bg)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:10,color:"var(--mu)",fontWeight:800,textTransform:"uppercase"}}>District</div><div style={{fontSize:13,fontWeight:800,color:"var(--g)",marginTop:2}}>{result.inputs.district}</div></div>}
        </div>
      </div>

      {/* FEATURE IMPORTANCE */}
      {result.featureImportance&&(
        <div className="card-sm" style={{marginBottom:18}}>
          <div style={{fontSize:17,fontWeight:800,color:"var(--g)",marginBottom:12}}>📊 What Influenced This Recommendation</div>
          {Object.entries(result.featureImportance).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:700,width:100,color:"var(--tx)"}}>{k}</div>
              <div style={{flex:1,height:14,background:"#eee",borderRadius:7,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${v*100}%`,background:"var(--g2)",borderRadius:7}}/>
              </div>
              <span style={{fontSize:12,color:"var(--mu)",minWidth:36}}>{(v*100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}

      <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:8}}>
        <button className="btn-p" onClick={()=>navigate("/input")}>🔍 {t.result.newRec}</button>
        <button className="btn-o" onClick={()=>navigate("/history")}>📋 History</button>
        <button style={{background:"#25D366",color:"#fff",border:"none",padding:"13px 24px",borderRadius:50,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"var(--font)"}} onClick={shareWA}>
          📤 {t.result.share}
        </button>
      </div>
    </div>
  );
}
