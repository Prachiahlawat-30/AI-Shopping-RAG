import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <main>
        <Outlet />
      </main>
    </div>
  );
}