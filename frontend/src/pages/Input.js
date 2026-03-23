import React,{useState,useRef,useCallback} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useApp} from "../App";
import {CROPS,detectSoilFromCoords,analyzeSoilImage,detectSeason,getSoilNPK,STATE_SOIL} from "../i18n/cropData";

const SOILS=[
  {key:"Black",emoji:"⬛",bg:"#2d2d2d",text:"#fff",desc:"Dark, sticky, holds water"},
  {key:"Red",  emoji:"🟥",bg:"#c0392b",text:"#fff",desc:"Reddish, drains fast"},
  {key:"Sandy",emoji:"🟨",bg:"#e6a817",text:"#333",desc:"Light, very loose"},
  {key:"Loamy",emoji:"🟫",bg:"#8B5E3C",text:"#fff",desc:"Mixed, best for farming"},
];
const SEASONS=[
  {key:"Kharif",icon:"🌧",label:"Kharif (Jun–Oct)"},
  {key:"Rabi",  icon:"❄️",label:"Rabi (Nov–Mar)"},
  {key:"Zaid",  icon:"☀️",label:"Zaid (Mar–Jun)"},
];
const WATERS=[
  {key:"VeryLow",icon:"🏜️",label:"Very Low\nRain-fed only"},
  {key:"Low",    icon:"💧",label:"Low\nLimited irrigation"},
  {key:"Medium", icon:"🌊",label:"Medium\nRegular irrigation"},
  {key:"High",   icon:"🌧",label:"High\nAbundant water"},
];
const PREFS=[
  {value:"",          label:"No specific preference"},
  {value:"profit",    label:"💰 Maximum Profit — highest market value"},
  {value:"yield",     label:"📦 Maximum Yield — highest quantity"},
  {value:"lowWater",  label:"💧 Low Water — water-scarce farms"},
  {value:"pestFree",  label:"🛡️ Pest Resistant — fewer chemicals"},
  {value:"quickCycle",label:"⚡ Short Growing Cycle — faster harvest"},
  {value:"organic",   label:"🌿 Organic Friendly — no synthetic inputs"},
  {value:"export",    label:"✈️ Export Quality — national/global demand"},
];

const autoSeason = detectSeason();

async function reverseGeo(lat,lon){
  try{
    const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,{signal:AbortSignal.timeout(6000)});
    const d=await r.json();
    const a=d.address||{};
    return {district:a.county||a.district||a.city||a.town||"",state:a.state||""};
  }catch{return {district:"",state:""};}
}

