import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score
import pickle, json, os

np.random.seed(42)

CROPS = ["Rice","Wheat","Maize","Chickpea","KidneyBeans","PigeonPeas",
         "MothBeans","MungBean","Blackgram","Lentil","Pomegranate","Banana",
         "Mango","Grapes","Watermelon","Muskmelon","Apple","Orange","Papaya",
         "Coconut","Cotton","Jute"]

CROP_PARAMS = {
    "Rice":        dict(N=(80,120), P=(40,60), K=(40,60), ph=(5.5,6.5), temp=(22,32), hum=(80,95), rain=(150,300)),
    "Wheat":       dict(N=(100,150),P=(50,80), K=(40,60), ph=(6.0,7.5), temp=(10,22), hum=(50,70), rain=(50,100)),
    "Maize":       dict(N=(80,120), P=(40,70), K=(30,60), ph=(5.8,7.0), temp=(18,30), hum=(55,80), rain=(60,110)),
    "Chickpea":    dict(N=(15,40),  P=(40,80), K=(20,50), ph=(6.0,8.0), temp=(15,25), hum=(35,65), rain=(40,75)),
    "KidneyBeans": dict(N=(20,50),  P=(50,80), K=(30,60), ph=(6.0,7.5), temp=(16,26), hum=(45,70), rain=(60,100)),
    "PigeonPeas":  dict(N=(15,40),  P=(50,80), K=(20,50), ph=(5.5,7.0), temp=(20,32), hum=(45,70), rain=(60,100)),
    "MothBeans":   dict(N=(10,30),  P=(20,50), K=(10,30), ph=(5.5,7.0), temp=(26,38), hum=(25,50), rain=(25,60)),
    "MungBean":    dict(N=(15,40),  P=(40,70), K=(20,50), ph=(6.0,7.5), temp=(22,32), hum=(55,80), rain=(50,90)),
    "Blackgram":   dict(N=(15,40),  P=(40,70), K=(20,50), ph=(5.5,7.0), temp=(22,32), hum=(60,85), rain=(60,100)),
    "Lentil":      dict(N=(10,30),  P=(40,70), K=(20,50), ph=(6.0,8.0), temp=(14,24), hum=(35,60), rain=(30,65)),
    "Pomegranate": dict(N=(15,40),  P=(15,40), K=(25,60), ph=(5.5,7.5), temp=(25,38), hum=(25,55), rain=(45,90)),
    "Banana":      dict(N=(100,150),P=(40,70), K=(80,120),ph=(5.5,7.0), temp=(22,35), hum=(65,95), rain=(100,200)),
    "Mango":       dict(N=(15,45),  P=(15,40), K=(25,55), ph=(5.5,7.5), temp=(24,36), hum=(40,70), rain=(60,100)),
    "Grapes":      dict(N=(15,45),  P=(15,40), K=(25,55), ph=(5.5,7.0), temp=(20,32), hum=(50,80), rain=(50,90)),
    "Watermelon":  dict(N=(80,120), P=(25,55), K=(35,65), ph=(6.0,7.5), temp=(26,36), hum=(45,70), rain=(40,75)),
    "Muskmelon":   dict(N=(80,120), P=(25,55), K=(35,65), ph=(6.0,7.5), temp=(26,36), hum=(45,70), rain=(40,75)),
    "Apple":       dict(N=(15,45),  P=(15,40), K=(35,65), ph=(5.5,6.5), temp=(5,20),  hum=(35,60), rain=(60,100)),
    "Orange":      dict(N=(15,40),  P=(15,40), K=(25,55), ph=(6.0,7.5), temp=(20,32), hum=(40,70), rain=(60,100)),
    "Papaya":      dict(N=(50,90),  P=(25,55), K=(35,65), ph=(6.0,7.5), temp=(22,33), hum=(60,85), rain=(80,150)),
    "Coconut":     dict(N=(50,90),  P=(25,55), K=(60,110),ph=(5.0,8.0), temp=(22,32), hum=(70,95), rain=(100,200)),
    "Cotton":      dict(N=(100,160),P=(50,80), K=(40,70), ph=(6.0,8.0), temp=(26,38), hum=(45,70), rain=(60,110)),
    "Jute":        dict(N=(70,110), P=(40,70), K=(35,65), ph=(6.0,7.5), temp=(24,36), hum=(70,95), rain=(150,230)),
}

ROTATION = {
    "Rice":["Wheat","Lentil","Chickpea","MungBean"],
    "Wheat":["Rice","Maize","Chickpea","Lentil"],
    "Maize":["Wheat","Chickpea","Lentil","MungBean"],
    "Chickpea":["Wheat","Rice","Maize","Cotton"],
    "KidneyBeans":["Maize","Wheat","Rice","Chickpea"],
    "PigeonPeas":["Maize","Rice","Wheat","Chickpea"],
    "MothBeans":["Maize","Wheat","Rice","Chickpea"],
    "MungBean":["Rice","Wheat","Maize","Cotton"],
    "Blackgram":["Rice","Maize","Wheat","Chickpea"],
    "Lentil":["Wheat","Rice","Maize","Chickpea"],
    "Pomegranate":["Wheat","Chickpea","Lentil","MungBean"],
    "Banana":["Rice","Maize","Wheat","PigeonPeas"],
    "Mango":["Wheat","Chickpea","Maize","Lentil"],
    "Grapes":["Wheat","Maize","Chickpea","Lentil"],
    "Watermelon":["Maize","Wheat","Rice","Chickpea"],
    "Muskmelon":["Maize","Wheat","Rice","Chickpea"],
    "Apple":["Wheat","Maize","Chickpea","Lentil"],
    "Orange":["Wheat","Maize","Chickpea","Lentil"],
    "Papaya":["Maize","Rice","Wheat","MungBean"],
    "Coconut":["Rice","Maize","Blackgram","MungBean"],
    "Cotton":["Wheat","Chickpea","Maize","MungBean"],
    "Jute":["Rice","Wheat","Maize","Lentil"],
}

