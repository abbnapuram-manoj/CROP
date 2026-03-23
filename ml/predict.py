import sys, json, pickle, os
import numpy as np

BASE   = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(BASE,"models")

def load():
    def r(f): return pickle.load(open(os.path.join(MODELS,f),"rb"))
    def j(f): return json.load(open(os.path.join(MODELS,f)))
    return r("crop_model.pkl"),r("label_encoder.pkl"),j("rotation.json"),j("meta.json"),j("water.json"),j("pref_scores.json"),j("rythu_bandhu.json"),j("pmfby.json")

def soil_health(N,P,K,ph):
    ns = max(0,100-abs(N-100)*0.8)
    ps = max(0,100-abs(P-50)*1.2)
    ks = max(0,100-abs(K-50)*1.2)
    phs= max(0,100-abs(ph-7.0)*25)
    return round(min(100,ns*0.35+ps*0.25+ks*0.25+phs*0.15),1)

def npk_adequacy(N,P,K,crop):
    OPT={"Rice":(100,50,50),"Wheat":(125,65,50),"Maize":(100,55,45),
         "Chickpea":(28,60,35),"KidneyBeans":(35,65,45),"PigeonPeas":(28,65,35),
         "MothBeans":(20,35,20),"MungBean":(28,55,35),"Blackgram":(28,55,35),
         "Lentil":(20,55,35),"Pomegranate":(28,28,43),"Banana":(125,55,100),
         "Mango":(30,28,40),"Grapes":(30,28,40),"Watermelon":(100,40,50),
         "Muskmelon":(100,40,50),"Apple":(30,28,50),"Orange":(28,28,40),
         "Papaya":(70,40,50),"Coconut":(70,40,85),"Cotton":(130,65,55),"Jute":(90,55,50)}
    o=OPT.get(crop,(80,45,45))
    return {"N":round(min(100,(N/o[0])*100),1),"P":round(min(100,(P/o[1])*100),1),"K":round(min(100,(K/o[2])*100),1)}

def fert_reco(N,P,K,ph,crop):
    adq=npk_adequacy(N,P,K,crop)
    recs=[]
    if adq["N"]<70: recs.append(f"Apply Urea — Nitrogen deficiency ({adq['N']}% of optimal)")
    if adq["P"]<70: recs.append(f"Apply DAP — Phosphorus deficiency ({adq['P']}% of optimal)")
    if adq["K"]<70: recs.append(f"Apply MOP — Potassium deficiency ({adq['K']}% of optimal)")
    if ph<6.0: recs.append("Add agricultural lime to raise soil pH")
    elif ph>8.0: recs.append("Add gypsum or sulfur to lower soil pH")
    if not recs: recs.append("Soil nutrients are well-balanced for this crop ✅")
    return recs

def predict(inp):
    model,le,rotation,meta,water,pref_scores,rythu,pmfby = load()

    N=float(inp["N"]); P=float(inp["P"]); K=float(inp["K"]); ph=float(inp["ph"])
    temp=float(inp["temperature"]); hum=float(inp["humidity"]); rain=float(inp["rainfall"])
    prev=inp.get("previousCrop",""); pref=inp.get("preference","")
    water_avail=inp.get("waterAvailability","Medium")

    proba = model.predict_proba([[N,P,K,ph,temp,hum,rain]])[0].copy()

    # Preference boost (max 15%)
    for i,crop in enumerate(le.classes_):
        score = pref_scores.get(pref,{}).get(crop,0)
        proba[i] = min(1.0, proba[i] + score/100*0.15)

    # Water penalty
    wrank={"VeryLow":0,"Low":1,"Medium":2,"High":3}
    av=wrank.get(water_avail,2)
    for i,crop in enumerate(le.classes_):
        req=wrank.get(water.get(crop,"Medium"),2)
        if req>av: proba[i]=max(0,proba[i]-(req-av)*0.12)

    # Rotation — discourage repeating previous crop
    if prev in list(le.classes_):
        idx=list(le.classes_).index(prev)
        proba[idx]*=0.25

    proba/=proba.sum()
    top_idx=proba.argsort()[-3:][::-1]
    top3=[{"crop":le.classes_[i],"confidence":round(float(proba[i])*100,1)} for i in top_idx]
    best=top3[0]["crop"]

    sh=soil_health(N,P,K,ph)
    adq=npk_adequacy(N,P,K,best)
    fr=fert_reco(N,P,K,ph,best)

    return {
        "success":True,
        "topCrop":best,
        "confidence":top3[0]["confidence"],
        "top3":top3,
        "rotationSuggestions":rotation.get(best,[])[:3],
        "soilHealth":sh,
        "npkAdequacy":adq,
        "fertilizerRecommendation":fr,
        "waterRequirement":water.get(best,"Medium"),
        "rythuBandhu":best in rythu,
        "pmfbyCovered":best in pmfby,
        "modelAccuracy":meta["cv_accuracy"],
        "featureImportance":meta["feature_importance"],
    }

if __name__=="__main__":
    try:
        print(json.dumps(predict(json.loads(sys.argv[1]))))
    except Exception as e:
        print(json.dumps({"success":False,"error":str(e)}))
        sys.exit(1)
