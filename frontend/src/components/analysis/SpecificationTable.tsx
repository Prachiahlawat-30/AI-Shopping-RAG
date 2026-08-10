import React from "react";
import { ClipboardList, Sparkles, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisComponentProps } from "@/types/analysis";

// Utility function to format keys cleanly (e.g., midsole_technology -> Midsole Technology)
const formatKey = (key: string) => {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function SpecificationTable({ data }: AnalysisComponentProps) {
  const specifications =
    data?.specifications ||
    data?.metadata?.specifications ||
    {};

  const entries = Object.entries(specifications).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
              <ClipboardList className="h-5 w-5" />
            </div>
            Product Specifications
          </CardTitle>

          {entries.length > 0 && (
            <Badge
              variant="outline"
              className="bg-zinc-800/80 text-zinc-300 border-zinc-700/80 text-xs px-2.5 py-0.5"
            >
              {entries.length} Specs
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400">
              No product specifications were detected.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/30">
            {entries.map(([key, value], index) => {
              const formattedValue = Array.isArray(value)
                ? value.join(", ")
                : String(value);

              return (
                <div
                  key={key}
                  className={`grid grid-cols-2 items-center px-5 py-3.5 text-sm transition-colors hover:bg-zinc-800/40 ${
                    index % 2 === 0 ? "bg-zinc-950/40" : "bg-zinc-900/20"
                  } ${
                    index !== entries.length - 1 ? "border-b border-zinc-800/60" : ""
                  }`}
                >
                  <span className="font-medium text-zinc-400">
                    {formatKey(key)}
                  </span>

                  <span className="text-right font-semibold text-zinc-100 font-mono text-xs sm:text-sm break-words">
                    {formattedValue}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}