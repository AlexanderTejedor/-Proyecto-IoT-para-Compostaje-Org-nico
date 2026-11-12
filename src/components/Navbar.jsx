import { Home, BarChart3, Clock, Cpu } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "home", label: "Hoy", icon: Home },
    { id: "analytics", label: "Analítica", icon: BarChart3 },
    { id: "history", label: "Historial", icon: Clock },
    { id: "node", label: "Nodo IoT", icon: Cpu },
  ];

  return (
    <>
      {/* Navegación Móvil: Barra flotante inferior */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-full px-6 py-3 shadow-2xl flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive
                  ? "text-emerald-400 scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`p-2 rounded-full ${isActive ? "bg-emerald-500/20" : ""}`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Navegación Desktop: Sidebar izquierdo fijo */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 min-h-screen p-5 select-none">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            🌱
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Compost IoT
            </h1>
            <span className="text-[11px] text-emerald-400 font-medium">
              Modelo 2.0 • Semillero
            </span>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">
            Estado del Servidor
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-200">
              API Puerto 3000
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
