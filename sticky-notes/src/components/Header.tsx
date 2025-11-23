"use client";

import React, { useEffect, useState, useRef } from "react";
import { Note } from "@/types";
import { FileService } from "../services/files"
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Bell, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Calendar, 
  Search,
  Check
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-300 rounded-lg shadow-sm flex items-center justify-center transform -rotate-6">
            <span className="text-lg">📝</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">Sticky Notes</h1>
        </div>

        <div className="flex items-center gap-3">
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