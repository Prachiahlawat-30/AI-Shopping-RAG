import { ArrowUpRight, GitCompare, Package, Star, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard as ProductCardType } from "@/types/search";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SimilarityBadge from "./SimilarityBadge";
import { getImageUrl } from "@/lib/utils";

interface Props {
  product: ProductCardType;
  onCompare?: (product: ProductCardType) => void;
}

export default function ProductCard({ product, onCompare }: Props) {
  const isInStock = product.availability?.toLowerCase().includes("in stock");

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10">
        
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-zinc-950">
          <img
            src={getImageUrl(product.thumbnail)}
            alt={product.product_name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {/* Dark Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/20 opacity-60 transition-opacity group-hover:opacity-40" />

          {/* Similarity Badge (Top Left) */}
          <div className="absolute left-3 top-3 z-10">
            <SimilarityBadge score={product.similarity_score} />
          </div>

          {/* Category Tag (Top Right) */}
          <div className="absolute right-3 top-3 z-10">
            <span className="rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300 shadow-lg">
              {product.category}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-5">
          
          <div className="space-y-2">
            {/* Brand & Name */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                {product.brand || "Brand"}
              </p>
              <h3 className="mt-1 line-clamp-2 text-base font-semibold text-zinc-100 group-hover:text-white transition-colors">
                {product.product_name}
              </h3>
            </div>

            {/* Description */}
            <p className="line-clamp-2 text-xs text-zinc-400 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Middle Stats Section */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/60">
            
            {/* Price & Rating */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-zinc-50">
                  {product.currency ?? "₹"}
                  {product.price ?? "--"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-200">
                  {product.rating?.toFixed(1) ?? "--"}
                </span>
                <span className="text-[10px] text-zinc-500">
                  ({product.review_count ?? 0})
                </span>
              </div>
            </div>

            {/* Availability Indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {isInStock ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400/90 font-medium">{product.availability}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-zinc-400">{product.availability || "Check status"}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onCompare?.(product)}
              className="rounded-xl border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all text-xs"
            >
              <GitCompare className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
              Compare
            </Button>

            {product.product_url ? (
              <a
                href={product.product_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all text-xs font-medium px-3 py-2"
              >
                View
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            ) : (
              <Button
                type="button"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all text-xs"
                onClick={() => onCompare?.(product)}
              >
                Details
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}

          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}