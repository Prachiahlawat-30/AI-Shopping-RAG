import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { UploadPage } from "./pages/Upload";
import { VisualSearchPage } from "./pages/VisualSearchPage";
import { HistoryPage } from "./pages/History";
import { AIChatPage } from "./pages/Chat";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="login/*" element={<Login />} />
      <Route path="register/*" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="visual-search" element={<VisualSearchPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="chat" element={<AIChatPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;