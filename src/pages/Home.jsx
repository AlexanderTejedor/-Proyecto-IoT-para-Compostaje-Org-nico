import { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  Bell,
  Flame,
  Droplets,
  Thermometer,
  Wind,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

// Componente de Anillo Circular SVG
function SensorRing({ value, max, unit, label, sublabel, color }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(Number(value) || 0, 0), max);
  const offset = circumference - (clamped / max) * circumference;

  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center text-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 84 84">
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="7"
          />
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-extrabold text-white leading-none">
            {value}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-1">
            {unit}
          </span>
        </div>
      </div>
      <h4 className="text-xs font-bold text-white mt-2.5">{label}</h4>
      <span className="text-[10px] text-slate-500 mt-0.5">{sublabel}</span>
    </div>
  );
}

export default function Home() {
  const [lecturaActual, setLecturaActual] = useState({
    temp_compost: 0,
    hum_suelo: 0,
    temp_ambiente: 0,
    hum_ambiente: 0,
    fecha_hora: "Sin datos",
  });
  const [totalPaquetes, setTotalPaquetes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [toastSync, setToastSync] = useState(false);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);
  const [alertasLeidas, setAlertasLeidas] = useState(false);
  const [errorRed, setErrorRed] = useState(false);

  const panelAlertasRef = useRef(null);

  const obtenerDatos = async (esManual = false) => {
    if (esManual) setSincronizando(true);
    try {
      const res = await fetch("http://localhost:3000/api/compost/historial");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLecturaActual(data[0]);
        setTotalPaquetes(data.length);
        setErrorRed(false);
      }
      if (esManual) {
        setToastSync(true);
        setTimeout(() => setToastSync(false), 2200);
      }
    } catch (error) {
      console.error("Error al sincronizar lecturas:", error);
      setErrorRed(true);
    } finally {
      if (esManual) {
        setTimeout(() => setSincronizando(false), 400);
      }
    }
  };

  useEffect(() => {
    obtenerDatos(false);
    const intervalo = setInterval(() => obtenerDatos(false), 5000);
    return () => clearInterval(intervalo);
  }, []);

  // Cerrar el menú de la campana al hacer clic por fuera
  useEffect(() => {
    const manejarClickExterno = (e) => {
      if (
        panelAlertasRef.current &&
        !panelAlertasRef.current.contains(e.target)
      ) {
        setMostrarAlertas(false);
      }
    };
    document.addEventListener("mousedown", manejarClickExterno);
    return () => document.removeEventListener("mousedown", manejarClickExterno);
  }, []);

  // Generar lista dinámica de alertas biológicas según los sensores
  const generarAlertas = () => {
    const lista = [];

    if (errorRed) {
      lista.push({
        id: "net",
        tipo: "critico",
        titulo: "Sin conexión con API Flask",
        detalle: "Verifica que servidor.py esté corriendo en el puerto 3000.",
      });
      return lista;
    }

    if (lecturaActual.hum_suelo < 40) {
      lista.push({
        id: "hum-baja",
        tipo: "alerta",
        titulo: `Humedad del sustrato baja (${lecturaActual.hum_suelo}%)`,
        detalle:
          "Rango óptimo: 40% - 60%. Se recomienda aplicar riego ligero y mezclar.",
      });
    } else if (lecturaActual.hum_suelo > 60) {
      lista.push({
        id: "hum-alta",
        tipo: "alerta",
        titulo: `Exceso de humedad (${lecturaActual.hum_suelo}%)`,
        detalle:
          "Añade material seco estructurante (hojarasca o aserrín) para evitar anaerobiosis.",
      });
    }

    if (lecturaActual.temp_compost < 45) {
      lista.push({
        id: "temp-baja",
        tipo: "info",
        titulo: `Fase mesófila / arranque (${lecturaActual.temp_compost}°C)`,
        detalle:
          "El núcleo aún no alcanza fase termófila (45°C - 65°C). Mantén monitoreo activo.",
      });
    } else if (lecturaActual.temp_compost > 65) {
      lista.push({
        id: "temp-alta",
        tipo: "critico",
        titulo: `Temperatura crítica en núcleo (${lecturaActual.temp_compost}°C)`,
        detalle:
          "Realiza volteo inmediato para oxigenar y disipar exceso de calor.",
      });
    }

    if (lista.length === 0) {
      lista.push({
        id: "ok",
        tipo: "optimo",
        titulo: "Parámetros biológicos estables",
        detalle:
          "Temperatura y humedad dentro de rangos saludables para compostaje.",
      });
    }

    return lista;
  };

  const alertasActivas = generarAlertas();
  const hayAdvertencias = alertasActivas.some((a) => a.tipo !== "optimo");

  const abrirCampana = () => {
    setMostrarAlertas((prev) => !prev);
    setAlertasLeidas(true);
  };

  const diasSemana = [
    { letra: "L", activo: true },
    { letra: "M", activo: true },
    { letra: "M", activo: true },
    { letra: "J", hoy: true },
    { letra: "V", activo: false },
    { letra: "S", activo: false },
    { letra: "D", activo: false },
  ];

  const requiereRiego = lecturaActual.hum_suelo < 40;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Encabezado Principal + Botones Interactivos */}
      <header className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-slate-400 block">
            Última lectura: {lecturaActual.fecha_hora}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
            Hola, Alexander 👋
          </h2>
        </div>

        <div
          className="flex items-center gap-2.5 relative"
          ref={panelAlertasRef}
        >
          {/* Aviso flotante al recargar manualmente */}
          {toastSync && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full">
              <CheckCircle2 size={13} /> Sincronizado
            </span>
          )}

          {/* Botón 1: Recarga Manual */}
          <button
            onClick={() => obtenerDatos(true)}
            disabled={sincronizando}
            title="Sincronizar lecturas ahora"
            className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-emerald-400 active:scale-95 transition cursor-pointer"
          >
            <RefreshCw
              size={18}
              className={sincronizando ? "animate-spin text-emerald-400" : ""}
            />
          </button>

          {/* Botón 2: Campana de Alertas Biológicas */}
          <button
            onClick={abrirCampana}
            title="Centro de alertas del compostaje"
            className="relative w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-emerald-400 active:scale-95 transition cursor-pointer"
          >
            <Bell size={18} />
            {!alertasLeidas && (
              <span
                className={`absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                  hayAdvertencias ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
            )}
          </button>

          {/* Menú Desplegable de la Campana */}
          {/* Menú Desplegable de la Campana */}
          {mostrarAlertas && (
            <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Diagnóstico y Alertas
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Evaluación automática del lote actual
                  </span>
                </div>
                <button
                  onClick={() => setMostrarAlertas(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-72 overflow-y-auto">
                {alertasActivas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3"
                  >
                    {alerta.tipo === "optimo" ? (
                      <CheckCircle2
                        size={18}
                        className="text-emerald-400 shrink-0 mt-0.5"
                      />
                    ) : (
                      <AlertTriangle
                        size={18}
                        className={`shrink-0 mt-0.5 ${
                          alerta.tipo === "critico"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {alerta.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {alerta.detalle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Banner de Racha / Paquetes en Caché */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Flame size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {totalPaquetes}
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Paquetes en caché
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Monitoreo continuo desde ESP32
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto">
          {diasSemana.map((d, idx) => (
            <div
              key={idx}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0 transition ${
                d.hoy
                  ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20"
                  : d.activo
                    ? "bg-slate-800 text-emerald-400"
                    : "bg-slate-950 border border-slate-800 text-slate-500"
              }`}
            >
              {d.letra}
            </div>
          ))}
        </div>
      </section>

      {/* Grid Principal: Anillos en Tiempo Real + Guía de Control Biológico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tarjeta Izquierda: 4 Sensores */}
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">
                Estado en Tiempo Real
              </h3>
              <p className="text-xs text-slate-400">
                Sensores conectados al Shield ESP32
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En vivo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SensorRing
              value={lecturaActual.temp_compost}
              max={80}
              unit="°C"
              label="Núcleo Compost"
              sublabel="Sonda DS18B20"
              color="#d97706"
            />
            <SensorRing
              value={lecturaActual.hum_suelo}
              max={100}
              unit="%"
              label="Humedad Suelo"
              sublabel="Capacitivo v2.0"
              color="#10b981"
            />
            <SensorRing
              value={lecturaActual.temp_ambiente}
              max={50}
              unit="°C"
              label="Temp. Ambiente"
              sublabel="Sensor DHT22"
              color="#3b82f6"
            />
            <SensorRing
              value={lecturaActual.hum_ambiente}
              max={100}
              unit="%"
              label="Hum. Ambiente"
              sublabel="Sensor DHT22"
              color="#8b5cf6"
            />
          </div>
        </section>

        {/* Tarjeta Derecha: Parámetros Ideales */}
        <section className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              <Sprout size={14} /> Parámetros ideales del lote
            </span>
            <h3 className="text-xl font-bold text-white mt-1.5">
              Guía de Control Biológico
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Mantén estas condiciones fisicoquímicas en la compostera para
              garantizar una fase termófila saludable.
            </p>

            <div className="grid grid-cols-3 gap-2.5 mt-5">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <Flame size={16} className="text-amber-400 mb-1.5" />
                <span className="text-[11px] text-slate-400 block">Núcleo</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">
                  45°C - 65°C
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <Droplets size={16} className="text-emerald-400 mb-1.5" />
                <span className="text-[11px] text-slate-400 block">
                  Sustrato
                </span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">
                  40% - 60%
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <Wind size={16} className="text-blue-400 mb-1.5" />
                <span className="text-[11px] text-slate-400 block">
                  Oxígeno
                </span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">
                  Volteo 48h
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Diagnóstico del sustrato:
            </span>
            {requiereRiego ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <Droplets size={14} /> Requiere Riego
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 size={14} /> Humedad Óptima
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
