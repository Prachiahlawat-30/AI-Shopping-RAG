import { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { SearchInput } from "@/components/visualsearch/SearchInput";
import SuggestionPills from "@/components/visualsearch/SuggestionPills";
import { EmptyState } from "@/components/visualsearch/EmptyState";
import SearchFilters, { SearchFiltersValue } from "@/components/visualsearch/SearchFilters";
import SearchResults from "@/components/visualsearch/SearchResults";
import { useSemanticSearch, useImageSearch } from "@/hooks/useSearch";

export function VisualSearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Visual Search");
  const [searchMode, setSearchMode] = useState<"text" | "image" | null>(null);

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

  // Re-run text search when filters change (filters aren't supported on image search)
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/10 via-purple-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <Header/>

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
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}