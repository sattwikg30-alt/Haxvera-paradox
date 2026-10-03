import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authServer";
import { getCoordinates, getWeatherData, WeatherData } from "@/lib/weather";

export async function POST(req: Request) {
  console.log(">>> Pipeline Stage: Prediction request received");

try {
    // 1. Auth check
const user = getUserFromRequest(req);
if (!user) {
return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

const body = await req.json();
    const { 
      crop, 
      location, 
      farmSize, 
      irrigation, 
      sowingMonth, 
      previousYield, 
      fertilizer, 
      seedVariety, 
      farmingType 
    } = body;

    // 2. Geocoding: Location -> Coordinates
    console.log(`>>> Pipeline Stage: Processing location: ${location}`);
    const coords = await getCoordinates(location);
    if (!coords) {
      console.warn(">>> Warning: Location not found, using fallback coordinates");
    } else {
      console.log(`>>> Pipeline Stage: Coordinates fetched: ${coords.lat}, ${coords.lon} (${coords.name}, ${coords.country})`);
    }

    // 3. Weather Fetching
    let weather: WeatherData | null = null;
    if (coords) {
      console.log(">>> Pipeline Stage: Fetching weather data...");
      weather = await getWeatherData(coords.lat, coords.lon);
    }

    if (weather) {
      console.log(">>> Pipeline Stage: Weather data fetched:", weather);
    } else {
      console.warn(">>> Warning: Weather fetch failed, using fallback averages");
      // Fallback dummy weather if API fails
      weather = {
        temperature: 28,
        rainfall: 5,
        humidity: 65,
        windSpeed: 12,
        condition: "Clear"
      };
    }

    // 4. Data Enrichment & Climate Indicators
    console.log(">>> Pipeline Stage: Enrichment complete");
    const rainfallStatus = weather.rainfall < 2 ? "Low" : weather.rainfall > 10 ? "High" : "Normal";
    const temperatureStatus = weather.temperature > 35 ? "Heat Stress" : weather.temperature < 15 ? "Cold" : "Favorable";
    const climateRisk = (rainfallStatus === "Low" && irrigation === "No") ? "High" : (rainfallStatus === "Low" || temperatureStatus === "Heat Stress") ? "Moderate" : "Low";

    // 5. Climate-Aware Prediction Logic (Simulation)
    console.log(">>> Pipeline Stage: Generating prediction...");
    let baseYield = 2.5; // ton/hectare
    
    // Rainfall effect
    if (rainfallStatus === "Low") baseYield -= 0.3;
    if (rainfallStatus === "High") baseYield += 0.1;

    // Irrigation effect
    if (irrigation === "Yes") baseYield += 0.4;

    // Temperature effect
    if (temperatureStatus === "Heat Stress") baseYield -= 0.4;
    if (temperatureStatus === "Favorable") baseYield += 0.2;

    // Farming type effect
    if (farmingType === "Chemical") baseYield += 0.2;
    if (farmingType === "Organic") baseYield -= 0.1; // Organic usually lower but premium

    const expectedYield = Math.round(baseYield * 10) / 10;
    const minYield = Math.round((expectedYield * 0.85) * 10) / 10;
    const maxYield = Math.round((expectedYield * 1.2) * 10) / 10;

    // 6. Factor Explanations
    const factors = [
      { name: "Rainfall", impact: rainfallStatus === "Normal" ? "Optimal" : `${rainfallStatus} rainfall detected` },
      { name: "Temperature", impact: temperatureStatus === "Favorable" ? "Favorable" : `Risk of ${temperatureStatus}` },
      { name: "Soil fertility", impact: "Good (Estimated)" },
      { name: "Irrigation", impact: irrigation === "Yes" ? "Available" : "Not utilized" }
    ];

    // 7. Smart Recommendations
    const recommendations = [];
    if (rainfallStatus === "Low") {
      recommendations.push({ text: "Increase irrigation frequency due to low rainfall", priority: "High" });
    }
    if (temperatureStatus === "Heat Stress") {
      recommendations.push({ text: "Apply mulching to retain soil moisture under heat", priority: "Medium" });
    }
    if (irrigation === "No" && rainfallStatus === "Low") {
      recommendations.push({ text: "Plan for supplementary irrigation sources immediately", priority: "High" });
    }
    recommendations.push({ text: "Monitor regional weather alerts daily", priority: "Medium" });
    if (farmingType === "Chemical") {
      recommendations.push({ text: "Consider partial organic transition for soil health", priority: "Low" });
    }

    // 8. ML-Ready Feature Vector (Preparation for FastAPI)
    const mlFeatures = {
      temp: weather.temperature,
      rain: weather.rainfall,
      hum: weather.humidity,
      size: parseFloat(farmSize),
      irrig: irrigation === "Yes" ? 1 : 0,
      prev: parseFloat(previousYield || "0"),
      crop_type: crop
    };

    console.log(">>> Pipeline Stage: Prediction generated successfully");

return NextResponse.json({
success: true,
prediction: {
        yield: expectedYield,
        range: { min: minYield, max: maxYield },
        risk: climateRisk,
        confidence: "Medium-High",
        weatherSummary: {
          temp: `${weather.temperature}°C`,
          rain: `${weather.rainfall}mm`,
          hum: `${weather.humidity}%`,
          cond: weather.condition
        },
        factors,
        recommendations,
        mlFeatures // Ready for next phase
}
}, { status: 200 });
  } catch (error: any) {
    console.error(">>> Pipeline Error:", error);
    return NextResponse.json({ 
      message: "Prediction failed", 
      error: error.message 
    }, { status: 500 });
}
}