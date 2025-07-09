// src/app/api/auth/login/route.ts
import { sequelize } from "@/lib/sequelize/connection";
import { User } from "@/lib/sequelize/initModels";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await sequelize.sync();
  const { email } = await request.json();

  try {
    const user = await User.findOne({ where: { email } });

    // Simple authentication - di production gunakan bcrypt!
    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }
    // return NextResponse.json(
    //   { success: false, error: "Invalid credentials" },
    //   { status: 401 }
    // );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
