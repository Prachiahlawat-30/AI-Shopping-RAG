import { useState, useEffect } from "react";
import { GitCompare, Sparkles, X } from "lucide-react";
import { Header } from "../components/layout/Header";
import { SearchInput } from "@/components/visualsearch/SearchInput";
import SuggestionPills from "@/components/visualsearch/SuggestionPills";
import { EmptyState } from "@/components/visualsearch/EmptyState";
import SearchFilters, { SearchFiltersValue } from "@/components/visualsearch/SearchFilters";
import SearchResults from "@/components/visualsearch/SearchResults";
import { ProductCompareModal } from "@/components/compare/ProductCompareModal";
import { ProductCard } from "@/types/search";
import { useSemanticSearch, useImageSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";

export function VisualSearchPage() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"text" | "image" | null>(null);

  // Comparison State
  const [compareList, setCompareList] = useState<ProductCard[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFiltersValue>({
    brands: [],
    categories: [],
    colors: [],
    min_price: undefined,
    max_price: undefined,
  });

  const textSearch = useSemanticSearch();
  const imageSearch = useImageSearch();

  // Execute Text Search
  const handleSearch = (searchText: string) => {
    setQuery(searchText);
    if (!searchText.trim()) return;

    setSearchMode("text");
    textSearch.mutate({
      query: searchText,
      page: 1,
      limit: 20,
      filters,
    });
  };

  // Execute Real Image Search (calls /search/image with the actual file)
  const handleImageSearch = (file: File) => {
    setQuery(`Image search: ${file.name}`);
    setSearchMode("image");
    imageSearch.mutate(file);
  };

  // Compare Handler
  const handleToggleCompare = (product: ProductCard) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
  };

  const handleRemoveCompare = (id: number) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  };

  // Re-run text search when filters change
  useEffect(() => {
    if (searchMode === "text" && query) {
      textSearch.mutate({
        query,
        page: 1,
        limit: 20,
        filters,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const activeResponse = searchMode === "image" ? imageSearch.data : textSearch.data;
  const isPending = searchMode === "image" ? imageSearch.isPending : textSearch.isPending;

  const hasSearchData =
    Boolean(activeResponse?.results && activeResponse.results.length > 0) || isPending;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-24">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/10 via-purple-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <Header />

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 py-8 sm:py-12">
        <section className="w-full max-w-3xl mx-auto flex flex-col items-center">
          <SearchInput
            value={query}
            onChange={(val) => setQuery(val)}
            onImageSelect={handleImageSearch}
          />

          {!hasSearchData && (
            <div className="w-full max-w-2xl">
              <SuggestionPills onSelect={handleSearch} />
            </div>
          )}
        </section>

        {!hasSearchData && (
          <section className="w-full mt-4">
            <EmptyState onImageSelect={handleImageSearch} />
          </section>
        )}

        {hasSearchData && (
          <section className="grid gap-8 lg:grid-cols-[280px_1fr] items-start pt-4">
            <aside className="w-full">
              <SearchFilters
                filters={filters}
                onChange={setFilters}
              />
            </aside>
            <div className="w-full min-w-0">
              <SearchResults
                products={activeResponse?.results || []}
                loading={isPending}
                onCompareProduct={handleToggleCompare}
              />
            </div>
          </section>
        )}
      </main>

      {/* Floating Comparison Drawer / Dock */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#12141e]/95 border border-zinc-700/80 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span>{compareList.length} Selected to Compare</span>
          </div>

          <div className="flex items-center gap-2">
            {compareList.map((p) => (
              <div key={p.id} className="relative group">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 block truncate max-w-[120px]">
                  {p.product_name}
                </span>
                <button
                  onClick={() => handleRemoveCompare(p.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] opacity-80 hover:opacity-100"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-700">
            <Button
              type="button"
              disabled={compareList.length < 2}
              onClick={() => setIsCompareModalOpen(true)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-1.5 h-8 disabled:opacity-50"
            >
              Compare Side-by-Side
            </Button>
            <button
              onClick={() => setCompareList([])}
              className="text-xs text-zinc-400 hover:text-white px-1.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <ProductCompareModal
        products={compareList}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveProduct={handleRemoveCompare}
      />
    </div>
  );
}