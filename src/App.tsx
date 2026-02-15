import React from "react";
import { HashRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import VisualNovel from "./pages/VisualNovel";

// Pages Import

const MainLayout = () => {
  return (
    // UBAH: Background utama jadi gelap (#0f1115) agar match dengan halaman lain
    <div className="flex flex-col min-h-screen bg-[#0f1115] text-white relative font-sans selection:bg-pink-500 selection:text-white">
      <div className="grow z-10 w-full">
        <Outlet />
      </div>

      {/* FOOTER (Perbaikan Utama) */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1115]/80 backdrop-blur-md border-t border-white/10 py-2">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-1">
          <div className="text-center md:text-left">
            <p className="text-[10px] text-gray-500 font-mono">
              {/* © 2019 PROJECT IDOLY PRIDE */}
              IPXSG PROJECT
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[10px] text-gray-600 font-mono">
              FAN-MADE • NOT AFFILIATED WITH QUALIARTS/CYBERAGENT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<VisualNovel />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
