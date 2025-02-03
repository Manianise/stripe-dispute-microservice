import "server-only";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { APIResponse, CreateError } from "@/app/interfaces/CreateError";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

function RespondeError(errorType: CreateError) {
  return NextResponse.json({ error: errorType }, { status: 400 });
}

export async function GET(
  res: NextResponse,
  { params }: { params: Promise<{ did: string }> }
) : Promise<NextResponse<APIResponse>> {
  const slug = (await params).did;

  try {
    const dispute = await stripe.disputes.retrieve(slug, {
      expand: [
        "payment_intent",
        "payment_intent.invoice",
        "payment_intent.invoice.lines.data",
      ],
    });

    if (dispute.metadata.status === "paid") return RespondeError("PAID");

    const paymentIntent: Stripe.PaymentIntent | null = dispute.payment_intent as Stripe.PaymentIntent;
    const invoice: Stripe.Invoice | null = paymentIntent.invoice as Stripe.Invoice;

    if(!invoice || !paymentIntent || !paymentIntent.payment_method_types.includes('sepa_debit') ) return RespondeError("UNERR");

    const session = await stripe.checkout.sessions.create({
      success_url: "http://localhost:3000/success",
      customer: `${invoice.customer}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: `${invoice.currency}`,
            unit_amount: invoice.amount_due,
            product_data: {
              name: `Paiement de la facture ${invoice.number} de : `,
              description: `En date du : ${new Date(
                dispute.created * 1000
              ).toLocaleDateString()} \n`,
            },
          },
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      payment_intent_data: {
        capture_method: "manual",
      },
      metadata: {
        dispute: `${dispute.id}`,
      },
    });
    await stripe.disputes.update(dispute.id, {
      metadata: {
        status: "pending",
      },
    });

    return NextResponse.json(
      { url: `${session.url}` },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `${Math.max(
            session.expires_at - (Date.now() / 1000) * 60 * 60 * 4,
            10
          )}`,
        },
      }
    );
  } catch {
    return RespondeError("INTERNAL");
  }
}
