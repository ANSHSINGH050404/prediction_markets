import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

async function getUserPredictions(userId: string) {
  return prisma.prediction.findMany({
    where: { userId },
    include: {
      market: { include: { outcomes: true } },
      outcome: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

async function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = await auth.api.getSession({ headers: cookieStore as any });
  
  if (!session?.user) {
    redirect("/api/auth/sign-in");
  }

  const [user, predictions] = await Promise.all([
    getUser(session.user.id),
    getUserPredictions(session.user.id),
  ]);

  const activePredictions = predictions.filter(p => p.market.status === "active");
  const resolvedPredictions = predictions.filter(p => p.market.status === "resolved");

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.username || "User"}</h1>
              <p className="text-slate-400">{session.user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-orange-500">{user?.totalPoints || 0}</p>
              <p className="text-sm text-slate-400">Total Points</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-500">{Math.round(user?.accuracy || 0)}%</p>
              <p className="text-sm text-slate-400">Accuracy</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-500">{predictions.length}</p>
              <p className="text-sm text-slate-400">Predictions</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Active Predictions</h2>
          {activePredictions.length === 0 ? (
            <p className="text-slate-500">No active predictions</p>
          ) : (
            <div className="space-y-3">
              {activePredictions.map((pred) => (
                <Link
                  key={pred.id}
                  href={`/market/${pred.marketId}`}
                  className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold line-clamp-1">{pred.market.title}</h3>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      You predicted: <span className="text-orange-500">{pred.outcome.title}</span>
                    </span>
                    <span className="text-slate-500">{pred.confidence}% confidence</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Past Predictions</h2>
          {resolvedPredictions.length === 0 ? (
            <p className="text-slate-500">No resolved predictions yet</p>
          ) : (
            <div className="space-y-3">
              {resolvedPredictions.map((pred) => {
                const isCorrect = pred.market.correctOutcomeId === pred.outcomeId;
                return (
                  <div
                    key={pred.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold line-clamp-1">{pred.market.title}</h3>
                      <span className={`text-sm ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                        {isCorrect ? "✓ Correct" : "✗ Wrong"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        You predicted: <span className={isCorrect ? "text-green-500" : "text-red-500"}>
                          {pred.outcome.title}
                        </span>
                      </span>
                      <span className="text-slate-500">
                        {pred.pointsEarned ? `+${pred.pointsEarned} pts` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
