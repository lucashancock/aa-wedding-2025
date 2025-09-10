import { NextRequest, NextResponse } from "next/server";
import { getPlaiceholder } from "plaiceholder";

export async function POST(request: NextRequest) {
  const arrayBuffer = await request.arrayBuffer(); // get ArrayBuffer from request
  const buffer = Buffer.from(arrayBuffer); // convert to Node.js Buffer

  const { base64 } = await getPlaiceholder(buffer, { size: 16 });

  return NextResponse.json({ base64 });
}
