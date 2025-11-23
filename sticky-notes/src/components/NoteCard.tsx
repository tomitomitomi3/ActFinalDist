"use client";

import { 
  Trash2, 
  Edit2, 
  Bell, 
  Check
} from "lucide-react";
import { Note } from "@/types";

interface NoteCardProps {
  note: Note;
  isDark: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, isDark, onEdit, onDelete }) => {
  const esVencida = note.vencimiento && new Date(note.vencimiento).getTime() <= Date.now();
  
  return (
    <div
      className={`break-inside-avoid relative group rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 ease-out border border-black/5 cursor-default ${isDark ? "text-slate-900" : "text-slate-800"}`}
      style={{ backgroundColor: note.color }}
    >
      {esVencida && !note.notificada && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse z-10">
          Vencida
        </span>
      )}

      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold text-lg leading-tight ${!note.titulo && "opacity-50 italic"}`}>
          {note.titulo || "Sin título"}
        </h3>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(note)} className="p-1.5 rounded-full bg-white/50 hover:bg-white transition" title="Editar">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-1.5 rounded-full bg-white/50 hover:bg-red-500 hover:text-white transition" title="Eliminar">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed mb-4 opacity-90 min-h-[20px]">
        {note.texto}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-2 text-xs font-medium opacity-60">
        <div className="flex items-center gap-1">
          {note.vencimiento ? (
            <span className={`flex items-center gap-1 ${esVencida ? "text-red-600 font-bold" : ""}`}>
              <Bell size={12} />
              {new Date(note.vencimiento).toLocaleDateString()} {new Date(note.vencimiento).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          ) : (
            <span>Sin recordatorio</span>
          )}
        </div>
        
        {note.notificada && (
          <span className="flex items-center gap-1 text-green-700" title="Ya notificada">
            <Check size={12} /> Visto
          </span>
        )}
      </div>
    </div>
  );
};