import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authServer";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(request: Request) {
  try {
    // 1. Verify token server-side
    const decoded = getUserFromRequest(request);
    
    if (!decoded) {
      return NextResponse.json(
        { message: "Unauthorized. Please provide a valid token." },
        { status: 401 }
      );
    }

    // 2. Connect to DB
    await connectDB();

    // 3. Fetch user details
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    // 4. Return protected data
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        farmSize: user.farmSize,
      }
    });
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}