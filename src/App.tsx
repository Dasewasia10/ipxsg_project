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
