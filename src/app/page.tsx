import Link from "next/link";
import prisma from "../../lib/prisma";

const CATEGORIES = [
  { id: "politics", label: "Politics", emoji: "🏛️", color: "bg-purple-500" },
  { id: "cricket", label: "Cricket", emoji: "🏏", color: "bg-green-500" },
  { id: "bollywood", label: "Bollywood", emoji: "🎬", color: "bg-pink-500" },
  { id: "tech", label: "Tech", emoji: "💻", color: "bg-blue-500" },
  { id: "economy", label: "Economy", emoji: "📈", color: "bg-yellow-500" },
];

async function getMarkets() {
  try {
    const markets = await prisma.market.findMany({
      where: {
        status: "active",
        endTime: { gt: new Date() },
      },
      include: {
        outcomes: true,
        _count: { select: { predictions: true } },
      },
      orderBy: { endTime: "asc" },
      take: 50,
    });
    return markets;
  } catch {
    return [];
  }
}

function formatTimeLeft(endTime: Date) {
  const diff = new Date(endTime).getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return "Ending soon";
}

export default async function Home() {
  const markets = await getMarkets();
  
  const marketsByCategory = CATEGORIES.map(cat => ({
    ...cat,
    markets: markets.filter(m => m.category === cat.id),
  }));

  return (
    <main className="min-h-screen">
      <section className="py-12 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Predict India's <span className="text-orange-500">Biggest</span> Moments
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Trade on elections, cricket matches, Bollywood releases, and more. 
            Earn points for accurate predictions.
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {marketsByCategory.map((category) => (
            <div key={category.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{category.emoji}</span>
                <h2 className="text-2xl font-bold">{category.label}</h2>
                <span className="text-slate-500">({category.markets.length})</span>
              </div>

              {category.markets.length === 0 ? (
                <p className="text-slate-500 italic">No active markets in this category</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.markets.map((market) => (
                    <Link
                      key={market.id}
                      href={`/market/${market.id}`}
                      className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-orange-500/50 hover:bg-slate-800/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${category.color} text-white`}>
                          {category.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatTimeLeft(market.endTime)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {market.title}
                      </h3>
                      
                      {market.description && (
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {market.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          {market._count.predictions} predictions
                        </span>
                        <div className="flex gap-2">
                          {market.outcomes.slice(0, 2).map((outcome) => (
                            <span
                              key={outcome.id}
                              className="text-xs bg-slate-800 px-2 py-1 rounded"
                            >
                              {outcome.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
