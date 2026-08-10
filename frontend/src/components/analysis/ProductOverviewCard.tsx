import React from "react";
import {
  Package,
  Tag,
  BadgeIndianRupee,
  Palette,
  Boxes,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisComponentProps } from "@/types/analysis";

interface ItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  iconBgColor?: string;
  iconTextColor?: string;
}

const Item = ({
  icon,
  label,
  value,
  iconBgColor = "bg-indigo-500/10",
  iconTextColor = "text-indigo-400",
}: ItemProps) => {
  const isAvailable = Boolean(value && value !== "Not Available");

  return (
    <div className="group relative flex items-center gap-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3.5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/50">
      {/* Icon Container */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBgColor} ${iconTextColor} transition-transform group-hover:scale-105`}
      >
        {icon}
      </div>

      {/* Label and Value */}
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
          {label}
        </span>
        <span
          className={`mt-0.5 text-sm font-semibold truncate ${
            isAvailable ? "text-zinc-100" : "text-zinc-500 italic"
          }`}
        >
          {value || "Not Available"}
        </span>
      </div>
    </div>
  );
};

export default function ProductOverviewCard({ data }: AnalysisComponentProps) {
  const metadata = data?.metadata ?? {};

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
            Product Overview
          </CardTitle>

          <Badge
            variant="outline"
            className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 gap-1 text-xs px-2.5 py-1 font-medium"
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            AI Generated
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {metadata.product_name || "Unknown Product"}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">
            AI extracted product information from uploaded images.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Item
            icon={<Tag size={18} />}
            label="Brand"
            value={metadata.brand}
            iconBgColor="bg-blue-500/10"
            iconTextColor="text-blue-400"
          />

          <Item
            icon={<Boxes size={18} />}
            label="Category"
            value={metadata.category}
            iconBgColor="bg-purple-500/10"
            iconTextColor="text-purple-400"
          />

          <Item
            icon={<BadgeIndianRupee size={18} />}
            label="Price"
            value={metadata.price}
            iconBgColor="bg-emerald-500/10"
            iconTextColor="text-emerald-400"
          />

          <Item
            icon={<Palette size={18} />}
            label="Color"
            value={metadata.color}
            iconBgColor="bg-pink-500/10"
            iconTextColor="text-pink-400"
          />

          <Item
            icon={<Package size={18} />}
            label="Material"
            value={metadata.material}
            iconBgColor="bg-amber-500/10"
            iconTextColor="text-amber-400"
          />

          <Item
            icon={<CheckCircle2 size={18} />}
            label="Availability"
            value={metadata.availability || "Detected"}
            iconBgColor="bg-teal-500/10"
            iconTextColor="text-teal-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}