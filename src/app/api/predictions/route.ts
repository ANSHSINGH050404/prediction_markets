import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { marketId, outcomeId, confidence } = await req.json();

    if (!marketId || !outcomeId || !confidence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const market = await prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market || market.status !== "active") {
      return NextResponse.json(
        { error: "Market not available for predictions" },
        { status: 400 }
      );
    }

    if (new Date(market.endTime) < new Date()) {
      return NextResponse.json(
        { error: "Market has ended" },
        { status: 400 }
      );
    }

    const prediction = await prisma.prediction.upsert({
      where: {
        userId_marketId: {
          userId: session.user.id,
          marketId,
        },
      },
      update: {
        outcomeId,
        confidence,
      },
      create: {
        userId: session.user.id,
        marketId,
        outcomeId,
        confidence,
      },
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Failed to place prediction" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const predictions = await prisma.prediction.findMany({
      where: { userId: session.user.id },
      include: {
        market: {
          include: { outcomes: true },
        },
        outcome: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Get predictions error:", error);
    return NextResponse.json(
      { error: "Failed to get predictions" },
      { status: 500 }
    );
  }
}
