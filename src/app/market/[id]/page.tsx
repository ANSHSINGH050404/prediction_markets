import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import PlacePrediction from "./PlacePrediction";

async function getMarket(id: string) {
  const market = await prisma.market.findUnique({
    where: { id },
    include: {
      outcomes: true,
      _count: { select: { predictions: true } },
    },
  });
  return market;
}

async function getUserPrediction(marketId: string, userId: string) {
  const prediction = await prisma.prediction.findUnique({
    where: {
      userId_marketId: { userId, marketId },
    },
    include: { outcome: true },
  });
  return prediction;
}

const CATEGORY_INFO: Record<string, { label: string; emoji: string }> = {
  politics: { label: "Politics", emoji: "🏛️" },
  cricket: { label: "Cricket", emoji: "🏏" },
  bollywood: { label: "Bollywood", emoji: "🎬" },
  tech: { label: "Tech", emoji: "💻" },
  economy: { label: "Economy", emoji: "📈" },
};

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const market = await getMarket(id);
  
  if (!market) {
    notFound();
  }

  const cookieStore = await cookies();
  const session = await auth.api.getSession({ headers: cookieStore as any });
  
  let userPrediction = null;
  const userId = session?.user?.id;
  if (userId) {
    userPrediction = await getUserPrediction(id, userId);
  }

  const catInfo = CATEGORY_INFO[market.category] || { label: market.category, emoji: "📊" };
  const isActive = market.status === "active" && new Date(market.endTime) > new Date();

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-orange-500 hover:text-orange-400 mb-6 inline-flex items-center gap-2">
          ← Back to Markets
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{catInfo.emoji}</span>
            <span className="text-slate-400">{catInfo.label}</span>
            <span className="text-slate-600">•</span>
            <span className={`text-sm ${isActive ? "text-green-500" : "text-red-500"}`}>
              {market.status === "active" ? "Active" : market.status}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{market.title}</h1>
          
          {market.description && (
            <p className="text-slate-400 mb-6">{market.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>{market._count.predictions} predictions</span>
            <span>Ends: {new Date(market.endTime).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4"> outcomes</h2>
          
          {userPrediction && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-500 font-medium mb-1">Your Prediction</p>
              <p className="text-lg">{userPrediction.outcome.title}</p>
              <p className="text-sm text-slate-400">Confidence: {userPrediction.confidence}%</p>
            </div>
          )}

          {isActive ? (
            <PlacePrediction 
              marketId={market.id} 
              outcomes={market.outcomes}
              userPrediction={userPrediction}
              isLoggedIn={!!userId}
            />
          ) : (
            <div className="text-center py-8 text-slate-500">
              This market is closed for new predictions
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
