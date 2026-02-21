"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Outcome {
  id: string;
  title: string;
}

interface Prediction {
  id: string;
  confidence: number;
  outcome: Outcome;
}

interface PlacePredictionProps {
  marketId: string;
  outcomes: Outcome[];
  userPrediction: Prediction | null;
  isLoggedIn: boolean;
}

export default function PlacePrediction({
  marketId,
  outcomes,
  userPrediction,
  isLoggedIn,
}: PlacePredictionProps) {
  const router = useRouter();
  const [selectedOutcome, setSelectedOutcome] = useState<string>(
    userPrediction?.outcome.id || ""
  );
  const [confidence, setConfidence] = useState(userPrediction?.confidence || 50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      router.push("/api/auth/sign-in");
      return;
    }

    if (!selectedOutcome) {
      setError("Please select an outcome");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId,
          outcomeId: selectedOutcome,
          confidence,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place prediction");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Select Outcome</label>
        <div className="grid grid-cols-2 gap-3">
          {outcomes.map((outcome) => (
            <button
              key={outcome.id}
              type="button"
              onClick={() => setSelectedOutcome(outcome.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedOutcome === outcome.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <span className="text-lg font-semibold">{outcome.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">
          Confidence: {confidence}%
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Less confident</span>
          <span>Very confident</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedOutcome}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition-colors"
      >
        {loading
          ? "Placing Prediction..."
          : userPrediction
          ? "Update Prediction"
          : "Place Prediction"}
      </button>
    </form>
  );
}
