const express = require("express");
const router  = express.Router();
const { spawn } = require("child_process");
const path    = require("path");

const ML = path.join(__dirname,"../../ml/predict.py");
const PY = process.env.PYTHON_PATH || "python";

const CROP_MAP = {
  Rice:"Rice",Wheat:"Wheat",Maize:"Maize",Chickpea:"Gram",
  KidneyBeans:"Rajma",PigeonPeas:"Tur",MothBeans:"Moth",
  MungBean:"Moong",Blackgram:"Urad",Lentil:"Masur",
  Pomegranate:"Pomegranate",Banana:"Banana",Mango:"Mango",
  Grapes:"Grapes",Watermelon:"Watermelon",Muskmelon:"Muskmelon",
  Apple:"Apple",Orange:"Orange",Papaya:"Papaya",
  Coconut:"Coconut",Cotton:"Cotton",Jute:"Jute",
};

async function fetchMandiPrice(crop, state, district) {
  const KEY = process.env.DATAGOV_KEY;
  const commodity = CROP_MAP[crop];
  if (!commodity || !KEY) return null;

  const base = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${KEY}&format=json&limit=10&filters[commodity]=${encodeURIComponent(commodity)}`;

  const tryFetch = async (url) => {
    try {
      const r  = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const d  = await r.json();
      return (d.records||[]).map(rec=>({
        market:   rec.market        || "—",
        district: rec.district      || "—",
        state:    rec.state         || "—",
        min:      parseFloat(rec.min_price   || 0),
        max:      parseFloat(rec.max_price   || 0),
        modal:    parseFloat(rec.modal_price || 0),
        date:     rec.arrival_date  || "—",
      })).filter(r=>r.modal>0);
    } catch { return []; }
  };

  // Try district → state → national (in parallel where possible)
  let prices = [];
  if (state === "Telangana" || state === "Andhra Pradesh") {
    // Prioritise Telangana/AP districts
    if (district) prices = await tryFetch(base+`&filters[state.keyword]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}`);
    if (!prices.length) prices = await tryFetch(base+`&filters[state.keyword]=${encodeURIComponent(state)}`);
  }
  if (!prices.length && district) prices = await tryFetch(base+`&filters[district]=${encodeURIComponent(district)}`);
  if (!prices.length && state)    prices = await tryFetch(base+`&filters[state.keyword]=${encodeURIComponent(state)}`);
  if (!prices.length)             prices = await tryFetch(base);
  if (!prices.length) return null;

  const modals = prices.map(p=>p.modal);
  return {
    prices: prices.slice(0,5),
    avg:    Math.round(modals.reduce((a,b)=>a+b,0)/modals.length),
    min:    Math.min(...prices.map(p=>p.min)),
    max:    Math.max(...prices.map(p=>p.max)),
    count:  prices.length,
  };
}

function runML(inputData) {
  return new Promise((resolve, reject) => {
    let out="", err="";
    const py = spawn(PY, [ML, JSON.stringify(inputData)]);
    py.stdout.on("data", d=>out+=d.toString());
    py.stderr.on("data", d=>err+=d.toString());
    py.on("close", code=>{
      if (code!==0) return reject(new Error(err));
      try { resolve(JSON.parse(out.trim())); }
      catch(e) { reject(new Error("Parse error: "+out)); }
    });
  });
}

router.post("/", async (req,res) => {
  const { N,P,K,ph,temperature,humidity,rainfall,
          previousCrop,soilType,season,preference,
          waterAvailability,district,state,lat,lon,mode } = req.body;

  if ([N,P,K,ph,temperature,humidity,rainfall].some(v=>v===undefined||v===""))
    return res.status(400).json({success:false,error:"All soil/weather fields required."});

  try {
    // Run ML and fetch mandi price SIMULTANEOUSLY
    const [mlResult, mandiData] = await Promise.all([
      runML({N,P,K,ph,temperature,humidity,rainfall,
             previousCrop:previousCrop||"",
             preference:preference||"",
             waterAvailability:waterAvailability||"Medium"}),
      fetchMandiPrice(null, state||"", district||"") // will re-fetch after ML for correct crop
    ]);

    // Now fetch mandi for the actual recommended crop
    const mandiForCrop = await fetchMandiPrice(mlResult.topCrop, state||"", district||"");

    const result = {
      ...mlResult,
      mandi: mandiForCrop,
      inputs:{ N,P,K,ph,temperature,humidity,rainfall,
               previousCrop:previousCrop||"",soilType:soilType||"",
               season:season||"",preference:preference||"",
               waterAvailability:waterAvailability||"Medium",
               district:district||"",state:state||"",
               lat,lon,mode:mode||"simple" }
    };

    // Save to DB async — don't wait for it
    try {
      const History = require("../models/History");
      new History({
        inputs:result.inputs, topCrop:result.topCrop,
        confidence:result.confidence, top3:result.top3,
        rotationSuggestions:result.rotationSuggestions,
        soilHealth:result.soilHealth, npkAdequacy:result.npkAdequacy,
        fertilizerRecommendation:result.fertilizerRecommendation,
        waterRequirement:result.waterRequirement,
        rythuBandhu:result.rythuBandhu, pmfbyCovered:result.pmfbyCovered,
        district:district||"", state:state||"",
        preference:preference||"", mode:mode||"simple",
      }).save().catch(()=>{});
    } catch {}

    res.json(result);
  } catch(e) {
    res.status(500).json({success:false,error:e.message});
  }
});

module.exports = router;
