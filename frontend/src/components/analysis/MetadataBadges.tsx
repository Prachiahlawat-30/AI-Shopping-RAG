import React from "react";
import { Tag, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { AnalysisComponentProps } from "@/types/analysis";

interface MetadataPair {
  label: string;
  value: string;
}

export default function MetadataBadges({ data }: AnalysisComponentProps) {
  const metadata = data?.metadata ?? {};

  // Define potential metadata pairs
  const rawPairs: MetadataPair[] = [
    { label: "Brand", value: metadata.brand },
    { label: "Category", value: metadata.category },
    { label: "Color", value: metadata.color },
    { label: "Material", value: metadata.material },
    { label: "Gender", value: metadata.gender },
    { label: "Availability", value: metadata.availability },
  ];

  // Filter out empty or "Not Available" placeholder values
  const validBadges = rawPairs.filter(
    (item) =>
      Boolean(item.value) &&
      typeof item.value === "string" &&
      item.value.toLowerCase() !== "not available" &&
      item.value.toLowerCase() !== "n/a"
  );

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
            <div className="p-1.5 rounded-md bg-teal-500/10 text-teal-400">
              <Tag className="h-5 w-5" />
            </div>
            Metadata Tags
          </CardTitle>

          {validBadges.length > 0 && (
            <Badge
              variant="outline"
              className="bg-zinc-800/80 text-zinc-300 border-zinc-700/80 text-xs px-2.5 py-0.5"
            >
              {validBadges.length} Tags
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {validBadges.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-6 text-center">
            <p className="text-sm text-zinc-400">
              No active metadata tags detected.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {validBadges.map((item, index) => (
              <div
                key={index}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-teal-500/50 hover:bg-zinc-900/80"
              >
                <span className="text-zinc-500 group-hover:text-teal-400 transition-colors">
                  {item.label}:
                </span>
                <span className="text-zinc-100 font-semibold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}