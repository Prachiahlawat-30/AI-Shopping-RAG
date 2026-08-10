import React from "react";
import { CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisComponentProps } from "@/types/analysis";

export default function FeatureList({ data }: AnalysisComponentProps) {
  const rawFeatures: string[] =
    data?.features ||
    data?.metadata?.features ||
    [];

  // Clean and deduplicate features (case-insensitive deduplication)
  const features = Array.from(
    new Map(
      rawFeatures
        .filter((f) => Boolean(f) && typeof f === "string")
        .map((item) => [item.trim().toLowerCase(), item.trim()])
    ).values()
  );

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            Key Features
          </CardTitle>

          {features.length > 0 && (
            <Badge
              variant="outline"
              className="bg-zinc-800/80 text-zinc-300 border-zinc-700/80 text-xs px-2.5 py-0.5"
            >
              {features.length} {features.length === 1 ? "Feature" : "Features"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {features.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400">
              No specific key features were extracted for this product.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3.5 transition-all duration-200 hover:border-indigo-500/50 hover:bg-zinc-900/60"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <span className="text-sm font-medium text-zinc-200 group-hover:text-white capitalize">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}