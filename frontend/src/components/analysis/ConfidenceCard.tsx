import React from "react";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnalysisComponentProps } from "@/types/analysis";

// Utility function to turn keys like "product_name" or "brand" into Clean Labels
const formatLabel = (key: string) => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function ConfidenceCard({ data }: AnalysisComponentProps) {
  // Convert confidence (0-1) → percentage (0-100)
  const rawOverall = data?.confidence ?? 0;
  const overall = Math.round(rawOverall <= 1 ? rawOverall * 100 : rawOverall);

  // Safely extract and normalize attribute confidence scores
  const confidenceScores = data?.confidence_scores ?? {};
  const scores = Object.entries(confidenceScores).map(([key, value]) => {
    const rawVal = typeof value === "number" ? value : 0;
    return {
      label: formatLabel(key),
      score: Math.round(rawVal <= 1 ? rawVal * 100 : rawVal),
    };
  });

  const getStatus = (score: number) => {
    if (score >= 85) {
      return {
        label: "High Confidence",
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
        badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        scoreColor: "from-emerald-400 to-teal-400",
      };
    }

    if (score >= 65) {
      return {
        label: "Medium Confidence",
        icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
        badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        scoreColor: "from-amber-400 to-orange-400",
      };
    }

    return {
      label: "Low Confidence",
      icon: <XCircle className="h-3.5 w-3.5 text-rose-400" />,
      badgeStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      scoreColor: "from-rose-400 to-red-400",
    };
  };

  const status = getStatus(overall);

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
            <Brain className="h-5 w-5" />
          </div>
          AI Confidence
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Overall Score Highlight */}
        <div className="space-y-3.5 text-center">
          <div className="relative inline-block">
            <span
              className={`text-5xl font-black tracking-tight bg-gradient-to-r ${status.scoreColor} bg-clip-text text-transparent`}
            >
              {overall}%
            </span>
          </div>

          <Progress value={overall} className="h-2 bg-zinc-800" />

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium border ${status.badgeStyle}`}
            >
              {status.icon}
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Attribute Breakdown */}
        {scores.length > 0 && (
          <div className="space-y-3.5 pt-2 border-t border-zinc-800/50">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              Attribute Breakdown
            </h4>

            <div className="space-y-3">
              {scores.map(({ label, score }) => {
                const itemStatus = getStatus(score);
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-300">
                        {label}
                      </span>
                      <span className="font-mono font-semibold text-zinc-400">
                        {isNaN(score) ? 0 : score}%
                      </span>
                    </div>

                    <Progress
                      value={isNaN(score) ? 0 : score}
                      className="h-1.5 bg-zinc-800/80"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}