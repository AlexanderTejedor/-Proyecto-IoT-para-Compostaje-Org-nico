# Sistema de Monitoreo IoT para Compostaje (Modelo 2.0)

Plataforma integral de telemetría y analítica ambiental diseñada por nosotros como equipo para el monitoreo en tiempo real de procesos de compostaje. El sistema captura variables críticas del sustrato y microclima mediante un nodo sensor basado en ESP32, almacena los registros en una API REST con Flask y SQLite, y despliega los indicadores en un Dashboard responsivo (Mobile-First) construido con React y Tailwind CSS.

## Arquitectura del Proyecto

```text
ProyectoIoTCompostaje/
├── CodigoESP/
│   ├── ompostera_IoT/          # Firmware C++ (PlatformIO / ESP32)
│   └── servidorLocal/          # Backend Python (Flask + SQLite)
└── cuerpoDelProyecto/
    └── dashboard-compost/      # Frontend Web (React + Vite + Tailwind CSS + Recharts)
```

## Especificaciones de Hardware y Pinout

- **Microcontrolador:** ESP32 DevKit v1 + Shield de Expansión
- **Código de colores de arneses:**
  - **Rojo:** VCC (Poder / 3.3V o 5V)
  - **Negro:** GND (Tierra)
  - **Amarillo:** DATA (Datos / Señal)
- **Asignación de sensores:**
  - **DS18B20 (Temperatura de núcleo):** `GPIO 4` (con resistencia pull-up de 4.7 kΩ entre 3.3V y Datos)
  - **DHT22 (Temperatura y humedad ambiental):** `GPIO 5`
  - **Sensor Capacitivo v2.0 (Humedad del sustrato):** `GPIO 34` (ADC)

## Instalación y Puesta en Marcha

### 1. Firmware (ESP32)

1. Abrir la carpeta `CodigoESP/ompostera_IoT` en VS Code con la extensión **PlatformIO**.
2. Configurar las credenciales de red Wi-Fi (2.4 GHz) y la IP local del servidor en `src/main.cpp`:

```cpp
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASSWORD_WIFI";
String serverName = "[http://192.168.](http://192.168.)X.X:3000/api/compost";
```

3. Conectar el cable USB-C directamente al puerto del ESP32, compilar y cargar el código mediante **PlatformIO: Upload**.

### 2. Backend (Flask + SQLite)

1. Navegar a `CodigoESP/servidorLocal` e instalar las dependencias:

```bash
pip3 install Flask flask-cors
```

2. Ejecutar el servidor local en el puerto `3000`:

```bash
python3 servidor.py
```

### 3. Frontend (React + Vite)

1. Navegar a `cuerpoDelProyecto/dashboard-compost` e instalar los paquetes:

```bash
npm install
```

2. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

3. Abrir `http://localhost:5173` en el navegador.

## Vistas del Dashboard

- **Hoy (`Home.jsx`):** Anillos circulares en tiempo real, racha de paquetes recibidos y guía rápida de control biológico.
- **Analítica (`Analytics.jsx`):** Cálculo automático de promedios diarios y semanales, curva de tendencia térmica/hídrica y comparativa frente a rangos óptimos.
- **Historial (`History.jsx`):** Bitácora filtrable por estado con exportación directa a formato CSV.
- **Nodo IoT (`NodeStatus.jsx`):** Diagnóstico de latencia, estado de conexión con la API y documentación física de pines y código de colores.

## Endpoints de la API

- `POST /api/compost` — Recibe el paquete JSON desde el ESP32 cada 5 segundos y lo almacena en `compostaje_iot.db`.
- `GET /api/compost/historial` — Retorna las últimas 50 lecturas ordenadas cronológicamente.
- `GET /api/compost/analitica` — Calcula y retorna los promedios del día actual y de los últimos 7 días.
