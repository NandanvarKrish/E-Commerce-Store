import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    uptime: process.uptime(),
    services: {
      web: "up",
      database: "configured",
    },
  });
}
