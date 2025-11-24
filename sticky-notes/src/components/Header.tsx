"use client";

import React, { useEffect, useState, useRef } from "react";
import { Note } from "@/types";
import { FileService } from "../services/files";
import { 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Search,
  BellRing // Agregamos icono para la alerta
} from "lucide-react";

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onExport: () => void;
  onImport: (notes: Note[]) => void;
  search: string;
  setSearch: (s: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, onExport, onImport, search, setSearch }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  // 1. Verificar estado de permisos al cargar
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // 2. Función para pedir permiso manual
  const requestPermission = () => {
    if (!("Notification" in window)) {
      alert("Tu navegador no soporta notificaciones.");
      return;
    }

    Notification.requestPermission().then((newPermission) => {
      setPermission(newPermission);
      if (newPermission === "granted") {
        new Notification("¡Notificaciones activadas!", {
          body: "Te avisaremos cuando tus notas venzan.",
        });
      }
    });
  };

  const handleImportClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const content = ev.target?.result as string;
          const notes = FileService.parseImportedFile(content);
          onImport(notes);
          alert(`Se importaron ${notes.length} notas.`);
        } catch(err: any) {
          alert(err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }
  };

  return (
    <header className={`sticky top-0 z-20 backdrop-blur-md border-b ${isDark ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-300 rounded-lg shadow-sm flex items-center justify-center transform -rotate-6">
            <span className="text-lg">📝</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">Sticky Notes</h1>
        </div>

        <div className="flex items-center gap-3">
          
          {/* Barra de búsqueda */}
          <div className={`flex items-center px-3 py-1.5 rounded-full border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
            <Search size={16} className="opacity-50 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent outline-none text-sm w-24 sm:w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Botón de Activar Notificaciones (Solo si es necesario) */}
          {permission === "default" && (
            <button
              onClick={requestPermission}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm animate-pulse"
              title="Activar recordatorios para recibir alertas"
            >
              <BellRing size={14} />
              <span>Activar Avisos</span>
            </button>
          )}

          {/* Botones de acción */}
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
            
            <button onClick={onExport} title="Exportar" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
              <Download size={20} />
            </button>
            
            <label title="Importar" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer">
              <Upload size={20} />
              <input type="file" accept=".json" onChange={handleImportClick} className="hidden" ref={fileRef} />
            </label>
          </div>
        </div>
      </div>
    </header>
  );
};