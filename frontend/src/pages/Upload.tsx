import React, { useState } from "react";

import { Dropzone } from "../components/upload/Dropzone";
import { ViewsGrid } from "../components/upload/ViewsGrid";
import { UploadToolbar } from "../components/upload/UploadToolbar";
import { ViewSlot } from "../components/upload/ViewCard";
import { Header } from "../components/layout/Header";
import { useUpload } from "../hooks/useUpload";

import AnalysisDashboard from "@/components/analysis/AnalysisDashboard";
import { AnalysisData } from "@/types/analysis";

const initialSlots: ViewSlot[] = [
  {
    id: "front",
    title: "Front View",
    label: "Front",
    description: "Main product image",
  },
  {
    id: "back",
    title: "Back View",
    label: "Back",
    description: "Rear product image",
  },
  {
    id: "side",
    title: "Side View",
    label: "Side",
    description: "Product profile",
  },
  {
    id: "detail",
    title: "Detail View",
    label: "Detail",
    description: "Close-up details",
  },
];

export const UploadPage: React.FC = () => {
  const [slots, setSlots] = useState<ViewSlot[]>(initialSlots);

  const [prompt, setPrompt] = useState(
    "Analyze this product and generate structured metadata."
  );

  const [analysisData, setAnalysisData] =
    useState<AnalysisData | null>(null);

  const {
    upload,
    loading,
    error,
    reset,
  } = useUpload();

  // ----------------------------------------
  // Drag & Drop Upload
  // ----------------------------------------

  const handleFilesSelected = (files: FileList) => {
    const updated = [...slots];

    Array.from(files)
      .slice(0, 4)
      .forEach((file, index) => {
        updated[index] = {
          ...updated[index],
          file,
          imagePreview: URL.createObjectURL(file),
        };
      });

    setSlots(updated);

    setAnalysisData(null);

    reset();
  };

  // ----------------------------------------
  // Individual Upload
  // ----------------------------------------

  const handleImageUpload = (
    slotId: string,
    file: File
  ) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              file,
              imagePreview: URL.createObjectURL(file),
            }
          : slot
      )
    );

    setAnalysisData(null);

    reset();
  };

  // ----------------------------------------
  // Remove Image
  // ----------------------------------------

  const handleImageRemove = (slotId: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              file: undefined,
              imagePreview: undefined,
            }
          : slot
      )
    );

    setAnalysisData(null);

    reset();
  };

  // ----------------------------------------
  // Analyze Product
  // ----------------------------------------

  const handleAnalyze = async () => {
    const files = slots
      .filter((slot) => slot.file)
      .map((slot) => slot.file!);

    const response = await upload(files, prompt);

    if (!response) return;

    console.log("Analysis Response", response);

    setAnalysisData(response);
  };

  const uploadedImages = slots.filter(
    (slot) => slot.file
  ).length;

  return (
    <div className="min-h-screen bg-[#08080A] text-white">
      <Header/>

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Hero */}

        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">
            AI Product Understanding
          </span>

          <h1 className="mt-4 text-5xl font-black">
            Upload Product Images
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-gray-400">
            Upload up to four product images.
            GPT Vision analyzes every image,
            fuses the metadata,
            stores the product in PostgreSQL,
            generates embeddings,
            and indexes everything in Qdrant
            for semantic search.
          </p>
        </div>

        {/* Dropzone */}

        <Dropzone
          onFilesSelected={handleFilesSelected}
        />

        {/* Views */}

        <ViewsGrid
          slots={slots}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
        />

        {/* Toolbar */}

        <UploadToolbar
          prompt={prompt}
          onPromptChange={setPrompt}
          loading={loading}
          disabled={uploadedImages === 0}
          onAnalyze={handleAnalyze}
        />

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="font-medium text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* Analysis Dashboard */}

        {analysisData && (
          <div className="mt-10 animate-in fade-in duration-500">
            <AnalysisDashboard
              data={analysisData}
            />
          </div>
        )}
      </main>
    </div>
  );
};