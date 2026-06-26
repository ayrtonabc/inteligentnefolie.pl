import { NextRequest, NextResponse } from "next/server";

const NOW_PAYMENTS_API_KEY = process.env.NOW_PAYMENTS_API_KEY || "";

export async function GET(request: NextRequest) {
  if (!NOW_PAYMENTS_API_KEY) {
    return NextResponse.json(
      { error: "NOW_PAYMENTS_API_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch("https://api.nowpayments.io/v1/full-currencies", {
      method: "GET",
      headers: {
        "x-api-key": NOW_PAYMENTS_API_KEY,
        Accept: "application/json",
      },
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      let details: any = text;
      try {
        details = JSON.parse(text);
      } catch (_) {
        /* leave raw text */
      }
      return NextResponse.json(
        { error: "NowPayments API error", details },
        { status: res.status },
      );
    }

    const data = contentType.includes("application/json")
      ? JSON.parse(text)
      : { raw: text };
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("NowPayments currencies fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch currencies", details: String(err) },
      { status: 500 },
    );
  }
}
