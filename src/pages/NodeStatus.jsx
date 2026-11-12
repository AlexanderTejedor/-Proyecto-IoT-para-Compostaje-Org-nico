import { useState, useEffect } from "react";
import {
  Cpu,
  Wifi,
  Server,
  Cable,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Thermometer,
  Droplets,
  Sprout,
} from "lucide-react";

export default function NodeStatus() {
  const [estadoApi, setEstadoApi] = useState("verificando"); // 'online' | 'offline' | 'verificando'
  const [ultimaTransmision, setUltimaTransmision] = useState(null);
  const [latenciaMs, setLatenciaMs] = useState(null);

  const verificarNodo = async () => {
    setEstadoApi("verificando");
    const inicio = performance.now();
    try {
      const res = await fetch("http://localhost:3000/api/compost/historial");
      const data = await res.json();
      const fin = performance.now();
      setLatenciaMs(Math.round(fin - inicio));
      setEstadoApi("online");
      if (Array.isArray(data) && data.length > 0) {
        setUltimaTransmision(data[0].fecha_hora);
      }
    } catch (error) {
      setEstadoApi("offline");
      setLatenciaMs(null);
    }
  };

  useEffect(() => {
    verificarNodo();
    const intervalo = setInterval(verificarNodo, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const mapaPines = [
    {
      sensor: "Sonda Temperatura Núcleo",
      modelo: "DS18B20 (Protocolo OneWire)",
      gpio: "GPIO 4 (D4)",
      nota: "Requiere resistencia Pull-Up 4.7 kΩ entre VCC (3.3V) y Datos",
      icon: Thermometer,
      color: "text-amber-400",
    },
    {
      sensor: "Temperatura y Humedad Aire",
      modelo: "DHT22 / AM2302",
      gpio: "GPIO 5 (D5)",
      nota: "Lectura digital del microclima interno de la compostera",
      icon: Droplets,
      color: "text-blue-400",
    },
    {
      sensor: "Humedad de Sustrato",
      modelo: "Sensor Capacitivo v2.0",
      gpio: "GPIO 34 (ADC1)",
      nota: "Entrada analógica calibrada (0% - 100%)",
      icon: Sprout,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Encabezado */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Arquitectura Hardware • Modelo 2.0
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
            Estado del Nodo IoT
          </h2>
        </div>

        <button
          onClick={verificarNodo}
          className="self-start sm:self-auto flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
        >
          <RefreshCw
            size={15}
            className={
              estadoApi === "verificando" ? "animate-spin text-emerald-400" : ""
            }
          />
          Probar Enlace
        </button>
      </header>

      {/* Tarjetas de Topología de Red (3 columnas en escritorio, 1 en móvil) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu size={20} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ESP32 DevKit v1
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Nodo Sensorial</h3>
          <p className="text-xs text-slate-400 mt-1">
            Muestreo cada{" "}
            <span className="text-slate-200 font-semibold">5 segundos</span> vía
            HTTP POST JSON.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Último paquete:</span>
            <span className="text-slate-200 font-mono">
              {ultimaTransmision || "Sin datos"}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wifi size={20} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              WLAN 2.4 GHz
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Transporte Local</h3>
          <p className="text-xs text-slate-400 mt-1">
            Endpoint destino:{" "}
            <span className="text-slate-200 font-mono">/api/compost</span>
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Latencia API local:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {latenciaMs !== null ? `${latenciaMs} ms` : "--"}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Server size={20} />
            </div>
            {estadoApi === "online" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={12} /> Operativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                <AlertCircle size={12} /> Desconectado
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-white">
            Servidor Flask + SQLite
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Persistencia local en{" "}
            <span className="text-slate-200 font-mono">compostaje_iot.db</span>{" "}
            (Puerto 3000).
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Motor de cálculo:</span>
            <span className="text-slate-200 font-semibold">
              SQL AVG() Diario/Semanal
            </span>
          </div>
        </div>
      </div>

      {/* Mapa de Conexiones y Código de Colores del Shield */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Cable size={18} className="text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Asignación de Pines (Pinout ESP32)
              </h3>
              <p className="text-xs text-slate-400">
                Referencia rápida para mantenimiento del prototipo
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mapaPines.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${item.color}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {item.sensor}
                      </h4>
                      <span className="text-xs text-slate-400 block">
                        {item.modelo}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        {item.nota}
                      </span>
                    </div>
                  </div>
                  <span className="self-start sm:self-center font-mono text-xs font-bold bg-slate-900 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                    {item.gpio}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Estándar de Cableado en el Shield */}
        <section className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Código de Colores Shield
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Estándar físico de los arneses conectados a la placa de expansión:
            </p>

            <div className="space-y-3 mt-5">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                  <span className="text-xs font-bold text-slate-200">
                    Cable Rojo
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  VCC (Poder / V)
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500 ring-4 ring-slate-700/30" />
                  <span className="text-xs font-bold text-slate-200">
                    Cable Negro
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  GND (Tierra / G)
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                  <span className="text-xs font-bold text-slate-200">
                    Cable Amarillo
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  DATA (Datos / S)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5">
            <p className="text-[11px] text-emerald-300 leading-relaxed">
              <strong>Nota de alimentación:</strong> Conectar el cable USB-C
              directamente al puerto del ESP32 para garantizar 3.3V estables en
              el bus OneWire.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
