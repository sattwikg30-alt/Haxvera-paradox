import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authServer";
import connectDB from "@/lib/db";
import { Crop } from "@/lib/models/Crop";
import { getCoordinates, getWeatherData } from "@/lib/weather";

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all ACTIVE crops for this user
    const crops = await Crop.find({ userId: user.id, status: { $ne: "retired" } }).sort({ createdAt: -1 });

    const totalCrops = crops.length;

    // Average predicted yield (only from crops that have a prediction)
    const cropsWithYield = crops.filter((c) => c.predictedYield != null);
    const avgYield =
      cropsWithYield.length > 0
        ? parseFloat(
            (
              cropsWithYield.reduce((sum, c) => sum + (c.predictedYield ?? 0), 0) /
              cropsWithYield.length
            ).toFixed(2)
          )
        : null;

    // Overall risk level – prioritise the highest risk across crops
    const riskOrder: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
    };
    const dominantRisk = crops.reduce<string | null>((dominant, c) => {
      if (!c.riskLevel) return dominant;
      const key = c.riskLevel.toLowerCase();
      if (!dominant) return c.riskLevel;
      const currentOrder = riskOrder[key] ?? 0;
      const dominantOrder = riskOrder[dominant.toLowerCase()] ?? 0;
      return currentOrder > dominantOrder ? c.riskLevel : dominant;
    }, null);

    // Crop type distribution
    const cropTypeCounts: Record<string, number> = {};
    crops.forEach((c) => {
      const type = c.cropType || "Unknown";
      cropTypeCounts[type] = (cropTypeCounts[type] ?? 0) + 1;
    });
    const cropDistribution = Object.entries(cropTypeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / totalCrops) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Alerts – derive from real data
    const alerts: { id: number; message: string; severity: "high" | "medium" | "low" }[] = [];
    let alertId = 1;

    crops.forEach((crop) => {
      const risk = crop.riskLevel?.toLowerCase();
      if (risk === "high") {
        alerts.push({
          id: alertId++,
          message: `High risk detected for ${crop.cropType} at ${crop.location}`,
          severity: "high",
        });
      } else if (risk === "medium") {
        alerts.push({
          id: alertId++,
          message: `Medium risk on ${crop.cropType} – monitor closely`,
          severity: "medium",
        });
      }
    });

    // Weather – use the location of the most recent crop, or fallback to "Kolkata"
    const weatherLocation = crops[0]?.location ?? "Kolkata";
    let weather = null;

    try {
      const coords = await getCoordinates(weatherLocation);
      if (coords) {
        const weatherData = await getWeatherData(coords.lat, coords.lon);
        if (weatherData) {
          weather = {
            location: coords.name,
            temp: weatherData.temperature,
            rain: weatherData.rainfall,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            condition: weatherData.condition,
          };
        }
      }
    } catch {
      // Weather fetch failure is non-fatal – return null
    }

    // Yield snapshot – compare with previous month's average
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentCrops = cropsWithYield.filter(
      (c) => c.createdAt >= oneMonthAgo
    );
    const olderCrops = cropsWithYield.filter(
      (c) => c.createdAt < oneMonthAgo
    );

    const recentAvg =
      recentCrops.length > 0
        ? recentCrops.reduce((s, c) => s + (c.predictedYield ?? 0), 0) /
          recentCrops.length
        : null;
    const olderAvg =
      olderCrops.length > 0
        ? olderCrops.reduce((s, c) => s + (c.predictedYield ?? 0), 0) /
          olderCrops.length
        : null;

    let yieldChangePercent: number | null = null;
    if (recentAvg !== null && olderAvg !== null && olderAvg !== 0) {
      yieldChangePercent = parseFloat(
        (((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1)
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          totalCrops,
          avgYield,
          dominantRisk,
          cropDistribution,
          alerts,
          weather,
          yieldChangePercent,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(">>> Overview API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch overview data", error: error.message },
      { status: 500 }
    );
  }
}
