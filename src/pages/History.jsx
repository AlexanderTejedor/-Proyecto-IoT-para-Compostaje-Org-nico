import { useState, useEffect } from "react";
import {
  Download,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function History() {
  const [registros, setRegistros] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos"); // 'todos' | 'optimo' | 'alerta'
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarHistorial = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/compost/historial");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRegistros(data);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
    const intervalo = setInterval(cargarHistorial, 6000);
    return () => clearInterval(intervalo);
  }, []);

  // Determina si una lectura está en rango estable o requiere atención
  const evaluarEstado = (reg) => {
    const humedadBaja = reg.hum_suelo < 35 || reg.hum_suelo > 70;
    const tempAlta = reg.temp_compost > 68;
    return humedadBaja || tempAlta ? "alerta" : "optimo";
  };

  // Filtrado por estado y búsqueda de fecha/hora
  const registrosFiltrados = registros.filter((reg) => {
    const estado = evaluarEstado(reg);
    const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;
    const coincideTexto =
      !busqueda ||
      reg.fecha_hora?.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(reg.id).includes(busqueda);
    return coincideEstado && coincideTexto;
  });

  // Exportar registros visibles a CSV para informes del semillero
  const exportarCSV = () => {
    if (registrosFiltrados.length === 0) return;
    const encabezados = [
      "ID",
      "Fecha_Hora",
      "Temp_Compost_C",
      "Hum_Suelo_%",
      "Temp_Ambiente_C",
      "Hum_Ambiente_%",
      "Estado",
    ];
    const filas = registrosFiltrados.map((r) => [
      r.id,
      `"${r.fecha_hora}"`,
      r.temp_compost,
      r.hum_suelo,
      r.temp_ambiente,
      r.hum_ambiente,
      evaluarEstado(r).toUpperCase(),
    ]);

    const contenidoCSV = [
      encabezados.join(","),
      ...filas.map((f) => f.join(",")),
    ].join("\n");
    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `bitacora_compost_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Encabezado y botón de exportación */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Bitácora de Telemetría • SQLite
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
            Historial de Lecturas
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={cargarHistorial}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition"
            title="Refrescar registros"
          >
            <RefreshCw
              size={18}
              className={cargando ? "animate-spin text-emerald-400" : ""}
            />
          </button>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </header>

      {/* Barra de búsqueda y píldoras de filtro (Inspirado en referencias móviles) */}
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Buscar por fecha (ej. 2026-11-12) o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex self-start">
          {[
            { id: "todos", label: `Todos (${registros.length})` },
            { id: "optimo", label: "Estables" },
            { id: "alerta", label: "Con Alerta" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroEstado(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filtroEstado === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vista Desktop: Tabla estilizada (oculta en móviles) */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Fecha y Hora</th>
                <th className="py-3.5 px-5">Núcleo (°C)</th>
                <th className="py-3.5 px-5">Hum. Suelo (%)</th>
                <th className="py-3.5 px-5">Ambiente (°C / %)</th>
                <th className="py-3.5 px-5 text-right">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {registrosFiltrados.map((reg) => {
                const esAlerta = evaluarEstado(reg) === "alerta";
                return (
                  <tr
                    key={reg.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono text-slate-500">
                      #{reg.id}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-200 flex items-center gap-2">
                      <Clock size={14} className="text-slate-500" />
                      {reg.fecha_hora}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-amber-400">
                      {reg.temp_compost}°C
                    </td>
                    <td className="py-3.5 px-5 font-bold text-emerald-400">
                      {reg.hum_suelo}%
                    </td>
                    <td className="py-3.5 px-5 text-slate-300">
                      <span className="text-blue-400 font-semibold">
                        {reg.temp_ambiente}°C
                      </span>
                      {" / "}
                      <span className="text-purple-400 font-semibold">
                        {reg.hum_ambiente}%
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {esAlerta ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                          <AlertTriangle size={12} /> Revisar Riego
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                          <CheckCircle2 size={12} /> Estable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista Mobile-First: Lista de tarjetas tipo App (oculta en escritorio) */}
      <div className="md:hidden space-y-3">
        {registrosFiltrados.map((reg) => {
          const esAlerta = evaluarEstado(reg) === "alerta";
          return (
            <div
              key={reg.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                    #{reg.id}
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    {reg.fecha_hora}
                  </span>
                </div>
                {esAlerta ? (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-amber-400"
                    title="Alerta"
                  />
                ) : (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                    title="Estable"
                  />
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">
                    Núcleo
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {reg.temp_compost}°
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">
                    Suelo
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {reg.hum_suelo}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">
                    Aire °C
                  </span>
                  <span className="text-xs font-bold text-blue-400">
                    {reg.temp_ambiente}°
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">
                    Aire %
                  </span>
                  <span className="text-xs font-bold text-purple-400">
                    {reg.hum_ambiente}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {registrosFiltrados.length === 0 && !cargando && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-400">
            No se encontraron registros con ese filtro.
          </p>
        </div>
      )}
    </div>
  );
}
