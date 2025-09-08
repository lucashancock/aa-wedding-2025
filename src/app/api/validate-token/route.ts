import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (token === "AAWEDDING2025" || token === process.env.MAGIC_TOKEN) {
    return NextResponse.json({ valid: true });
  } else {
    return NextResponse.json({ valid: false });
  }
}
