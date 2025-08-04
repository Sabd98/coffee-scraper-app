// src/app/api/users/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { User } from "@/lib/sequelize/models/User.model";
import { syncModels } from "@/lib/sequelize/initModels";

// Solusi untuk GET
export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "ID not provided" }, { status: 400 });
  }

  await syncModels();
  const user = await User.findByPk(id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// Solusi untuk PUT
export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "ID not provided" }, { status: 400 });
  }

  await syncModels();
  const data = await request.json();

  const user = await User.findByPk(id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updatedUser = await user.update(data);
  return NextResponse.json(updatedUser);
}

// Solusi untuk DELETE
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "ID not provided" }, { status: 400 });
  }

  await syncModels();
  const user = await User.findByPk(id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await user.destroy();
  return NextResponse.json({ message: "User deleted successfully" });
}
