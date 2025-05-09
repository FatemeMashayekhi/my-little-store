import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt";
import { AuthPayload } from "@/models/authModels";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    const payload = verifyRefreshToken(token) as AuthPayload;
    const newAccessToken = generateAccessToken({
      id: payload.id,
      username: payload.username,
    });

    return NextResponse.json({ accessToken: newAccessToken });
  } catch {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 403 }
    );
  }
}
