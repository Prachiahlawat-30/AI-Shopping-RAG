import React from "react";
import { SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export interface SearchFiltersValue {
  brands: string[];
  categories: string[];
  colors: string[];
  min_price?: number;
  max_price?: number;
}

interface Props {
  filters: SearchFiltersValue;
  onChange: (filters: SearchFiltersValue) => void;
}

const BRANDS = ["Nike", "Adidas", "Apple", "Samsung", "Sony", "Puma"];
const CATEGORIES = ["Shoes", "Headphones", "Watch", "Phone", "Laptop"];
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Red", hex: "#EF4444" },
  { name: "Grey", hex: "#6B7280" },
];

export default function SearchFilters({ filters, onChange }: Props) {
  const activeCount =
    filters.brands.length +
    filters.categories.length +
    filters.colors.length +
    (filters.min_price ? 1 : 0) +
    (filters.max_price ? 1 : 0);

  const toggleValue = (
    key: "brands" | "categories" | "colors",
    value: string
  ) => {
    const values = filters[key];
    if (values.includes(value)) {
      onChange({
        ...filters,
        [key]: values.filter((v) => v !== value),
      });
      return;
    }
    onChange({
      ...filters,
      [key]: [...values, value],
    });
  };

  const handleReset = () => {
    onChange({
      brands: [],
      categories: [],
      colors: [],
      min_price: undefined,
      max_price: undefined,
    });
  };

  return (
    <Card className="sticky top-24 h-fit rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-xl">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Filters</h3>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
              {activeCount}
            </span>
          )}
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleReset}
          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded-lg transition-colors"
          title="Reset filters"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Brand
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((brand) => {
            const isSelected = filters.brands.includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => toggleValue("brands", brand)}
                className={`
                  flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500"
                      : "bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
                  }
                `}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Category
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((category) => {
            const isSelected = filters.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleValue("categories", category)}
                className={`
                  flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500"
                      : "bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
                  }
                `}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Color
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((color) => {
            const isSelected = filters.colors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleValue("colors", color.name)}
                className={`
                  flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500"
                      : "bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
                  }
                `}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-white/20"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Price Range
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            type="number"
            placeholder="Min"
            value={filters.min_price ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                min_price: Number(e.target.value) || undefined,
              })
            }
            className="h-9 rounded-xl border-zinc-800 bg-zinc-950/80 text-xs text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.max_price ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                max_price: Number(e.target.value) || undefined,
              })
            }
            className="h-9 rounded-xl border-zinc-800 bg-zinc-950/80 text-xs text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

    </Card>
  );
}