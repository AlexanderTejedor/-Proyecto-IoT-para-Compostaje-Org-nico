import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, Thermometer, Droplets } from "lucide-react";

export default function Analytics() {
  const [analitica, setAnalitica] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [periodo, setPeriodo] = useState("diario"); // 'diario' | 'semanal'

  useEffect(() => {
    const cargarAnalitica = async () => {
      try {
        const [resAnalitica, resHistorial] = await Promise.all([
          fetch("http://localhost:3000/api/compost/analitica"),
          fetch("http://localhost:3000/api/compost/historial"),
        ]);

        const dataAnalitica = await resAnalitica.json();
        const dataHistorial = await resHistorial.json();

        setAnalitica(dataAnalitica);

        if (Array.isArray(dataHistorial)) {
          // Invertimos para que la gráfica avance cronológicamente de izquierda a derecha
          const ordenCronologico = [...dataHistorial].reverse().map((item) => ({
            ...item,
            horaCorta: item.fecha_hora
              ? item.fecha_hora.split(" ")[1]?.slice(0, 5)
              : "",
          }));
          setHistorial(ordenCronologico);
        }
      } catch (error) {
        console.error("Error cargando analítica:", error);
      }
    };

    cargarAnalitica();
    const intervalo = setInterval(cargarAnalitica, 8000);
    return () => clearInterval(intervalo);
  }, []);

  const datosActivos = analitica?.[periodo] || {};

  // Datos formateados para la gráfica de barras comparativa
  const datosBarras = [
    {
      name: "Núcleo (°C)",
      valor: datosActivos.prom_temp_compost ?? 0,
      ideal: 55,
    },
    {
      name: "Ambiente (°C)",
      valor: datosActivos.prom_temp_ambiente ?? 0,
      ideal: 25,
    },
    {
      name: "Suelo (%)",
      valor: datosActivos.prom_hum_suelo ?? 0,
      ideal: 50,
    },
    {
      name: "Aire (%)",
      valor: datosActivos.prom_hum_ambiente ?? 0,
      ideal: 65,
    },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Encabezado y Selector de Periodo (Inspirado en referencia Today/Upcoming) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Inteligencia de Datos • Semillero
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
            Analítica y Promedios
          </h2>
        </div>

        {/* Selector tipo píldora */}
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex self-start sm:self-auto">
          <button
            onClick={() => setPeriodo("diario")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              periodo === "diario"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calendar size={14} />
            Promedio Diario
          </button>
          <button
            onClick={() => setPeriodo("semanal")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              periodo === "semanal"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp size={14} />
            Promedio Semanal
          </button>
        </div>
      </header>

      {/* Tarjetas de Resumen de Promedios (4 KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Prom. Núcleo
            </span>
            <Thermometer size={18} />
          </div>
          <p className="text-2xl font-extrabold text-white">
            {datosActivos.prom_temp_compost !== null &&
            datosActivos.prom_temp_compost !== undefined
              ? `${datosActivos.prom_temp_compost}°C`
              : "--"}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {datosActivos.total_lecturas || 0} muestras procesadas
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Prom. Hum. Suelo
            </span>
            <Droplets size={18} />
          </div>
          <p className="text-2xl font-extrabold text-white">
            {datosActivos.prom_hum_suelo !== null &&
            datosActivos.prom_hum_suelo !== undefined
              ? `${datosActivos.prom_hum_suelo}%`
              : "--"}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Rango óptimo: 40% - 60%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Prom. Temp. Aire
            </span>
            <Thermometer size={18} />
          </div>
          <p className="text-2xl font-extrabold text-white">
            {datosActivos.prom_temp_ambiente !== null &&
            datosActivos.prom_temp_ambiente !== undefined
              ? `${datosActivos.prom_temp_ambiente}°C`
              : "--"}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Microclima interno
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Prom. Hum. Aire
            </span>
            <Droplets size={18} />
          </div>
          <p className="text-2xl font-extrabold text-white">
            {datosActivos.prom_hum_ambiente !== null &&
            datosActivos.prom_hum_ambiente !== undefined
              ? `${datosActivos.prom_hum_ambiente}%`
              : "--"}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Sensor ambiental DHT22
          </span>
        </div>
      </div>

      {/* Gráficas Responsivas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfica 1: Curva de Evolución Térmica y Humedad */}
        <section className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">
              Curva de Tendencia (Últimas 50 lecturas)
            </h3>
            <p className="text-xs text-slate-400">
              Comparativa entre Temperatura del Núcleo (°C) y Humedad del
              Sustrato (%)
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historial}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="horaCorta"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temp_compost"
                  name="Temp. Núcleo (°C)"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                />
                <Area
                  type="monotone"
                  dataKey="hum_suelo"
                  name="Hum. Suelo (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHum)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Gráfica 2: Barras Comparativas Real vs Ideal */}
        <section className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Real vs. Óptimo</h3>
            <p className="text-xs text-slate-400">
              Promedio {periodo} frente a meta biológica
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosBarras}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#1e293b", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="valor"
                  name="Promedio Actual"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="ideal"
                  name="Meta Óptima"
                  fill="#334155"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
