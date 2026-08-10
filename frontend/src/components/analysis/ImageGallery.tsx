import React, { useEffect, useState, useMemo } from "react";
import { ImageIcon, Layers, Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisComponentProps } from "@/types/analysis";

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

export default function ImageGallery({ data }: AnalysisComponentProps) {
  // Memoize image URL formatting to avoid infinite effect triggers
  const images = useMemo(() => {
    return (
      data?.images?.map((image) =>
        image.startsWith("http") ? image : `${API_BASE_URL}${image}`
      ) ?? []
    );
  }, [data?.images]);

  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    } else {
      setSelectedImage("");
    }
  }, [images]);

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            Uploaded Images
          </CardTitle>

          {images.length > 0 && (
            <Badge
              variant="outline"
              className="bg-zinc-800/80 text-zinc-300 border-zinc-700/80 text-xs px-2.5 py-0.5 gap-1"
            >
              <Layers className="h-3 w-3 text-blue-400" />
              {images.length} {images.length === 1 ? "Image" : "Images"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {images.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30">
            <div className="text-center">
              <ImageIcon className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
              <p className="text-sm text-zinc-400">No images uploaded</p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Stage Preview */}
            <div className="relative group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 p-2 backdrop-blur-sm">
              <div className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
                <img
                  src={selectedImage}
                  alt="Product Visual Preview"
                  className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 pointer-events-none">
                  <span className="text-xs text-zinc-300 flex items-center gap-1 bg-zinc-900/90 border border-zinc-700 px-2.5 py-1 rounded-md backdrop-blur-md">
                    <Eye className="w-3.5 h-3.5 text-blue-400" /> Active Visual
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2.5">
              {images.map((image, index) => {
                const isSelected = selectedImage === image;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`relative overflow-hidden rounded-lg border transition-all duration-200 focus:outline-none ${
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-95"
                        : "border-zinc-800/80 opacity-60 hover:opacity-100 hover:border-zinc-700"
                    }`}
                  >
                    <div className="h-16 w-full bg-zinc-950">
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}