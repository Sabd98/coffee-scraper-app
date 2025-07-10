// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { User } from "@/lib/sequelize/models/User.model";
import { syncModels } from "@/lib/sequelize/initModels";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await syncModels();
  const user = await User.findByPk(params.id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await syncModels();
  const data = await request.json();

  const user = await User.findByPk(params.id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updatedUser = await user.update(data);
  return NextResponse.json(updatedUser);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await syncModels();
  const user = await User.findByPk(params.id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await user.destroy();
  return NextResponse.json({ message: "User deleted successfully" });
}
