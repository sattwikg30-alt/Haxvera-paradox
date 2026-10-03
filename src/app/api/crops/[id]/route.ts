import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authServer";
import connectDB from "@/lib/db";
import { Crop } from "@/lib/models/Crop";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const crop = await Crop.findById(params.id);

    if (!crop) {
      return NextResponse.json({ message: "Crop not found" }, { status: 404 });
    }

    // Security check: ensure the user asking for it actually owns it
    if (crop.userId !== user.id) {
       return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, crop }, { status: 200 });
  } catch (error: any) {
    console.error(">>> Fetch Single Crop Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch crop details.", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await connectDB();

    const crop = await Crop.findById(params.id);

    if (!crop) {
      return NextResponse.json({ message: "Crop not found" }, { status: 404 });
    }

    if (crop.userId !== user.id) {
       return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (body.status === "retired" || body.status === "active") {
       var updatedCrop = await Crop.findByIdAndUpdate(
         params.id, 
         { $set: { status: body.status } }, 
         { new: true, strict: false }
       );
       return NextResponse.json({ success: true, crop: updatedCrop }, { status: 200 });
    }

    return NextResponse.json({ success: true, crop }, { status: 200 });
  } catch (error: any) {
    console.error(">>> Update Crop Error:", error);
    return NextResponse.json(
      { message: "Failed to update crop details.", error: error.message },
      { status: 500 }
    );
  }
}
