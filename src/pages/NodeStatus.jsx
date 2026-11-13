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
  Terminal,
  Activity,
} from "lucide-react";

export default function NodeStatus() {
  const [estadoApi, setEstadoApi] = useState("verificando"); // 'online' | 'offline' | 'verificando'
  const [ultimoPaquete, setUltimoPaquete] = useState(null);
  const [latenciaMs, setLatenciaMs] = useState(null);
  const [segundosDesdeEnvio, setSegundosDesdeEnvio] = useState(null);
  const [mensajeTest, setMensajeTest] = useState(null);

  const verificarNodo = async (esManual = false) => {
    setEstadoApi("verificando");
    if (esManual) setMensajeTest(null);

    const inicio = performance.now();
    try {
      // Si es manual, damos 500ms para que la animación de testeo sea visible
      if (esManual) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const res = await fetch("http://localhost:3000/api/compost/historial");
      const data = await res.json();
      const fin = performance.now();
      const ping = Math.max(1, Math.round(fin - inicio - (esManual ? 500 : 0)));

      setLatenciaMs(ping);
      setEstadoApi("online");

      if (Array.isArray(data) && data.length > 0) {
        const ultimo = data[0];
        setUltimoPaquete(ultimo);

        // Calcular hace cuántos segundos entró el último registro del ESP32
        const fechaRegistro = new Date(ultimo.fecha_hora.replace(" ", "T"));
        const diffSegundos = Math.max(
          0,
          Math.round((Date.now() - fechaRegistro.getTime()) / 1000),
        );
        setSegundosDesdeEnvio(diffSegundos);

        if (esManual) {
          setMensajeTest({
            tipo: diffSegundos <= 20 ? "ok" : "warn",
            texto:
              diffSegundos <= 20
                ? `Test exitoso: API respondió en ${ping} ms • ESP32 activo (último paquete hace ${diffSegundos}s).`
                : `API activa (${ping} ms), pero el ESP32 no reporta datos hace ${diffSegundos}s.`,
          });
        }
      } else if (esManual) {
        setMensajeTest({
          tipo: "warn",
          texto: `API Flask conectada (${ping} ms), pero la base de datos aún no tiene lecturas.`,
        });
      }
    } catch (error) {
      setEstadoApi("offline");
      setLatenciaMs(null);
      if (esManual) {
        setMensajeTest({
          tipo: "error",
          texto:
            "Error de enlace: No se pudo conectar con servidor.py en el puerto 3000.",
        });
      }
    }
  };

  useEffect(() => {
    verificarNodo(false);
    const intervalo = setInterval(() => verificarNodo(false), 8000);
    return () => clearInterval(intervalo);
  }, []);

  const espActivo =
    estadoApi === "online" &&
    segundosDesdeEnvio !== null &&
    segundosDesdeEnvio <= 20;

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
          onClick={() => verificarNodo(true)}
          disabled={estadoApi === "verificando"}
          className="self-start sm:self-auto flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={estadoApi === "verificando" ? "animate-spin" : ""}
          />
          {estadoApi === "verificando"
            ? "Verificando enlace..."
            : "Probar Enlace"}
        </button>
      </header>

      {/* Banner de resultado cuando el usuario pulsa "Probar Enlace" */}
      {mensajeTest && (
        <div
          className={`rounded-2xl p-4 border flex items-center justify-between gap-3 text-xs font-semibold ${
            mensajeTest.tipo === "ok"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : mensajeTest.tipo === "warn"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-red-500/15 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Activity size={16} className="shrink-0" />
            <span>{mensajeTest.texto}</span>
          </div>
          <button
            onClick={() => setMensajeTest(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Tarjetas de Topología de Red (Las 3 capas del sistema) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Capa 1: Hardware ESP32 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu size={20} />
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                espActivo
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
              }`}
            >
              {espActivo ? "Transmitiendo" : "En espera"}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">
            1. Nodo Sensorial (ESP32)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Muestreo cada{" "}
            <span className="text-slate-200 font-semibold">5 segundos</span> vía
            HTTP POST JSON.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Último paquete:</span>
            <span className="text-slate-200 font-mono">
              {ultimoPaquete?.fecha_hora || "Sin datos"}
            </span>
          </div>
        </div>

        {/* Capa 2: Red Local WiFi */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wifi size={20} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              WLAN 2.4 GHz
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">2. Transporte Local</h3>
          <p className="text-xs text-slate-400 mt-1">
            Endpoint destino:{" "}
            <span className="text-slate-200 font-mono">/api/compost</span>
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Latencia API (Ping):</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {latenciaMs !== null ? `${latenciaMs} ms` : "--"}
            </span>
          </div>
        </div>

        {/* Capa 3: Servidor Backend */}
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
            3. Servidor Flask + SQLite
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Persistencia local en{" "}
            <span className="text-slate-200 font-mono">compostaje_iot.db</span>{" "}
            (Puerto 3000).
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Hace cuánto reportó:</span>
            <span className="text-slate-200 font-semibold">
              {segundosDesdeEnvio !== null
                ? `Hace ${segundosDesdeEnvio}s`
                : "--"}
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

      {/* Nuevo Bloque: Inspector de Telemetría JSON en Vivo */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Inspector de Payload JSON (Última Trama)
              </h3>
              <p className="text-xs text-slate-400">
                Estructura exacta recibida en el endpoint POST /api/compost
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            ID #{ultimoPaquete?.id ?? "--"}
          </span>
        </div>

        <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
          {ultimoPaquete
            ? JSON.stringify(
                {
                  id_registro: ultimoPaquete.id,
                  timestamp: ultimoPaquete.fecha_hora,
                  payload: {
                    temp_compost: ultimoPaquete.temp_compost,
                    hum_suelo: ultimoPaquete.hum_suelo,
                    temp_ambiente: ultimoPaquete.temp_ambiente,
                    hum_ambiente: ultimoPaquete.hum_ambiente,
                  },
                },
                null,
                2,
              )
            : "// Esperando primera trama JSON desde el ESP32..."}
        </pre>
      </section>
    </div>
  );
}
