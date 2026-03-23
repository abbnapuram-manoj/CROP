export const CROPS = [
  { en:"Rice",        te:"వరి",              hi:"चावल",   emoji:"🌾", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice.jpg/480px-White_rice.jpg" },
  { en:"Wheat",       te:"గోధుమ",            hi:"गेहूं",  emoji:"🌾", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Campowheat.jpg/480px-Campowheat.jpg" },
  { en:"Maize",       te:"మొక్కజొన్న",      hi:"मक्का",  emoji:"🌽", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Corncobs.jpg/480px-Corncobs.jpg" },
  { en:"Chickpea",    te:"శనగలు",            hi:"चना",    emoji:"🫘", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Chickpeas.jpg/480px-Chickpeas.jpg" },
  { en:"KidneyBeans", te:"రాజ్మా",           hi:"राजमा",  emoji:"🫘", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Bean_koala.jpg/480px-Bean_koala.jpg" },
  { en:"PigeonPeas",  te:"కందులు",           hi:"अरहर",   emoji:"🫛", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/PigeonpeaFlower.jpg/480px-PigeonpeaFlower.jpg" },
  { en:"MothBeans",   te:"మొత్తు బీన్స్",    hi:"मोठ",   emoji:"🫘", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Moth_bean_close.jpg/480px-Moth_bean_close.jpg" },
  { en:"MungBean",    te:"పెసలు",            hi:"मूंग",   emoji:"🫘", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mung_bean_sprouts.jpg/480px-Mung_bean_sprouts.jpg" },
  { en:"Blackgram",   te:"మినుములు",         hi:"उड़द",   emoji:"🫘", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Urad_beans.jpg/480px-Urad_beans.jpg" },
  { en:"Lentil",      te:"కందిపప్పు",        hi:"मसूर",  emoji:"🫘", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Red_Lentil.jpg/480px-Red_Lentil.jpg" },
  { en:"Pomegranate", te:"దానిమ్మ",          hi:"अनार",  emoji:"🍎", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pomegranate_fruit_-_whole_and_broken_sections.jpg/480px-Pomegranate_fruit_-_whole_and_broken_sections.jpg" },
  { en:"Banana",      te:"అరటి",             hi:"केला",  emoji:"🍌", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Platano.jpg/480px-Banana-Platano.jpg" },
  { en:"Mango",       te:"మామిడి",           hi:"आम",    emoji:"🥭", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hapus_Mango.jpg/480px-Hapus_Mango.jpg" },
  { en:"Grapes",      te:"ద్రాక్ష",          hi:"अंगूर", emoji:"🍇", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Table_grapes_on_the_vine.jpg/480px-Table_grapes_on_the_vine.jpg" },
  { en:"Watermelon",  te:"పుచ్చకాయ",        hi:"तरबूज",  emoji:"🍉", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Watermelon_seedless.jpg/480px-Watermelon_seedless.jpg" },
  { en:"Muskmelon",   te:"ఖర్బూజా",         hi:"खरबूजा", emoji:"🍈", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Muskmelon.jpg/480px-Muskmelon.jpg" },
  { en:"Apple",       te:"ఆపిల్",            hi:"सेब",   emoji:"🍎", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/480px-Red_Apple.jpg" },
  { en:"Orange",      te:"నారింజ",           hi:"संतरा",  emoji:"🍊", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Oranges_and_orange_juice.jpg/480px-Oranges_and_orange_juice.jpg" },
  { en:"Papaya",      te:"బొప్పాయి",         hi:"पपीता",  emoji:"🍐", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Papaya_and_cross_section.jpg/480px-Papaya_and_cross_section.jpg" },
  { en:"Coconut",     te:"కొబ్బరి",          hi:"नारियल", emoji:"🥥", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Coconut_nut.jpg/480px-Coconut_nut.jpg" },
  { en:"Cotton",      te:"పత్తి",            hi:"कपास",  emoji:"🌿", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Cotton_field_at_sunset_bengin.jpg/480px-Cotton_field_at_sunset_bengin.jpg" },
  { en:"Jute",        te:"జనపనార",           hi:"जूट",   emoji:"🌿", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Jute_field.jpg/480px-Jute_field.jpg" },
];

export const getCrop = (en) => CROPS.find(c=>c.en===en) || {en,te:en,hi:en,emoji:"🌱",img:""};

// Real soil from SoilGrids ISRIC — coordinate based, no key needed
export async function detectSoilFromCoords(lat,lon) {
  try {
    const props = ["clay","sand","phh2o","nitrogen","soc"];
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&${props.map(p=>"property="+p).join("&")}&depth=0-5cm&value=mean`;
    const res = await fetch(url, {signal:AbortSignal.timeout(10000)});
    if (!res.ok) throw new Error("SoilGrids unavailable");
    const data = await res.json();
    const layers = data?.properties?.layers || [];
    let clay=30,sand=30,ph=6.5,nitrogen=100,soc=10;
    layers.forEach(l=>{
      const v = l.depths?.[0]?.values?.mean;
      if (v==null) return;
      if (l.name==="clay")     clay     = v/10;
      if (l.name==="sand")     sand     = v/10;
      if (l.name==="phh2o")    ph       = v/10;
      if (l.name==="nitrogen") nitrogen = v/100;
      if (l.name==="soc")      soc      = v/10;
    });
    // USDA soil texture classification
    let type="Loamy";
    if (clay>40)                    type="Black";
    else if (sand>65)               type="Sandy";
    else if (clay<20&&sand>50)      type="Red";
    else                            type="Loamy";

    const N_est = Math.min(150, Math.round(nitrogen*10));
    const P_est = Math.min(80,  Math.round(20+soc*2));
    const K_est = Math.min(100, Math.round(30+clay*0.5));
    return {type, ph:Math.round(ph*10)/10, clay, sand, N_est, P_est, K_est, confidence:"High", source:"SoilGrids (ISRIC)"};
  } catch {
    return null;
  }
}

// MobileNet-based soil image analysis using TensorFlow.js
export async function analyzeSoilImage(imageElement) {
  try {
    if (!window.mobilenet) throw new Error("MobileNet not loaded");
    const model = await window.mobilenet.load();
    const predictions = await model.classify(imageElement, 5);

    // Map MobileNet predictions to soil types using keyword matching
    const allLabels = predictions.map(p=>p.className.toLowerCase()).join(" ");
    let type="Loamy", confidence="Medium";

    if (allLabels.includes("black")||allLabels.includes("dark")||allLabels.includes("peat")||allLabels.includes("volcanic")) {
      type="Black"; confidence="High";
    } else if (allLabels.includes("red")||allLabels.includes("clay")||allLabels.includes("terracotta")||allLabels.includes("brick")) {
      type="Red"; confidence="High";
    } else if (allLabels.includes("sand")||allLabels.includes("beach")||allLabels.includes("desert")||allLabels.includes("dune")) {
      type="Sandy"; confidence="High";
    } else {
      // Fallback: pixel color analysis
      const canvas = document.createElement("canvas");
      canvas.width=50; canvas.height=50;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageElement,0,0,50,50);
      const px = ctx.getImageData(0,0,50,50).data;
      let r=0,g=0,b=0,n=0;
      for(let i=0;i<px.length;i+=4){r+=px[i];g+=px[i+1];b+=px[i+2];n++;}
      r/=n;g/=n;b/=n;
      const brightness=(r+g+b)/3;
      if(brightness<80)               {type="Black";confidence="Medium";}
      else if(r>g+30&&r>b+20)         {type="Red";  confidence="Medium";}
      else if(brightness>180&&g>r)    {type="Sandy";confidence="Low";}
      else                            {type="Loamy";confidence="Low";}
    }
    return {type, confidence, predictions};
  } catch(e) {
    return null;
  }
}

export function detectSeason() {
  const m = new Date().getMonth()+1;
  if(m>=6&&m<=10) return {key:"Kharif",label:"Kharif (Jun–Oct)",icon:"🌧"};
  if(m>=11||m<=3) return {key:"Rabi",  label:"Rabi (Nov–Mar)",  icon:"❄️"};
  return               {key:"Zaid",  label:"Zaid (Mar–Jun)",  icon:"☀️"};
}

export function getSoilNPK(soilType, soilData=null) {
  if (soilData?.N_est) {
    const v = x => +(x*(0.9+Math.random()*0.2)).toFixed(1);
    return {N:v(soilData.N_est),P:v(soilData.P_est),K:v(soilData.K_est),ph:soilData.ph||6.5};
  }
  const base={Black:{N:105,P:52,K:58,ph:7.8},Red:{N:62,P:32,K:42,ph:6.0},Sandy:{N:46,P:23,K:32,ph:6.5},Loamy:{N:92,P:44,K:54,ph:6.8}}[soilType]||{N:72,P:36,K:46,ph:6.5};
  const v = x => +(x*(0.88+Math.random()*0.24)).toFixed(1);
  return {N:v(base.N),P:v(base.P),K:v(base.K),ph:v(base.ph)};
}

// Telangana specific info
export const RYTHU_BANDHU_CROPS = ["Rice","Cotton","Maize","Groundnut","Soybean","Sunflower"];
export const PMFBY_CROPS = ["Rice","Wheat","Maize","Chickpea","Lentil","MungBean","Blackgram","Cotton","Jute"];

export const STATE_SOIL = {
  "Telangana":"Black","Andhra Pradesh":"Black","Maharashtra":"Black",
  "Madhya Pradesh":"Black","Gujarat":"Black","Karnataka":"Red",
  "Tamil Nadu":"Red","Odisha":"Red","Rajasthan":"Sandy",
  "Haryana":"Sandy","Punjab":"Loamy","Uttar Pradesh":"Loamy",
  "Bihar":"Loamy","West Bengal":"Loamy",
};
