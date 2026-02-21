import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "../../lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BharatBets - India's Prediction Market",
  description: "Predict and win on Indian politics, cricket, Bollywood, and more",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = await auth.api.getSession({
    headers: cookieStore as any,
  });

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🇮🇳</span>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                BharatBets
              </span>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                Markets
              </Link>
              <Link href="/leaderboard" className="text-slate-300 hover:text-white transition-colors">
                Leaderboard
              </Link>
              {session?.session ? (
                <Link 
                  href="/dashboard" 
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link 
                  href="/api/auth/sign-in" 
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  );
}
