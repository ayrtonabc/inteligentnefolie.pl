import { NextRequest, NextResponse } from "next/server";
import { CartItem, CheckoutRequest, generateOrderId } from "../route";
import { pb, TENANT_ID } from "@/lib/pocketbase";

const NOW_PAYMENTS_API_KEY = process.env.NOW_PAYMENTS_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, customerEmail, customerName, totalCents, currency } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Email jest wymagany" },
        { status: 400 },
      );
    }

    const amount = (totalCents / 100).toFixed(2);
    const description = items
      .map((i) => `${i.name} x${i.quantity}`)
      .join(", ")
      .substring(0, 128);
    const orderId = generateOrderId();

    if (!NOW_PAYMENTS_API_KEY) {
      return NextResponse.json({
        success: true,
        testMode: true,
        orderId,
        message: "Tryb testowy - brak konfiguracji NowPayments",
        amount: totalCents / 100,
        items,
      });
    }

    const callbackBase =
      process.env.NEXT_PUBLIC_SITE_URL || "https://inteligentnefolie.pl";
    const ipnUrl = `${callbackBase}/api/checkout/now-payments/ipn`;

    const paymentPayload = {
      price_amount: parseFloat(amount),
      price_currency: "pln",
      pay_currency: currency || "btc",
      ipn_callback_url: ipnUrl,
      order_id: orderId,
      order_description: description,
      customer_email: customerEmail,
    };

    const paymentResponse = await fetch(
      "https://api.nowpayments.io/v1/payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": NOW_PAYMENTS_API_KEY,
        },
        body: JSON.stringify(paymentPayload),
      },
    );

    if (!paymentResponse.ok) {
      const txt = await paymentResponse.text();
      console.error("NowPayments create payment error:", txt);
      return NextResponse.json(
        { error: "NowPayments create payment failed" },
        { status: 502 },
      );
    }

    const paymentJson = await paymentResponse.json();

    let qrUri = "";
    if (paymentJson.pay_address && paymentJson.pay_amount) {
      const payCurrency = (paymentJson.pay_currency || "btc").toLowerCase();
      qrUri = `${payCurrency}:${paymentJson.pay_address}?amount=${paymentJson.pay_amount}`;
    }

    try {
      const internalSecret = process.env.POCKETBASE_INCOMING_SECRET || "";

      const orderRecordPayload = {
        order_number: orderId,
        customer_name: customerName || "",
        customer_email: customerEmail || "",
        customer_phone: "",
        status: "pending",
        shipping_address: "",
        notes: "",
        items,
        subtotal: parseFloat(amount),
        shipping_cost: 0,
        tax: 0,
        total: parseFloat(amount),
        currency: "PLN",
        payment_status: "pending",
        payment_method: "now_payments",
        tpay_session_id: "",
        discount: 0,
        is_shipped: false,
        is_paid: false,
        transaction_id: paymentJson?.id || paymentJson?.payment_id || "",
        website_id: TENANT_ID,
        _internal_secret: internalSecret,
      };

      const createdOrder = await pb
        .collection("shop_orders")
        .create(orderRecordPayload);

      const createdItems = (
        await Promise.all(
          items.map(async (item) => {
            try {
              const quantity = Number(item.quantity ?? 1) || 1;

              const price = Number(item.price_cents ?? 0) / 100;

              const total = Number((price * quantity).toFixed(2));

              const itemPayload = {
                order_id: createdOrder.id,
                product_id: item.id || null,
                name: item.name || "",
                sku: item.id || "",
                quantity,
                price,
                total,
                _internal_secret: internalSecret,
              };

              return await pb
                .collection("shop_order_items")
                .create(itemPayload);
            } catch (error) {
              console.error("Failed to create shop_order_item:", item, error);

              return null;
            }
          }),
        )
      ).filter(Boolean);

      return NextResponse.json({
        success: true,
        orderId,
        nowPayments: paymentJson,
        qrUri,
        amount: parseFloat(amount),
        order: createdOrder,
        items: createdItems,
      });
    } catch (err: any) {
      console.error("PocketBase error:", JSON.stringify(err.response, null, 2));

      return NextResponse.json(
        {
          error: "Failed to create order record",
          details: err?.response || err?.message || err,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Błąd podczas przetwarzania zamówienia" },
      { status: 500 },
    );
  }
}