WATER = {
    "Rice":"High","Wheat":"Medium","Maize":"Medium","Chickpea":"Low",
    "KidneyBeans":"Medium","PigeonPeas":"Low","MothBeans":"VeryLow",
    "MungBean":"Low","Blackgram":"Low","Lentil":"Low","Pomegranate":"Low",
    "Banana":"High","Mango":"Medium","Grapes":"Medium","Watermelon":"Medium",
    "Muskmelon":"Medium","Apple":"Medium","Orange":"Medium","Papaya":"Medium",
    "Coconut":"High","Cotton":"Medium","Jute":"High",
}

PREF_SCORES = {
    "profit":   {"Cotton":10,"Pomegranate":9,"Apple":9,"Grapes":8,"Mango":8,"MungBean":7,"Chickpea":6},
    "yield":    {"Rice":10,"Wheat":9,"Maize":9,"Banana":8,"Coconut":7,"Jute":6},
    "lowWater": {"MothBeans":10,"Chickpea":9,"Lentil":9,"Pomegranate":8,"Muskmelon":7},
    "pestFree": {"Lentil":10,"MungBean":9,"Blackgram":8,"Chickpea":8,"PigeonPeas":7},
    "quickCycle":{"MungBean":10,"Maize":9,"Watermelon":8,"Muskmelon":8},
    "organic":  {"MungBean":10,"Lentil":9,"Chickpea":9,"Blackgram":8},
    "export":   {"Cotton":10,"Mango":9,"Grapes":9,"Pomegranate":8,"Rice":7},
}

# Telangana Rythu Bandhu eligible crops
RYTHU_BANDHU = ["Rice","Cotton","Maize","Groundnut","Soybean","Sunflower","Jowar","Bajra"]
PMFBY_CROPS  = ["Rice","Wheat","Maize","Chickpea","Lentil","MungBean","Blackgram","Cotton","Jute","Groundnut"]

def gen(n=500):
    rows=[]
    for crop,p in CROP_PARAMS.items():
        for _ in range(n):
            r={
                "N":  np.clip(np.random.normal((p["N"][0]+p["N"][1])/2,  (p["N"][1]-p["N"][0])/4),  0,200),
                "P":  np.clip(np.random.normal((p["P"][0]+p["P"][1])/2,  (p["P"][1]-p["P"][0])/4),  0,200),
                "K":  np.clip(np.random.normal((p["K"][0]+p["K"][1])/2,  (p["K"][1]-p["K"][0])/4),  0,200),
                "ph": np.clip(np.random.normal((p["ph"][0]+p["ph"][1])/2,(p["ph"][1]-p["ph"][0])/6), 3.5,10),
                "temperature":np.clip(np.random.normal((p["temp"][0]+p["temp"][1])/2,(p["temp"][1]-p["temp"][0])/4),0,50),
                "humidity":   np.clip(np.random.normal((p["hum"][0]+p["hum"][1])/2, (p["hum"][1]-p["hum"][0])/4),0,100),
                "rainfall":   np.clip(np.random.normal((p["rain"][0]+p["rain"][1])/2,(p["rain"][1]-p["rain"][0])/4),0,500),
                "label":crop
            }
            rows.append(r)
    return pd.DataFrame(rows)

print("Generating 11,000 samples...")
df = gen(500)
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df["label_enc"] = le.fit_transform(df["label"])
FEATURES = ["N","P","K","ph","temperature","humidity","rainfall"]
X,y = df[FEATURES], df["label_enc"]
Xtr,Xte,ytr,yte = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)

print("Training Random Forest (200 trees)...")
model = RandomForestClassifier(n_estimators=200,min_samples_leaf=2,max_features="sqrt",
                                random_state=42,n_jobs=-1,class_weight="balanced")
model.fit(Xtr,ytr)
acc = accuracy_score(yte,model.predict(Xte))
cv  = cross_val_score(model,X,y,cv=5).mean()
print(f"Test: {acc*100:.2f}%  CV: {cv*100:.2f}%")

os.makedirs("models",exist_ok=True)
with open("models/crop_model.pkl","wb") as f: pickle.dump(model,f)
with open("models/label_encoder.pkl","wb") as f: pickle.dump(le,f)
with open("models/rotation.json","w") as f: json.dump(ROTATION,f,indent=2)
with open("models/water.json","w") as f: json.dump(WATER,f,indent=2)
with open("models/pref_scores.json","w") as f: json.dump(PREF_SCORES,f,indent=2)
with open("models/rythu_bandhu.json","w") as f: json.dump(RYTHU_BANDHU,f)
with open("models/pmfby.json","w") as f: json.dump(PMFBY_CROPS,f)
with open("models/meta.json","w") as f:
    json.dump({"accuracy":round(acc*100,2),"cv_accuracy":round(cv*100,2),
               "features":FEATURES,"crops":CROPS,
               "feature_importance":dict(zip(FEATURES,model.feature_importances_.tolist())),
               "training_samples":len(df)},f,indent=2)
print("Model saved!")
