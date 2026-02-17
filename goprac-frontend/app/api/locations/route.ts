import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const [rows] = await db.query(
      `SELECT id, cityName FROM locations WHERE id NOT IN (512,518,513,516,514,515,517,519) ORDER BY cityName ASC;`
    );
    return NextResponse.json(rows || []);
  } catch (err) {
    console.error("Error fetching locations:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 