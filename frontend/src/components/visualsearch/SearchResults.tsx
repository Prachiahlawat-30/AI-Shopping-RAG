import React from "react";
import { motion } from "framer-motion";
import { SearchX, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import { ProductCard as ProductCardType } from "@/types/search";

interface Props {
  products: ProductCardType[];
  loading: boolean;
  onCompareProduct?: (product: ProductCardType) => void;
}

export default function SearchResults({
  products,
  loading,
  onCompareProduct,
}: Props) {

  /* Loading Skeleton Grid */
  if (loading) {
    return (
      <div className="space-y-4 w-full">
        <div className="h-5 w-48 bg-zinc-800/60 rounded-md animate-pulse" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col h-[460px] rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4 animate-pulse overflow-hidden"
            >
              <div className="aspect-square w-full rounded-xl bg-zinc-800/80" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-1/4 bg-zinc-800 rounded" />
                <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                <div className="h-4 w-full bg-zinc-800/60 rounded" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                <div className="h-6 w-20 bg-zinc-800 rounded" />
                <div className="h-5 w-16 bg-zinc-800 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-9 rounded-xl bg-zinc-800" />
                <div className="h-9 rounded-xl bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Empty Search Results Fallback */
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center my-6">
        <div className="p-4 rounded-full bg-zinc-800/60 text-zinc-400 mb-4 border border-zinc-700/50">
          <SearchX className="w-8 h-8 text-indigo-400" />
        </div>
        <h4 className="text-lg font-semibold text-zinc-200 mb-1">
          No matching products found
        </h4>
        <p className="text-sm text-zinc-400 max-w-sm mb-4">
          Try adjusting your query, clearing active filters, or uploading a different product photo.
        </p>
      </div>
    );
  }

  /* Grid Container Animations */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-4 w-full">
      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Found {products.length} Vector Match{products.length === 1 ? "" : "es"}
        </p>
      </div>

      {/* Staggered Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard 
              product={product} 
              onCompare={onCompareProduct}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}