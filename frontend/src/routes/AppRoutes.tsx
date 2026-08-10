import { Routes, Route } from "react-router-dom";

import { UploadPage } from "@/pages/Upload";
import { VisualSearchPage } from "@/pages/VisualSearchPage";

import {AIChatPage} from "@/pages/Chat";
import Home from "@/pages/Home";

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/upload" element={<UploadPage />} />

      <Route path="/search" element={<VisualSearchPage />} />

      <Route path="/chat" element={<AIChatPage />} />


    </Routes>
  );
}