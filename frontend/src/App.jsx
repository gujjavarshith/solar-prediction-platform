import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BuildingHistory from "./pages/BuildingHistory";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/buildings/:id" element={<BuildingHistory />} />
      </Routes>
    </BrowserRouter>
  );
}
