import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import NodeStatus from "./pages/NodeStatus";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col md:flex-row font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6 md:px-8 md:py-8">
        {activeTab === "home" && <Home />}
        {activeTab === "analytics" && <Analytics />}
        {activeTab === "history" && <History />}
        {activeTab === "node" && <NodeStatus />}
      </main>
    </div>
  );
}
