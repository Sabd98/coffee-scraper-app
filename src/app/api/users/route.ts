import { NextResponse } from "next/server";
import {User} from "@/lib/sequelize/models/User.model";
import { syncModels } from "@/lib/sequelize/initModels";

export async function GET() {
  await syncModels();
  const users = await User.findAll();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  const user = await User.create(data);
  return NextResponse.json(user, { status: 201 });
}
