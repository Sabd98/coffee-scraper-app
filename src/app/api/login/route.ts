// login API route for user authentication
import { sequelize, User } from "@/lib/sequelize/initModels";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/jwt";
import { axiosErrorHandler } from "@/lib/axiosErrorHandler";

export async function POST(request: Request) {
  await sequelize.sync();

  const { email, password } = await request.json();
  console.log("Login attempt:", { email, password }); // Tambah log

  try {
    const user = await User.findOne({ where: { email } });
    console.log("User found:", user); // Tambah log

    if (!user) {
      console.log("User not found for email:", email); // Tambah log
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid); // Tambah log

    if (!isPasswordValid) {
      console.log("Password mismatch for user:", email); // Tambah log
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Kembalikan token di response body (TIDAK di cookie)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    const errorMessage = axiosErrorHandler(error);
    return NextResponse.json(
      { success: false, error: errorMessage || "Login failed" },
      { status: 500 }
    );
  }
}
