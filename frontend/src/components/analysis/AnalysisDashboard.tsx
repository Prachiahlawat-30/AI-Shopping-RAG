import React from "react";
import ProductOverviewCard from "./ProductOverviewCard";
import ProductDescription from "./ProductDescription";
import FeatureList from "./FeatureList";
import SpecificationTable from "./SpecificationTable";
import ConfidenceCard from "./ConfidenceCard";
import ImageGallery from "./ImageGallery";
import MetadataBadges from "./MetadataBadges";
import PipelineStatus from "./PipelineStatus";
import { AnalysisComponentProps } from "@/types/analysis";
import { Sparkles, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AnalysisDashboard({ data }: AnalysisComponentProps) {
  if (!data) return null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              Analysis Results
            </h1>
            <Badge 
              variant="outline" 
              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs gap-1.5 py-0.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Processing
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Real-time visual extraction, metadata categorization, and confidence breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 backdrop-blur-md">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Pipeline Active</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Main Content Column (Left - 2/3 width on large screens) */}
        <div className="space-y-6 lg:col-span-2">
          <ProductOverviewCard data={data} />
          <ProductDescription data={data} />
          <FeatureList data={data} />
          <SpecificationTable data={data} />
        </div>

        {/* Analytics & Metadata Sidebar (Right - 1/3 width on large screens) */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <ConfidenceCard data={data} />
          <ImageGallery data={data} />
          <MetadataBadges data={data} />
          <PipelineStatus data={data} />
        </div>
      </div>
    </div>
  );
}