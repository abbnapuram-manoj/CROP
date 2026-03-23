import React from "react";
import {useApp} from "../App";

export default function About(){
  const {t}=useApp();
  return(
    <div>
      <div className="card">
        <h2 style={{fontSize:28,fontWeight:900,color:"var(--g)",marginBottom:14}}>🌾 {t.about.title}</h2>

        <div style={{fontSize:18,fontWeight:800,color:"var(--g)",marginBottom:8}}>{t.about.whatTitle}</div>
        <p style={{fontSize:15,color:"var(--mu)",lineHeight:1.8,marginBottom:20}}>{t.about.whatDesc}</p>

        <div style={{fontSize:18,fontWeight:800,color:"var(--g)",marginBottom:8}}>{t.about.whyTitle}</div>
        <p style={{fontSize:15,color:"var(--mu)",lineHeight:1.8,marginBottom:20}}>{t.about.whyDesc}</p>

        <div style={{fontSize:18,fontWeight:800,color:"var(--g)",marginBottom:8}}>{t.about.howTitle}</div>
        <p style={{fontSize:15,color:"var(--mu)",lineHeight:1.8,whiteSpace:"pre-line",marginBottom:20}}>{t.about.howDesc}</p>

        <div style={{fontSize:18,fontWeight:800,color:"var(--g)",marginBottom:12}}>{t.about.techTitle}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {["⚛️ React.js","⚙️ Node.js + Express","🍃 MongoDB","🐍 Python + scikit-learn",
            "🌲 Random Forest (200 trees)","📡 Open-Meteo API","🗺️ OpenStreetMap + Leaflet",
            "🔬 SoilGrids ISRIC","🤖 TensorFlow.js MobileNet","📊 data.gov.in API"].map(b=>(
            <span key={b} style={{background:"var(--gp)",border:"1.5px solid var(--g2)",color:"var(--g)",padding:"7px 14px",borderRadius:8,fontWeight:700,fontSize:14}}>{b}</span>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{fontSize:18,fontWeight:800,color:"var(--g)",marginBottom:14}}>🏫 {t.about.teamTitle}</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <tbody>
            {[
              [t.about.university,"Vignan's University, Hyderabad Campus"],
              [t.about.dept,"Computer Science & Engineering"],
              [t.about.year,"2025–26"],
              [t.about.project,"Field Project"],
              [t.about.guide,"Mr. S. Ranjeeth"],
            ].map(([k,v])=>(
              <tr key={k} style={{borderBottom:"1px solid var(--br)"}}>
                <td style={{padding:"9px 6px",fontWeight:800,color:"var(--g)",width:"40%",fontSize:14}}>{k}</td>
                <td style={{padding:"9px 6px",color:"#444",fontSize:14}}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div style={{fontSize:18,fontWeight:800,color:"var(--g)",marginBottom:14}}>📊 ML Model Info</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
          {[["Algorithm","Random Forest"],["Trees","200"],["Training Samples","11,000+"],["Crop Classes","22"],
            ["Test Accuracy","84.41%"],["CV Accuracy","84.58%"],["Features","N,P,K,pH,Temp,Humidity,Rainfall"],["Validation","5-fold Cross Validation"]].map(([k,v])=>(
            <div key={k} style={{background:"var(--bg)",borderRadius:10,padding:"12px 16px"}}>
              <div style={{fontSize:10,color:"var(--mu)",fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>{k}</div>
              <div style={{fontSize:16,fontWeight:800,color:"var(--g)",marginTop:4}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{background:"linear-gradient(135deg,#e8f5e9,#f5e6d8)"}}>
        <div style={{fontSize:18,fontWeight:800,color:"var(--g)",marginBottom:14}}>🏛️ Telangana Government Schemes Integrated</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#fff",borderRadius:10,padding:14}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>🌾 Rythu Bandhu Scheme</div>
            <div style={{fontSize:14,color:"var(--mu)"}}>₹10,000 per acre per season investment support for eligible crops. Our system shows eligibility on result page.</div>
          </div>
          <div style={{background:"#fff",borderRadius:10,padding:14}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>🛡️ PMFBY Crop Insurance</div>
            <div style={{fontSize:14,color:"var(--mu)"}}>Pradhan Mantri Fasal Bima Yojana covers crop loss due to natural disasters. We show which recommended crops are covered.</div>
          </div>
          <div style={{background:"#fff",borderRadius:10,padding:14}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>📊 Live Mandi Prices</div>
            <div style={{fontSize:14,color:"var(--mu)"}}>Real-time prices from data.gov.in Government API — district and state level filtering for Telangana markets.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
