import React, { useEffect, useState } from "react";
import { X, GitCompare, Sparkles, Star, CheckCircle, ShieldCheck, ArrowUpRight } from "lucide-react";
import { ProductCard, ProductComparisonResponse } from "@/types/search";
import { compareProducts } from "@/api/search";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductCompareModalProps {
  products: ProductCard[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct?: (id: number) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
}) => {
  const [comparisonData, setComparisonData] = useState<ProductComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && products.length >= 2) {
      setLoading(true);
      compareProducts(products.map((p) => p.id))
        .then((res) => setComparisonData(res))
        .catch((err) => console.error("Compare error:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const specKeys = comparisonData ? Object.keys(comparisonData.spec_matrix) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0c0e15] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-[#12141e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Side-by-Side Product Comparison
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                  {products.length} Products
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Detailed attribute matrix & AI comparison insights
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {products.length < 2 ? (
            <div className="py-16 text-center text-zinc-400">
              <GitCompare className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <p className="text-sm font-medium">Select at least 2 products to compare attributes side-by-side.</p>
            </div>
          ) : loading ? (
            <div className="py-16 text-center text-zinc-400">
              <Sparkles className="w-8 h-8 mx-auto text-indigo-400 animate-spin mb-3" />
              <p className="text-sm font-medium">Synthesizing specification matrix...</p>
            </div>
          ) : (
            <>
              {/* Product Header Cards Grid */}
              <div className={`grid grid-cols-${products.length} gap-4`}>
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between relative group"
                  >
                    {onRemoveProduct && (
                      <button
                        onClick={() => onRemoveProduct(p.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all text-xs"
                        title="Remove product from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex flex-col items-center text-center">
                      <img
                        src={getImageUrl(p.thumbnail)}
                        alt={p.product_name}
                        className="w-24 h-24 rounded-xl object-cover bg-black/40 mb-3 border border-zinc-800"
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                        {p.brand}
                      </span>
                      <h4 className="text-sm font-semibold text-white line-clamp-2 mt-0.5">
                        {p.product_name}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-base font-bold text-emerald-400">
                        {p.currency || "₹"}{p.price ?? "--"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{p.rating?.toFixed(1) ?? "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Comparison Synthesis */}
              {comparisonData?.comparison_summary && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 text-xs leading-relaxed flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-300 block mb-1">AI Recommendation & Overview</span>
                    {comparisonData.comparison_summary}
                  </div>
                </div>
              )}

              {/* Specifications Matrix Table */}
              <div className="rounded-2xl border border-zinc-800/80 overflow-hidden bg-zinc-950/50">
                <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 font-semibold text-xs text-zinc-300 uppercase tracking-wider">
                  Detailed Specifications Comparison
                </div>

                <div className="divide-y divide-zinc-800/60">
                  {/* Category & Attributes */}
                  <div className="grid grid-cols-[180px_1fr] text-xs">
                    <div className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30">Category</div>
                    <div className={`grid grid-cols-${products.length} divide-x divide-zinc-800/40 p-3.5`}>
                      {products.map((p) => (
                        <div key={p.id} className="px-2 text-zinc-200">{p.category || "General"}</div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] text-xs">
                    <div className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30">Material</div>
                    <div className={`grid grid-cols-${products.length} divide-x divide-zinc-800/40 p-3.5`}>
                      {products.map((p) => (
                        <div key={p.id} className="px-2 text-zinc-200">{p.material || "N/A"}</div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] text-xs">
                    <div className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30">Color</div>
                    <div className={`grid grid-cols-${products.length} divide-x divide-zinc-800/40 p-3.5`}>
                      {products.map((p) => (
                        <div key={p.id} className="px-2 text-zinc-200">{p.color || "N/A"}</div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic specs from matrix */}
                  {specKeys.map((key) => (
                    <div key={key} className="grid grid-cols-[180px_1fr] text-xs">
                      <div className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30">{key}</div>
                      <div className={`grid grid-cols-${products.length} divide-x divide-zinc-800/40 p-3.5`}>
                        {products.map((p) => (
                          <div key={p.id} className="px-2 text-zinc-200 font-mono">
                            {comparisonData?.spec_matrix[key]?.[p.id.toString()] || "N/A"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#12141e] flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
          >
            Close Comparison
          </Button>
        </div>

      </div>
    </div>
  );
};
