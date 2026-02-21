import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "../../../lib/auth";

export default async function SignIn() {
  const cookieStore = await cookies();
  const session = await auth.api.getSession({ headers: cookieStore as any });
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-orange-500">Bharat</span>Bets
          </h1>
          <p className="text-slate-400">Sign in to start predicting</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <Link
            href="/api/auth/sign-in/github"
            className="block w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-xl font-medium transition-colors text-center"
          >
            Continue with GitHub
          </Link>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-500">or</span>
            </div>
          </div>

          <form action="/api/auth/sign-in/email" method="POST" className="space-y-4">
            <input type="hidden" name="json" value="true" />
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-xl font-medium transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-orange-500 hover:text-orange-400">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