export default function Input(){
  const {t,setResult,setLoc}=useApp();
  const navigate=useNavigate();
  const [mode,setMode]=useState("simple");
  const [soil,setSoil]=useState(null);
  const [soilAutoTag,setSoilAutoTag]=useState(null);
  const [soilRawData,setSoilRaw]=useState(null);
  const [season,setSeason]=useState(autoSeason.key);
  const [water,setWater]=useState("Medium");
  const [pref,setPref]=useState("");
  const [prev,setPrev]=useState("");
  const [gps,setGps]=useState("idle");
  const [weather,setWeather]=useState(null);
  const [loc,setLocState]=useState(null);
  const [showMap,setShowMap]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [imgAnalyzing,setImgAnalyzing]=useState(false);
  const [imgResult,setImgResult]=useState(null);
  // Advanced mode fields
  const [advN,setAdvN]=useState("");
  const [advP,setAdvP]=useState("");
  const [advK,setAdvK]=useState("");
  const [advPh,setAdvPh]=useState("");
  const mapEl=useRef(null);
  const leafMap=useRef(null);
  const marker=useRef(null);
  const imgRef=useRef(null);
  const dropRef=useRef(null);

  const fetchAll=useCallback(async(lat,lon)=>{
    setGps("loading");setError("");
    try{
      const [wRes,geo,soilData]=await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum&timezone=auto&forecast_days=1`,{signal:AbortSignal.timeout(8000)}),
        reverseGeo(lat,lon),
        detectSoilFromCoords(lat,lon),
      ]);
      const wd=await wRes.json();
      setWeather({temperature:wd.current.temperature_2m,humidity:wd.current.relative_humidity_2m,rainfall:wd.daily.precipitation_sum?.[0]??0});
      const locData={...geo,lat,lon};
      setLocState(locData);
      setLoc(locData);
      if(soilData?.type){
        setSoil(soilData.type);setSoilRaw(soilData);
        setSoilAutoTag(`Auto-detected by SoilGrids (${soilData.confidence} confidence)`);
        if(mode==="advanced"&&soilData.N_est){
          setAdvN(soilData.N_est);setAdvP(soilData.P_est);setAdvK(soilData.K_est);setAdvPh(soilData.ph);
        }
      } else if(geo.state&&STATE_SOIL[geo.state]){
        setSoil(STATE_SOIL[geo.state]);
        setSoilAutoTag(`Suggested for ${geo.state} (change if wrong)`);
      }
      setGps("done");
    }catch{
      setGps("error");setError("Could not fetch location data. Check internet.");
    }
  },[mode,setLoc]);

  const handleGPS=()=>navigator.geolocation.getCurrentPosition(
    p=>fetchAll(p.coords.latitude,p.coords.longitude),
    ()=>{setGps("error");setError("Location denied. Allow location access or use the map.");}
  );

  const initMap=(el)=>{
    if(!el||leafMap.current||!window.L)return;
    mapEl.current=el;
    const L=window.L;
    const map=L.map(el).setView([17.385,78.486],6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);
    map.on("click",async e=>{
      const {lat,lng}=e.latlng;
      if(marker.current)marker.current.remove();
      marker.current=L.marker([lat,lng]).addTo(map).bindPopup("📍 Your Farm").openPopup();
      await fetchAll(lat,lng);
    });
    leafMap.current=map;
  };

  const handleImage=async(file)=>{
    if(!file||!file.type.startsWith("image/"))return;
    setImgAnalyzing(true);setImgResult(null);
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=async()=>{
      const res=await analyzeSoilImage(img);
      setImgAnalyzing(false);
      if(res){
        setImgResult(res);
        setSoil(res.type);
        setSoilAutoTag(`Detected from photo (${res.confidence} confidence)`);
      }
      URL.revokeObjectURL(url);
    };
    img.src=url;
  };

  const handleDrop=e=>{e.preventDefault();handleImage(e.dataTransfer.files[0]);};

  const handleSubmit=async()=>{
    if(!soil){setError("Please select your soil type.");return;}
    if(!weather){setError("Please detect your location first.");return;}
    setError("");setLoading(true);
    try{
      let N,P,K,ph;
      if(mode==="advanced"&&advN&&advP&&advK&&advPh){
        N=parseFloat(advN);P=parseFloat(advP);K=parseFloat(advK);ph=parseFloat(advPh);
      } else {
        const d=getSoilNPK(soil,soilRawData);
        N=d.N;P=d.P;K=d.K;ph=d.ph;
      }
      const payload={N,P,K,ph,
        temperature:weather.temperature,humidity:weather.humidity,rainfall:weather.rainfall,
        previousCrop:prev,soilType:soil,season,preference:pref,
        waterAvailability:water,district:loc?.district||"",state:loc?.state||"",
        lat:loc?.lat,lon:loc?.lon,mode};
      const res=await axios.post("/api/predict",payload);
      setResult(res.data);navigate("/result");
    }catch(e){
      setError(e.response?.data?.error||"Server error. Make sure backend is running.");
    }finally{setLoading(false);}
  };

  const currentMonth=new Date().toLocaleString("default",{month:"long",year:"numeric"});

  return(
    <div className="card">
      <h2 style={{fontSize:26,fontWeight:900,color:"var(--g)",marginBottom:6}}>🌱 {t.input.title}</h2>
      <p style={{fontSize:15,color:"var(--mu)",marginBottom:20}}>{t.input.sub}</p>

      {/* MODE TABS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
        {[{m:"simple",icon:"👆",name:t.input.simpleMode,desc:t.input.simpleModeDesc},{m:"advanced",icon:"🔬",name:t.input.advancedMode,desc:t.input.advancedModeDesc}].map(({m,icon,name,desc})=>(
          <div key={m} onClick={()=>setMode(m)} style={{border:`3px solid ${mode===m?"var(--g)":"var(--br)"}`,background:mode===m?"var(--gp)":"var(--bg)",borderRadius:14,padding:16,cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
            <div style={{fontSize:28,marginBottom:6}}>{icon}</div>
            <div style={{fontSize:16,fontWeight:800,color:"var(--g)"}}>{name}</div>
            <div style={{fontSize:12,color:"var(--mu)",marginTop:4}}>{desc}</div>
          </div>
        ))}
      </div>

      {/* DATE CHIP */}
      <div style={{display:"inline-block",background:"var(--gp)",borderRadius:8,padding:"5px 14px",fontSize:13,color:"var(--g)",fontWeight:700,marginBottom:24}}>
        📅 {currentMonth} · {SEASONS.find(s=>s.key===season)?.icon} {season} Season
      </div>

      {error&&<div className="err">⚠️ {error}</div>}

      {/* STEP 1 — LOCATION */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>📍 {t.input.step1}</div>
        <div style={{fontSize:13,color:"var(--mu)",marginBottom:14}}>{t.input.step1sub}</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
          <button className="gps-btn" onClick={handleGPS} disabled={gps==="loading"}>
            {gps==="loading"?<><span className="spin"></span> {t.input.gpsLoading}</>:<>📍 {t.input.gpsBtn}</>}
          </button>
          <button className="gps-btn" style={{background:"var(--g2)"}} onClick={()=>setShowMap(m=>!m)}>
            🗺️ {showMap?t.input.hideMap:t.input.mapBtn}
          </button>
        </div>

        {showMap&&(
          <div>
            <p style={{fontSize:13,color:"var(--mu)",marginBottom:8}}>👆 {t.input.mapHint}</p>
            <div ref={initMap} style={{height:300,borderRadius:14,overflow:"hidden",border:"2px solid var(--g2)",marginBottom:12}}/>
          </div>
        )}

        {/* Manual entry */}
        <div style={{marginTop:10}}>
          <p style={{fontSize:13,color:"var(--mu)",marginBottom:8}}>{t.input.orManual}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
            {[{label:t.input.stateLabel,val:loc?.state||"",set:v=>setLocState(l=>({...l,state:v}))},
              {label:t.input.districtLabel,val:loc?.district||"",set:v=>setLocState(l=>({...l,district:v}))},
              {label:t.input.pinLabel,val:"",set:()=>{}}].map(({label,val,set})=>(
              <div key={label} style={{display:"flex",flexDirection:"column",gap:5}}>
                <label style={{fontSize:13,fontWeight:700}}>{label}</label>
                <input value={val} onChange={e=>set(e.target.value)} style={{padding:"9px 12px",border:"2px solid var(--br)",borderRadius:8,fontSize:14,fontFamily:"var(--font)",background:"var(--bg)"}} placeholder={label}/>
              </div>
            ))}
          </div>
        </div>

        {gps==="done"&&loc&&(
          <div style={{marginTop:12}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"var(--gp)",color:"var(--g)",fontWeight:700,padding:"8px 16px",borderRadius:50,fontSize:14}}>
              ✅ {loc.district}{loc.district&&loc.state?", ":""}{loc.state}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
              {[{label:`🌡 ${weather.temperature}°C`},{label:`💧 ${weather.humidity}%`},{label:`🌧 ${weather.rainfall}mm`},{label:`📅 ${currentMonth}`}].map(({label})=>(
                <span key={label} style={{background:"var(--gp)",border:"1.5px solid var(--g2)",color:"var(--g)",padding:"5px 14px",borderRadius:30,fontSize:13,fontWeight:700}}>{label}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2 — SOIL */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>
          🪨 {t.input.step2}
          {soilAutoTag&&<span style={{fontSize:11,background:"#fff3cd",color:"#856404",padding:"2px 10px",borderRadius:20,marginLeft:8,fontWeight:700}}>{soilAutoTag}</span>}
        </div>
        <div style={{fontSize:13,color:"var(--mu)",marginBottom:14}}>{t.input.step2sub}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:16}}>
          {SOILS.map(s=>(
            <div key={s.key} onClick={()=>{setSoil(s.key);setSoilAutoTag(null);}}
              style={{border:`3px solid ${soil===s.key?"var(--g)":"transparent"}`,background:soil===s.key?"var(--gp)":"var(--bg)",borderRadius:12,padding:"14px 10px",textAlign:"center",cursor:"pointer",transition:"all .18s"}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:s.bg,margin:"0 auto 8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:s.text}}>{s.emoji}</div>
              <div style={{fontSize:14,fontWeight:800,marginBottom:3}}>{t.input["soil"+s.key]}</div>
              <div style={{fontSize:11,color:"var(--mu)"}}>{t.input["soil"+s.key+"Desc"]}</div>
            </div>
          ))}
        </div>

        {/* SOIL IMAGE UPLOAD */}
        <div ref={dropRef} onDrop={handleDrop} onDragOver={e=>e.preventDefault()}
          style={{border:"2px dashed var(--br)",borderRadius:12,padding:20,textAlign:"center",cursor:"pointer",background:"var(--bg)",transition:"all .2s"}}
          onClick={()=>imgRef.current?.click()}>
          <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImage(e.target.files[0])}/>
          {imgAnalyzing?(
            <div><span className="spin spin-g"></span> <span style={{fontSize:14,color:"var(--mu)"}}>{t.input.soilImgAnalyzing}</span></div>
          ):imgResult?(
            <div style={{fontSize:14,color:"var(--g)",fontWeight:700}}>
              ✅ {t.input.soilImgResult} <strong>{imgResult.type} Soil</strong> ({imgResult.confidence})
              <div style={{fontSize:12,color:"var(--mu)",marginTop:4}}>Click to upload a different photo</div>
            </div>
          ):(
            <div>
              <div style={{fontSize:32,marginBottom:8}}>📷</div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--g)",marginBottom:4}}>{t.input.soilImgLabel}</div>
              <div style={{fontSize:12,color:"var(--mu)"}}>{t.input.soilImgHint}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:6}}>Drag & drop or click to upload · JPG/PNG</div>
            </div>
          )}
        </div>
      </div>

      {/* STEP 3 — SEASON */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>🌤 {t.input.step3}</div>
        <div style={{fontSize:13,color:"var(--mu)",marginBottom:14}}>{t.input.step3sub}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {SEASONS.map(s=>(
            <div key={s.key} onClick={()=>setSeason(s.key)}
              style={{border:`3px solid ${season===s.key?"var(--o)":"transparent"}`,background:season===s.key?"#fff8f0":"var(--bg)",borderRadius:12,padding:16,textAlign:"center",cursor:"pointer",transition:"all .18s"}}>
              <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:14,fontWeight:800}}>{s.label}</div>
              {autoSeason.key===s.key&&<div style={{fontSize:11,color:"var(--o)",fontWeight:700,marginTop:4}}>Current</div>}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 4 — WATER */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>💧 {t.input.step4}</div>
        <div style={{fontSize:13,color:"var(--mu)",marginBottom:14}}>{t.input.step4sub}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
          {WATERS.map(w=>(
            <div key={w.key} onClick={()=>setWater(w.key)}
              style={{border:`3px solid ${water===w.key?"var(--b)":"transparent"}`,background:water===w.key?"#e8f4fd":"var(--bg)",borderRadius:12,padding:14,textAlign:"center",cursor:"pointer",transition:"all .18s"}}>
              <div style={{fontSize:26,marginBottom:6}}>{w.icon}</div>
              <div style={{fontSize:13,fontWeight:800,whiteSpace:"pre-line"}}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 5 — PREFERENCE */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>🎯 {t.input.step5}</div>
        <div style={{fontSize:13,color:"var(--mu)",marginBottom:14}}>{t.input.step5sub}</div>
        <select value={pref} onChange={e=>setPref(e.target.value)}
          style={{width:"100%",padding:"12px 16px",border:"2px solid var(--br)",borderRadius:12,fontSize:15,fontFamily:"var(--font)",color:"var(--tx)",background:"var(--bg)",cursor:"pointer"}}>
          {PREFS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* STEP 6 — PREVIOUS CROP */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>🌾 {t.input.step6}</div>
        <div style={{fontSize:13,color:"var(--mu)",marginBottom:14}}>{t.input.step6sub}</div>
        <select value={prev} onChange={e=>setPrev(e.target.value)}
          style={{width:"100%",padding:"12px 16px",border:"2px solid var(--br)",borderRadius:12,fontSize:15,fontFamily:"var(--font)",color:"var(--tx)",background:"var(--bg)"}}>
          <option value="">{t.input.prevPlaceholder}</option>
          {CROPS.map(c=><option key={c.en} value={c.en}>{c.emoji} {c.en} / {c.te}</option>)}
        </select>
      </div>

      {/* ADVANCED MODE — ACTUAL NPK */}
      {mode==="advanced"&&(
        <div style={{background:"#f8fff8",border:"2px solid var(--g2)",borderRadius:14,padding:20,marginBottom:28}}>
          <div style={{fontSize:17,fontWeight:800,color:"var(--g)",marginBottom:6}}>🔬 {t.input.npkTitle}</div>
          <div style={{fontSize:13,color:"var(--mu)",marginBottom:14}}>{t.input.npkSub}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
            {[{label:"Nitrogen (N) kg/ha",val:advN,set:setAdvN},{label:"Phosphorus (P) kg/ha",val:advP,set:setAdvP},{label:"Potassium (K) kg/ha",val:advK,set:setAdvK},{label:"Soil pH (0-14)",val:advPh,set:setAdvPh}].map(({label,val,set})=>(
              <div key={label} style={{display:"flex",flexDirection:"column",gap:5}}>
                <label style={{fontSize:12,fontWeight:700,color:"var(--tx)"}}>{label}</label>
                <input type="number" value={val} onChange={e=>set(e.target.value)} placeholder="Enter value"
                  style={{padding:"10px 14px",border:"2px solid var(--br)",borderRadius:8,fontSize:16,fontFamily:"var(--font)",background:"#fff"}}/>
              </div>
            ))}
          </div>
          <div style={{fontSize:12,color:"var(--mu)",marginTop:10}}>💡 Get these values from your official Soil Health Card</div>
        </div>
      )}

      <button className="sub-btn" onClick={handleSubmit} disabled={loading}>
        {loading?<><span className="spin"></span> {t.input.submitting}</>:<>🔍 {t.input.submit}</>}
      </button>
    </div>
  );
}
