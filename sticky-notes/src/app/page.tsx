"use client";

import React, { useEffect, useState, useRef } from "react";

/*
  Aplicacion 9: Notas Adhesivas con Recordatorios (componente React de archivo unico en Next.js)
  - Diseno: clases de Tailwind CSS (no es necesario importar en el componente)
  - Persistencia: localStorage (simulacion de exportacion/importacion JSON basada en archivo)
  - IDs: crypto.randomUUID() para identificadores seguros
  - Recordatorios: API de Notificaciones del Navegador + indicador dentro de la aplicacion. Se revisa cada 30s mientras la app esta abierta.

  Limitaciones y decisiones tecnicas:
  1. Las notificaciones del sistema solo se muestran si el navegador lo permite
     y la pagina esta abierta o en segundo plano. No se implementa Service Worker / Push.
  2. Las notas tienen una propiedad `notificada` para evitar multiples avisos.
  3. La persistencia principal es localStorage bajo la clave `notas_adhesivas_v1`.
  4. Se pueden importar/exportar notas en formato JSON simple: arreglo de objetos.
  5. Se priorizo un codigo claro, mantenible y seguro (validaciones, try/catch en I/O).

  Uso:
  - Crear nota -> completar titulo, texto, color y vencimiento.
  - Exportar -> descarga un archivo notas-export-YYYYMMDD-HHMMSS.json
  - Importar -> selecciona un archivo JSON valido (se fusiona, IDs duplicadas se regeneran)
  - Editar / Eliminar notas
  - Las notas vencidas muestran una marca y disparan notificacion (si hay permiso)
*/

const CLAVE_STORAGE = "notas_adhesivas_v1";

function ahoraIsoLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

