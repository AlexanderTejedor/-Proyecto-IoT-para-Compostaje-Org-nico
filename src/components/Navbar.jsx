import { Home, BarChart3, Clock, Cpu, Sprout, Sun, Moon } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
}) {
  const navItems = [
    { id: "home", label: "Hoy", icon: Home },
    { id: "analytics", label: "Analítica", icon: BarChart3 },
    { id: "history", label: "Historial", icon: Clock },
    { id: "node", label: "Nodo IoT", icon: Cpu },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
                <Sprout size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-bold text-base text-white leading-tight">
                  Compost IoT
                </h1>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Modelo 2.0 • Activo
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Botón de cambio de tema (Desktop) */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:border-emerald-500/40 transition"
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? (
                <>
                  <Sun size={16} className="text-amber-400" />
                  Modo Claro
                </>
              ) : (
                <>
                  <Moon size={16} className="text-blue-400" />
                  Modo Oscuro
                </>
              )}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {theme === "dark" ? "Off" : "On"}
            </span>
          </button>
        </div>
      </aside>

      {/* Bottom Bar Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 px-2 py-2 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                isActive ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Botón de tema en móvil */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400"
          title="Cambiar tema"
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-amber-400" />
          ) : (
            <Moon size={20} className="text-blue-400" />
          )}
          <span>Tema</span>
        </button>
      </nav>
    </>
  );
}
