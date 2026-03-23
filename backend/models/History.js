const mongoose = require("mongoose");
const S = new mongoose.Schema({
  inputs:Object, topCrop:String, confidence:Number,
  top3:[{crop:String,confidence:Number}],
  rotationSuggestions:[String], soilHealth:Number,
  npkAdequacy:Object, fertilizerRecommendation:[String],
  waterRequirement:String, rythuBandhu:Boolean, pmfbyCovered:Boolean,
  district:{type:String,default:""}, state:{type:String,default:""},
  preference:{type:String,default:""}, mode:{type:String,default:"simple"},
},{timestamps:true});
module.exports = mongoose.model("History",S);