export default function NotasAdhesivasApp() {
  const [notas, setNotas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [color, setColor] = useState("#fff59d");
  const [vencimiento, setVencimiento] = useState("");
  const [idEditando, setIdEditando] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const refArchivo = useRef(null);

  // Cargar notas desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setNotas(parsed);
      }
    } catch (e) {
      console.error("Error cargando notas:", e);
    }
  }, []);

  // Guardar notas en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(notas));
    } catch (e) {
      console.error("Error guardando notas:", e);
    }
  }, [notas]);

  // Solicitar permiso de notificacion una sola vez
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default")
      Notification.requestPermission().catch(() => {});
  }, []);

  // Verificador de recordatorios (cada 30s)
  useEffect(() => {
    const revisar = () => {
      const ahora = Date.now();
      setNotas((prev) => {
        let cambiado = false;
        const siguiente = prev.map((n) => {
          if (!n.vencimiento) return n;
          if (n.notificada) return n;
          const tiempoVenc = new Date(n.vencimiento).getTime();
          if (!isFinite(tiempoVenc)) return n;
          if (tiempoVenc <= ahora) {
            // Mostrar notificacion
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification(n.titulo || "Recordatorio", {
                  body: n.texto
                    ? n.texto.length > 120
                      ? n.texto.slice(0, 120) + "..."
                      : n.texto
                    : "Recordatorio: nota vencida",
                });
              } catch (e) {
                console.warn("No se pudo lanzar notificacion:", e);
              }
            }
            cambiado = true;
            return { ...n, notificada: true };
          }
          return n;
        });
        return cambiado ? siguiente : prev;
      });
    };

    revisar();
    const id = setInterval(revisar, 30_000);
    return () => clearInterval(id);
  }, []);

  function limpiarFormulario() {
    setTitulo("");
    setTexto("");
    setColor("#fff59d");
    setVencimiento("");
    setIdEditando(null);
  }

  function crearOActualizarNota(e) {
    e.preventDefault();
    const tituloLimpio = titulo.trim();
    const textoLimpio = texto.trim();
    if (!tituloLimpio && !textoLimpio)
      return alert("Ingresa titulo o texto");

    if (idEditando) {
      setNotas((prev) =>
        prev.map((n) =>
          n.id === idEditando
            ? {
                ...n,
                titulo: tituloLimpio,
                texto: textoLimpio,
                color,
                vencimiento: vencimiento || null,
              }
            : n
        )
      );
    } else {
      const id =
        crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()) + Math.random().toString(36).slice(2, 9);
      const nota = {
        id,
        titulo: tituloLimpio,
        texto: textoLimpio,
        color,
        vencimiento: vencimiento || null,
        creadaEn: new Date().toISOString(),
        notificada: false,
      };
      setNotas((prev) => [nota, ...prev]);
    }
    limpiarFormulario();
  }

  function editarNota(nota) {
    setIdEditando(nota.id);
    setTitulo(nota.titulo);
    setTexto(nota.texto);
    setColor(nota.color || "#fff59d");
    setVencimiento(nota.vencimiento ? isoLocalDesde(nota.vencimiento) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function isoLocalDesde(venc) {
    const dt = new Date(venc);
    if (!isFinite(dt)) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return (
      dt.getFullYear() +
      "-" +
      pad(dt.getMonth() + 1) +
      "-" +
      pad(dt.getDate()) +
      "T" +
      pad(dt.getHours()) +
      ":" +
      pad(dt.getMinutes())
    );
  }

  function eliminarNota(id) {
    if (!confirm("Eliminar nota?")) return;
    setNotas((prev) => prev.filter((n) => n.id !== id));
  }

  function exportarNotas() {
    const data = JSON.stringify(notas, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    const t = new Date();
    const nombre = `notas-export-${t.getFullYear()}${String(
      t.getMonth() + 1
    ).padStart(2, "0")}${String(t.getDate()).padStart(2, "0")}-${String(
      t.getHours()
    ).padStart(2, "0")}${String(t.getMinutes()).padStart(2, "0")}.json`;
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function activarImportacion() {
    if (refArchivo.current) refArchivo.current.click();
  }

  function manejarImportacion(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed))
          throw new Error("Formato invalido: se esperaba un arreglo");
        setNotas((prev) => {
          const idsExistentes = new Set(prev.map((p) => p.id));
          const nuevas = parsed.map((n) => {
            const segura = {
              id:
                n?.id ||
                (crypto && crypto.randomUUID
                  ? crypto.randomUUID()
                  : String(Date.now()) +
                    Math.random().toString(36).slice(2, 9)),
              titulo: (n?.titulo || "").slice(0, 200),
              texto: (n?.texto || "").slice(0, 5000),
              color: n?.color || "#fff59d",
              vencimiento: n?.vencimiento || null,
              creadaEn: n?.creadaEn || new Date().toISOString(),
              notificada: !!n?.notificada,
            };
            if (idsExistentes.has(segura.id))
              segura.id =
                crypto && crypto.randomUUID
                  ? crypto.randomUUID()
                  : String(Date.now()) +
                    Math.random().toString(36).slice(2, 9);
            return segura;
          });
          return [...nuevas, ...prev];
        });
        alert("Importacion completa");
      } catch (err) {
        alert("Error al importar: " + (err?.message || err));
      }
    };
    reader.onerror = () => alert("No se pudo leer el archivo");
    reader.readAsText(f);
    e.target.value = "";
  }

  function marcarComoNoNotificada(id) {
    setNotas((prev) =>
      prev.map((n) => (n.id === id ? { ...n, notificada: false } : n))
    );
  }

  const filtradas = notas.filter((n) => {
    if (filtro === "todas") return true;
    if (filtro === "vencidas")
      return n.vencimiento && new Date(n.vencimiento).getTime() <= Date.now();
    if (filtro === "futuras")
      return n.vencimiento && new Date(n.vencimiento).getTime() > Date.now();
    return true;
  });

  const [modoOscuro, setModoOscuro] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("modoOscuro") === "true"
      : false
  );

  useEffect(() => {
    localStorage.setItem("modoOscuro", modoOscuro.toString());
  }, [modoOscuro]);

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        modoOscuro
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* ---------------------- CABECERA ---------------------- */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            Sticky Notes
          </h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={exportarNotas}
              className="px-3 py-1 rounded shadow hover:brightness-95 bg-white dark:bg-gray-800"
            >
              Exportar 
            </button>
            <button
              onClick={activarImportacion}
              className="px-3 py-1 rounded shadow bg-white dark:bg-gray-800"
            >
              Importar 
            </button>

            {/* Input oculto para seleccionar el archivo JSON */}
            <input
              ref={refArchivo}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={manejarImportacion}
            />

            {/* Botón para eliminar todas las notas */}
            <button
              onClick={() => {
                if (confirm("¿Vaciar todas las notas?")) {
                  setNotas([]);
                }
              }}
              className="px-3 py-1 rounded shadow bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100"
            >
              Eliminar todo
            </button>

            {/* Botón para cambiar modo claro / oscuro */}
            <button
              onClick={() => setModoOscuro(!modoOscuro)}
              className="px-3 py-1 rounded shadow bg-white dark:bg-gray-800"
            >
              {modoOscuro ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* ---------------------- FORMULARIO ---------------------- */}
        <form
          onSubmit={crearOActualizarNota}
          className={`p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 ${
            modoOscuro ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Columna izquierda: título y texto */}
          <div className="md:col-span-2">
            <input
              className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded h-28 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>

          {/* Columna derecha: color, vencimiento, botones */}
          <div className="flex flex-col gap-2">
            <label className="text-sm">Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />

            <label className="text-sm mt-2">Fecha de vencimiento</label>
            <input
              type="datetime-local"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600"
            />

            <div className="mt-auto flex gap-2">
              <button
                className="px-3 py-1 rounded bg-indigo-600 text-white"
                type="submit"
              >
                {idEditando ? "Guardar" : "Crear"}
              </button>
              <button
                type="button"
                onClick={limpiarFormulario}
                className="px-3 py-1 rounded border dark:border-gray-500"
              >
                Limpiar
              </button>
            </div>
          </div>
        </form>

        {/* ---------------------- FILTRO ---------------------- */}
        <section className="flex items-center justify-between mb-4">
          <div className="flex gap-2 items-center">
            <label className="text-sm">Filtrar:</label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="todas">Todas</option>
              <option value="vencidas">Vencidas / hoy</option>
              <option value="futuras">Vencimiento futuro</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Notas: {notas.length}
          </div>
        </section>

        {/* ---------------------- LISTADO DE NOTAS ---------------------- */}
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Si no hay notas */}
          {filtradas.length === 0 && (
            <div className="col-span-full text-center text-gray-500 p-8 bg-white dark:bg-gray-800 rounded">
              Sin notas 
            </div>
          )}

          {/* Mostrar notas filtradas */}
          {filtradas.map((n) => {
            const tiempoVenc = n.vencimiento
              ? new Date(n.vencimiento).getTime()
              : null;
            const estaVencida =
              tiempoVenc && tiempoVenc <= Date.now();

            return (
              <article
                key={n.id}
                className={`relative rounded p-4 shadow cursor-default transition-all ${
                  modoOscuro ? "text-gray-100" : "text-gray-900"
                }`}
                style={{
                  background: n.color || (modoOscuro ? "#3b3b3b" : "#fff59d"),
                }}
              >
                {/* Encabezado de la nota */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-medium text-lg">
                    {n.titulo || "(sin título)"}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      title="Editar"
                      onClick={() => editarNota(n)}
                      className="px-2 py-1 rounded bg-white/80 dark:bg-gray-700"
                    >
                      ✏️
                    </button>
                    <button
                      title="Eliminar"
                      onClick={() => eliminarNota(n.id)}
                      className="px-2 py-1 rounded bg-white/80 dark:bg-gray-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Texto de la nota */}
                <p className="mt-2 whitespace-pre-wrap">{n.texto}</p>

                {/* Pie de la nota: vencimiento y notificación */}
                <div className="mt-3 text-xs flex justify-between items-center">
                  <div>
                    {n.vencimiento ? (
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          estaVencida
                            ? "bg-red-600 text-white"
                            : "bg-white/70 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {new Date(n.vencimiento).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">
                        Sin vencimiento
                      </span>
                    )}
                  </div>

                  {/* Indicador de notificación */}
                  <div className="flex items-center gap-2">
                    {n.notificada && (
                      <span
                        title="Notificada"
                        className="text-xs px-2 py-0.5 bg-white/80 dark:bg-gray-700 rounded"
                      >
                        🔔
                      </span>
                    )}
                    {n.notificada && (
                      <button
                        onClick={() => marcarComoNoNotificada(n.id)}
                        className="text-xs underline"
                      >
                        reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Marca visual si está vencida */}
                {estaVencida && (
                  <div className="absolute -top-2 -right-2 px-2 text-xs rounded-bl bg-red-700 text-white">
                    VENCIDA
                  </div>
                )}
              </article>
            );
          })}
        </main>

        {/* ---------------------- PIE ---------------------- */}
        <footer className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          Esta es la mejor app de sticky notes.
        </footer>
      </div>
    </div>
  );
  }
