import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/lib/sequelize/connection";
import {User} from "@/lib/sequelize/models/User.model";
import { verifyToken } from "@/lib/jwt";
import { axiosErrorHandler } from "@/lib/axiosErrorHandler";

export async function GET(request: NextRequest) {
  try {
    // 1. Log semua headers yang diterima
    console.log("Headers:", Object.fromEntries(request.headers.entries()));

    // 2. Ambil dan log Authorization header
    const authHeader = request.headers.get("Authorization");
    console.log("Authorization header:", authHeader);

    if (!authHeader) {
      console.error("Authorization header not found");
      return NextResponse.json(
        { success: false, error: "Authorization header missing" },
        { status: 401 }
      );
    }

    // 3. Ambil dan log token dari header
    const token = authHeader.split(" ")[1]; // Format: Bearer <token>
    console.log("Token dari header:", token);

    if (!token) {
      console.error("Token not found in Authorization header");
      return NextResponse.json(
        { success: false, error: "Token not found" },
        { status: 401 }
      );
    }

    // 4. Verifikasi token dan log hasilnya
    const decoded = verifyToken(token);
    console.log("Decoded JWT:", decoded);

    if (!decoded) {
      console.error("Token verification failed");
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // 5. Log userId yang didapat dari token
    console.log("UserId dari token:", decoded.userId);

    await sequelize.sync();
    const user = await User.findByPk(decoded.userId, {
      attributes: ["id", "name", "email"],
    });

    // 6. Log hasil pencarian user
    console.log("User dari DB:", user);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    const errorMessage = axiosErrorHandler(error);
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage || "Server error" },
      { status: 500 }
    );
  }
}