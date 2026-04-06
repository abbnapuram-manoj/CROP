function recommendCrop(cropsData, userInput) {
    const { soil, rainfall, temperature, ph, mode } = userInput;
    let scores = cropsData.map(crop => {
        let score = 100;
        if (crop.soil_type && crop.soil_type.toLowerCase() !== soil.toLowerCase()) {
            score -= 30;
        }
        if (crop.water_need) {
            const waterDiff = Math.abs(rainfall - crop.water_need);
            score -= Math.min(20, waterDiff / 100);
        }
        if (crop.temp_min && crop.temp_max) {
            if (temperature < crop.temp_min || temperature > crop.temp_max) {
                score -= 25;
            }
        }
        if (crop.ph_min && crop.ph_max) {
            if (ph < crop.ph_min || ph > crop.ph_max) {
                score -= 20;
            }
        }
        if (mode === "pro" && crop.yield) {
            score += 10;
        }
        return {
            crop: crop.crop,
            score: Math.max(0, Math.min(100, score)),
            yield: crop.yield || "N/A",
            water: crop.water_need || "N/A",
            season: crop.season || "N/A",
            reasons: generateReasons(crop, userInput)
        };
    });
    return scores.sort((a, b) => b.score - a.score).slice(0, 5);
}

function generateReasons(crop, userInput) {
    const reasons = [];
    if (crop.soil_type) reasons.push(`Suitable for ${crop.soil_type} soil`);
    if (crop.water_need) {
        if (crop.water_need < 1000) {
            reasons.push("Low water requirement - drought resistant");
        } else if (crop.water_need > 1500) {
            reasons.push("High yield potential");
        }
    }
    if (crop.season) reasons.push(`Best grown in ${crop.season} season`);
    return reasons;
}

module.exports = { recommendCrop };