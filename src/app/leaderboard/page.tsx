import prisma from "../../../lib/prisma";

async function getLeaderboard() {
  return prisma.user.findMany({
    orderBy: [{ totalPoints: "desc" }, { accuracy: "desc" }],
    take: 50,
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      totalPoints: true,
      accuracy: true,
      rank: true,
    },
  });
}

export default async function Leaderboard() {
  const users = await getLeaderboard();

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-slate-400">Top predictors in BharatBets</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Points</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      {index > 2 && <span className="text-slate-500 font-bold">#{index + 1}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-orange-500 font-bold text-lg">{user.totalPoints}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-green-500 font-semibold">{Math.round(user.accuracy)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No users on the leaderboard yet
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
