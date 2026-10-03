import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authServer";
import connectDB from "@/lib/db";
import { Crop } from "@/lib/models/Crop";

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    
    // Auth Check
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await connectDB();

    // Flat mapping — accepts direct form + ML result fields
    const newCrop = new Crop({
      userId: user.id,
      cropType: body.cropType,
      location: body.location,
      farmSize: body.farmSize,
      sowingMonth: body.sowingMonth,

      // Optional extra inputs
      irrigationType: body.irrigationType,
      irrigationFrequency: body.irrigationFrequency,
      fertilizer: body.fertilizer,
      pesticide: body.pesticide,
      seedVariety: body.seedVariety,
      farmingType: body.farmingType,

      // Flat ML prediction outputs
      predictedYield: body.predictedYield,
      yieldRange: body.yieldMin != null && body.yieldMax != null
        ? { min: body.yieldMin, max: body.yieldMax }
        : undefined,
      riskLevel: body.riskLevel,
      confidence: body.confidence,

      // Weather snapshot at prediction time
      weather: body.weatherTemp != null
        ? {
            temperature: String(body.weatherTemp),
            rainfall: String(body.weatherRain ?? 0),
            humidity: String(body.weatherHumidity ?? 0),
          }
        : undefined,
    });

    const savedCrop = await newCrop.save();

    return NextResponse.json(
      { success: true, cropId: savedCrop._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(">>> Crop Save Error:", error);
    return NextResponse.json(
      { message: "Failed to save crop data", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch crops belonging to the user
    // Sort by createdAt descending (newest first)
    const crops = await Crop.find({ userId: user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, crops }, { status: 200 });
  } catch (error: any) {
    console.error(">>> Fetch Crops Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch crop data", error: error.message },
      { status: 500 }
    );
  }
}
