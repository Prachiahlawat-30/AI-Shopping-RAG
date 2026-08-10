import React from "react";
import {
  Upload,
  Eye,
  Brain,
  Database,
  Binary,
  CheckCircle2,
  Workflow,
  Loader2,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { AnalysisComponentProps } from "@/types/analysis";

export default function PipelineStatus({ data }: AnalysisComponentProps) {
  const pipeline = data?.pipeline ?? {};

  const steps = [
    {
      title: "Images Uploaded",
      icon: Upload,
      done: pipeline.upload ?? true,
    },
    {
      title: "Vision Analysis",
      icon: Eye,
      done: pipeline.vision ?? true,
    },
    {
      title: "Metadata Fusion",
      icon: Brain,
      done: pipeline.metadata ?? true,
    },
    {
      title: "PostgreSQL Saved",
      icon: Database,
      done: pipeline.postgres ?? true,
    },
    {
      title: "Embedding Generated",
      icon: Binary,
      done: pipeline.embedding ?? true,
    },
    {
      title: "Indexed in Qdrant",
      icon: CheckCircle2,
      done: pipeline.qdrant ?? true,
    },
  ];

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.done).length;

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
              <Workflow className="h-5 w-5" />
            </div>
            AI Pipeline
          </CardTitle>

          <Badge
            variant="outline"
            className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-xs px-2.5 py-0.5"
          >
            {completedSteps}/{totalSteps} Done
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="relative space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className="relative flex items-center justify-between gap-3">
                {/* Connecting timeline line */}
                {!isLast && (
                  <span
                    className={`absolute left-4 top-8 -bottom-3 w-[2px] -translate-x-1/2 transition-colors ${
                      step.done ? "bg-emerald-500/40" : "bg-zinc-800"
                    }`}
                  />
                )}

                {/* Left Side (Icon + Title) */}
                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                      step.done
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <span
                    className={`text-sm font-medium ${
                      step.done ? "text-zinc-200" : "text-zinc-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {/* Right Side (Status Indicator) */}
                {step.done ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 text-[11px] font-medium px-2 py-0.5"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-zinc-800/60 text-zinc-500 border-zinc-700/50 text-[11px] font-medium px-2 py-0.5"
                  >
                    Pending
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}