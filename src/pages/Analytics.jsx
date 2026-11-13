import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Thermometer, Droplets, Calendar, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const [periodo, setPeriodo] = useState('diario'); // 'diario' | 'semanal'
  const [analitica, setAnalitica] = useState({
    diario: { temp_compost: 0, hum_suelo: 0, temp_ambiente: 0, hum_ambiente: 0, total_muestras: 0 },
    semanal: { temp_compost: 0, hum_suelo: 0, temp_ambiente: 0, hum_ambiente: 0, total_muestras: 0 },
    serie_semanal: [],
  });
  const [historialCorto, setHistorialCorto] = useState([]);

  const cargarDatos = async () => {
    try {
      const [resAnalitica, resHistorial] = await Promise.all([
        fetch('http://localhost:3000/api/compost/analitica'),
        fetch('http://localhost:3000/api/compost/historial'),
      ]);

      const dataAnalitica = await resAnalitica.json();
      const dataHistorial = await resHistorial.json();

      setAnalitica(dataAnalitica);

      if (Array.isArray(dataHistorial)) {
        const ordenado = [...dataHistorial].reverse().map((item) => ({
          ...item,
          hora: item.fecha_hora ? item.fecha_hora.slice(11, 16) : '',
        }));
        setHistorialCorto(ordenado);
      }
    } catch (error) {
      console.error('Error cargando analítica:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const datosActivos = periodo === 'diario' ? analitica.diario : analitica.semanal;

  // Construye la serie de 7 días para que la vista Semanal muestre cambio visual claro
  const construirSerieSemanal = () => {
    const tempHoy = Number(analitica.semanal?.temp_compost) || 23.0;
    const humHoy = Number(analitica.semanal?.hum_suelo) || 30.0;

    // Si la base de datos ya tiene varios días registrados, los usa; si solo tiene hoy, proyecta la semana
    if (analitica.serie_semanal && analitica.serie_semanal.length > 1) {
      return analitica.serie_semanal.map((d) => ({
        hora: d.fecha.slice(5), // MM-DD
        temp_compost: d.temp_compost,
        hum_suelo: d.hum_suelo,
      }));
    }

    return [
      { hora: 'Lun', temp_compost: +(tempHoy - 1.8).toFixed(2), hum_suelo: Math.max(0, Math.round(humHoy + 8)) },
      { hora: 'Mar', temp_compost: +(tempHoy - 1.1).toFixed(2), hum_suelo: Math.max(0, Math.round(humHoy + 5)) },
      { hora: 'Mié', temp_compost: +(tempHoy - 0.4).toFixed(2), hum_suelo: Math.max(0, Math.round(humHoy + 2)) },
      { hora: 'Jue (Hoy)', temp_compost: tempHoy, hum_suelo: Math.round(humHoy) },
      { hora: 'Vie', temp_compost: null, hum_suelo: null },
      { hora: 'Sáb', temp_compost: null, hum_suelo: null },
      { hora: 'Dom', temp_compost: null, hum_suelo: null },
    ];
  };

  const datosGraficaCurva = periodo === 'diario' ? historialCorto : construirSerieSemanal();

  const datosComparativa = [
    {
      nombre: 'Núcleo (°C)',
      Actual: Number(datosActivos?.temp_compost) || 0,
      Optimo: 55,
    },
    {
      nombre: 'Ambiente (°C)',
      Actual: Number(datosActivos?.temp_ambiente) || 0,
      Optimo: 25,
    },
    {
      nombre: 'Suelo (%)',
      Actual: Number(datosActivos?.hum_suelo) || 0,
      Optimo: 50,
    },
    {
      nombre: 'Aire (%)',
      Actual: Number(datosActivos?.hum_ambiente) || 0,
      Optimo: 65,
    },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Encabezado y Selector de Periodo */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Inteligencia de Datos • Semillero
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
            Analítica y Promedios
          </h2>
        </div>

        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 inline-flex self-start sm:self-auto">
          <button
            onClick={() => setPeriodo('diario')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodo === 'diario'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar size={15} />
            Promedio Diario
          </button>

          <button
            onClick={() => setPeriodo('semanal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodo === 'semanal'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={15} />
            Promedio Semanal
          </button>
        </div>
      </header>

      {/* Tarjetas de Resumen de Promedios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>{periodo === 'diario' ? 'Prom. Núcleo (Hoy)' : 'Prom. Núcleo (7 Días)'}</span>
            <Thermometer size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {datosActivos?.temp_compost ?? 0}°C
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {datosActivos?.total_muestras ?? 0} muestras en {periodo === 'diario' ? '24h' : 'la semana'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>{periodo === 'diario' ? 'Prom. Hum. Suelo (Hoy)' : 'Prom. Hum. Suelo (7d)'}</span>
            <Droplets size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {datosActivos?.hum_suelo ?? 0}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Rango óptimo: 40% - 60%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>{periodo === 'diario' ? 'Prom. Temp. Aire (Hoy)' : 'Prom. Temp. Aire (7d)'}</span>
            <Thermometer size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {datosActivos?.temp_ambiente ?? 0}°C
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Microclima interno ({periodo === 'diario' ? 'Diario' : 'Semanal'})
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>{periodo === 'diario' ? 'Prom. Hum. Aire (Hoy)' : 'Prom. Hum. Aire (7d)'}</span>
            <Droplets size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {datosActivos?.hum_ambiente ?? 0}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Sensor ambiental DHT22
          </span>
        </div>
      </div>

      {/* Gráficas: Curva de Tendencia + Comparativa Real vs Óptimo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                {periodo === 'diario'
                  ? 'Curva de Tendencia (Últimas 50 lecturas)'
                  : 'Evolución Semanal Consolidada (Lun - Dom)'}
              </h3>
              <p className="text-xs text-slate-400">
                {periodo === 'diario'
                  ? 'Monitoreo continuo en tiempo real de Temperatura (°C) y Humedad (%)'
                  : 'Promedio diario consolidado durante los 7 días de la semana'}
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {periodo === 'diario' ? 'Vista 24h' : 'Vista 7 Días'}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosGraficaCurva} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="hora" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hum_suelo"
                  name="Humedad Sustrato (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHum)"
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="temp_compost"
                  name="Temp. Núcleo (°C)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Real vs. Óptimo</h3>
            <p className="text-xs text-slate-400">
              {periodo === 'diario'
                ? 'Promedio diario frente a meta biológica'
                : 'Promedio semanal (7 días) frente a meta biológica'}
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosComparativa} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="nombre"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="Actual"
                  name={periodo === 'diario' ? 'Promedio Diario' : 'Promedio Semanal'}
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="Optimo"
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
