import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = (await request.json()) as {
      filename: string;
      contentType: string;
    };

    // Validate inputs
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and contentType are required" },
        { status: 400 }
      );
    }

    // Construct a unique key (e.g. prefix + timestamp)
    const key = `uploads/${Date.now()}-${filename}`;

    const url = await getPresignedUploadUrl({ key, contentType });

    return NextResponse.json({
      uploadUrl: url,
      key,
    });
  } catch (error: any) {
    console.error("❌ Upload API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate upload URL", 
        details: error?.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
