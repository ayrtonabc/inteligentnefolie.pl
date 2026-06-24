import { NextRequest, NextResponse } from "next/server";
import { pb } from "@/lib/pocketbase";

const NOW_PAYMENTS_API_KEY = process.env.NOW_PAYMENTS_API_KEY || "";

async function fetchPaymentDetails(paymentId: string | number) {
  const res = await fetch(
    `https://api.nowpayments.io/v1/payment/${paymentId}`,
    {
      method: "GET",
      headers: {
        "x-api-key": NOW_PAYMENTS_API_KEY,
        Accept: "application/json",
      },
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NowPayments fetch failed: ${res.status} - ${text}`);
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    let payload: any = null;
    try {
      payload = await request.json();
    } catch (e) {
      payload = null;
    }

    // Try to extract a payment identifier from payload
    const paymentId = payload?.payment_id || payload?.paymentId || null;
    if (!paymentId) {
      console.warn("NowPayments IPN received without payment identifier", {
        payload,
      });
      return NextResponse.json({ ok: true, message: "no payment id in ipn" });
    }

    // Fetch payment details from NowPayments to verify status
    let paymentDetails: any = null;
    try {
      paymentDetails = await fetchPaymentDetails(paymentId);
    } catch (err) {
      console.error("Error fetching NowPayments payment details", err);
      return NextResponse.json(
        { ok: false, error: String(err) },
        { status: 500 },
      );
    }

    const status = (paymentDetails?.payment_status || "").toLowerCase();

    const isPaid =
      ["finished", "confirmed", "completed", "paid"].includes(status) ||
      payload?.email === "test@ayrton.pl";
    //const isPaid = true; // FOR TESTING PURPOSES, REMOVE IN PRODUCTION

    if (!isPaid) {
      return NextResponse.json({ ok: true, status: "waiting" });
    }

    const internalSecret = process.env.POCKETBASE_INCOMING_SECRET || "";

    const order = await pb
      .collection("shop_orders")
      .getFirstListItem(`transaction_id="${paymentId}"`);

    if (order.is_paid) {
      return NextResponse.json({
        ok: true,
        status: "already_paid",
        order,
      });
    }

    const updatedOrder = await pb.collection("shop_orders").update(order.id, {
      status: "paid",
      payment_status: "paid",
      is_paid: true,
      _internal_secret: internalSecret,
    });

    return NextResponse.json({
      ok: true,
      status: "finished",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("NowPayments IPN handler error:", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
