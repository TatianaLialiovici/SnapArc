import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const contractFilePath = path.join(process.cwd(), "data", "contract.json");

export async function GET() {
  try {
    const raw = await readFile(contractFilePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read contract configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { address: string | null };
    const address = body.address && body.address.startsWith("0x") ? body.address : null;
    const payload = JSON.stringify({ address }, null, 2);
    await writeFile(contractFilePath, payload, "utf-8");
    return NextResponse.json({ address });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save contract address" },
      { status: 500 }
    );
  }
}
