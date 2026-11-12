import { useState, useEffect } from "react";
import { Bell, Sprout, Flame, Droplets, Wind, RefreshCw } from "lucide-react";
import CircularMetric from "../components/CircularMetric";

export default function Home() {
  const [lecturaActual, setLecturaActual] = useState(null);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/compost/historial");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLecturaActual(data[0]);
        setTotalRegistros(data.length);
      }
    } catch (err) {
      console.error("Error conectando con la API:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const diasSemana = ["L", "M", "M", "J", "V", "S", "D"];
  const diaActualIndex = 3; // Jueves

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Encabezado al estilo App Móvil */}
      <header className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block">
            {lecturaActual
              ? `Última lectura: ${lecturaActual.fecha_hora}`
              : "Sincronizando nodo..."}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
            Hola, Equipo 👋
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarDatos}
            className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition"
            title="Actualizar lectura"
          >
            <RefreshCw
              size={18}
              className={cargando ? "animate-spin text-emerald-400" : ""}
            />
          </button>
          <div className="relative p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      </header>

      {/* Píldoras de racha semanal (Inspirado en tu referencia 1) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Flame size={26} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {totalRegistros}
              </span>
              <span className="text-xs font-semibold text-emerald-400 uppercase">
                paquetes en caché
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Monitoreo continuo desde ESP32
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {diasSemana.map((dia, idx) => {
            const activo = idx <= diaActualIndex;
            const esHoy = idx === diaActualIndex;
            return (
              <div
                key={idx}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  esHoy
                    ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20"
                    : activo
                      ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-950 text-slate-600 border border-slate-800"
                }`}
              >
                {dia}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid principal responsivo: 1 columna en móvil, 12 columnas en Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tarjeta de Anillos en Tiempo Real (Inspirado en referencias 1 y 4) */}
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Estado en Tiempo Real
              </h3>
              <p className="text-xs text-slate-400">
                Sensores conectados al Shield RPW-LED
              </p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En vivo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CircularMetric
              label="Núcleo Compost"
              value={lecturaActual?.temp_compost}
              unit="°C"
              max={70}
              color="text-amber-400"
              subtext="Sonda DS18B20"
            />
            <CircularMetric
              label="Humedad Suelo"
              value={lecturaActual?.hum_suelo}
              unit="%"
              max={100}
              color="text-emerald-400"
              subtext="Capacitivo v2.0"
            />
            <CircularMetric
              label="Temp. Ambiente"
              value={lecturaActual?.temp_ambiente}
              unit="°C"
              max={50}
              color="text-blue-400"
              subtext="Sensor DHT22"
            />
            <CircularMetric
              label="Hum. Ambiente"
              value={lecturaActual?.hum_ambiente}
              unit="%"
              max={100}
              color="text-purple-400"
              subtext="Sensor DHT22"
            />
          </div>
        </section>

        {/* Tarjeta Guía de Parámetros del Compost (Inspirado en referencia PlantShop) */}
        <section className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sprout size={16} />
              <span>Parámetros Ideales del Lote</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Guía de Control Biológico
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Mantén estas condiciones fisicoquímicas en la compostera para
              garantizar una fase termófila saludable.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 my-5">
            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
              <Flame size={16} className="text-amber-400 mb-1" />
              <span className="text-[11px] text-slate-400 block">Núcleo</span>
              <span className="text-xs font-bold text-white">45°C - 65°C</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
              <Droplets size={16} className="text-emerald-400 mb-1" />
              <span className="text-[11px] text-slate-400 block">Sustrato</span>
              <span className="text-xs font-bold text-white">40% - 60%</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
              <Wind size={16} className="text-blue-400 mb-1" />
              <span className="text-[11px] text-slate-400 block">Oxígeno</span>
              <span className="text-xs font-bold text-white">Volteo 48h</span>
            </div>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">
              Diagnóstico del sustrato:
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {lecturaActual && lecturaActual.hum_suelo < 35
                ? "💧 Requiere Riego"
                : "✅ Humedad Estable"}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
