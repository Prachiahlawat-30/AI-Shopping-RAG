import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { AnalysisComponentProps } from "@/types/analysis";

export default function ProductDescription({ data }: AnalysisComponentProps) {
  const [expanded, setExpanded] = useState(false);

  const description =
    data?.summary ||
    "No AI-generated description is available for this product.";

  const shouldCollapse = description.length > 280;

  const displayText =
    shouldCollapse && !expanded
      ? `${description.slice(0, 280)}...`
      : description;

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
            <Sparkles className="h-5 w-5" />
          </div>
          AI Product Description
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 transition-colors">
          <p className="whitespace-pre-line leading-relaxed text-zinc-300 text-sm">
            {displayText}
          </p>

          {/* Fade mask when collapsed */}
          {shouldCollapse && !expanded && (
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none rounded-b-xl" />
          )}
        </div>

        {shouldCollapse && (
          <Button
            variant="ghost"
            onClick={() => setExpanded((prev) => !prev)}
            className="w-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 text-xs font-medium border border-zinc-800/50"
          >
            {expanded ? (
              <span className="flex items-center gap-1.5">
                Show Less <ChevronUp className="h-4 w-4 text-purple-400" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Read More <ChevronDown className="h-4 w-4 text-purple-400" />
              </span>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}