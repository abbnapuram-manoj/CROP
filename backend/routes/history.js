const express = require("express");
const router  = express.Router();

router.get("/", async (req,res) => {
  try {
    const H = require("../models/History");
    res.json({success:true,data:await H.find().sort({createdAt:-1}).limit(50)});
  } catch { res.json({success:true,data:[]}); }
});

router.delete("/all", async (req,res) => {
  try { const H=require("../models/History"); await H.deleteMany({}); } catch {}
  res.json({success:true});
});

router.delete("/:id", async (req,res) => {
  try { const H=require("../models/History"); await H.findByIdAndDelete(req.params.id); } catch {}
  res.json({success:true});
});

module.exports = router;
