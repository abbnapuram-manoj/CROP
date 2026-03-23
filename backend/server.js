require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json({limit:"10mb"}));

mongoose.connect(process.env.MONGODB_URI||"mongodb://localhost:27017/cropdb")
  .then(()=>console.log("✅ MongoDB connected"))
  .catch(()=>console.warn("⚠️  MongoDB not available"));

app.use("/api/predict", require("./routes/predict"));
app.use("/api/history", require("./routes/history"));

app.get("/api/community", async (req,res) => {
  try {
    const H = require("./models/History");
    const { district } = req.query;
    const match = district ? {district} : {};
    const stats = await H.aggregate([
      {$match:match},
      {$group:{_id:"$topCrop",count:{$sum:1}}},
      {$sort:{count:-1}},{$limit:6},
      {$project:{crop:"$_id",count:1,_id:0}}
    ]);
    res.json({success:true,data:stats,total:stats.reduce((a,s)=>a+s.count,0)});
  } catch { res.json({success:true,data:[],total:0}); }
});

app.get("/api/health",(req,res)=>res.json({status:"ok",version:"2.0"}));

const PORT = process.env.PORT||5000;
app.listen(PORT,()=>console.log(`🌾 CROP Backend → http://localhost:${PORT}`));
