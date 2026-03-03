import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") ?? "BS News";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "#0f172a",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#60a5fa",
            marginBottom: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          BS News
        </div>
        <div
          style={{
            fontSize: title.length > 80 ? 36 : 48,
            fontWeight: 700,
            color: "#f8fafc",
            lineHeight: 1.2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
