"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Calendar
} from "lucide-react";
import { COLORS } from "@/constants";
import { Note, NoteFormData } from "@/types";

interface NoteFormProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onSave: (data: NoteFormData) => void;
  editingNote: Note | null;
  onCancelEdit: () => void;
}

export const NoteForm: React.FC<NoteFormProps> = ({ isOpen, setIsOpen, onSave, editingNote, onCancelEdit }) => {
  const [formData, setFormData] = useState<NoteFormData>({
    titulo: "",
    texto: "",
    color: COLORS[0].hex,
    vencimiento: ""
  });

  useEffect(() => {
    if (editingNote) {
      setFormData({
        titulo: editingNote.titulo,
        texto: editingNote.texto,
        color: editingNote.color,
        vencimiento: editingNote.vencimiento || ""
      });
      setIsOpen(true);
    }
  }, [editingNote, setIsOpen]);

  const reset = () => {
    setFormData({ titulo: "", texto: "", color: COLORS[0].hex, vencimiento: "" });
    if (onCancelEdit) onCancelEdit();
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() && !formData.texto.trim()) return;
    onSave(formData);
    reset();
  };

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        // Agregamos text-slate-600 para que el texto de "Crear..." se vea bien en modo claro
        className="w-full max-w-2xl cursor-text p-4 rounded-xl shadow-sm border flex items-center justify-between group transition-all duration-300 hover:shadow-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mx-auto mb-10 text-slate-600 dark:text-slate-300"
      >
        <span className="font-medium opacity-60 ml-2">Crear una nota nueva...</span>
        <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-yellow-300 dark:group-hover:bg-yellow-500 transition-colors">
          <Plus size={24} className="text-slate-600 dark:text-slate-200" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mx-auto mb-10">
      <div className="p-4 space-y-2">
        <input
          type="text"
          placeholder="Título"
          value={formData.titulo}
          onChange={(e) => setFormData({...formData, titulo: e.target.value})}
          // FIX: Agregamos 'text-slate-900 dark:text-slate-100' explícitamente
          className="w-full bg-transparent text-lg font-bold outline-none placeholder:opacity-50 text-slate-900 dark:text-slate-100"
          autoFocus
        />
        <textarea
          placeholder="Escribe algo..."
          value={formData.texto}
          onChange={(e) => setFormData({...formData, texto: e.target.value})}
          // FIX: Agregamos 'text-slate-900 dark:text-slate-100' explícitamente
          className="w-full bg-transparent outline-none resize-none min-h-[120px] placeholder:opacity-50 text-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="p-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFormData({...formData, color: c.hex})}
                className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${formData.color === c.hex ? "scale-110 ring-2 ring-offset-2 ring-slate-400" : "hover:scale-110"}`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity text-slate-600 dark:text-slate-300">
            <Calendar size={16} />
            <input
              type="datetime-local"
              value={formData.vencimiento}
              onChange={(e) => setFormData({...formData, vencimiento: e.target.value})}
              // FIX: También aseguramos el color en el calendario
              className="bg-transparent outline-none cursor-pointer text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-bold text-slate-900 bg-yellow-300 hover:bg-yellow-400 rounded-lg shadow-sm hover:shadow transition-all"
          >
            {editingNote ? "Guardar" : "Añadir"}
          </button>
        </div>
      </div>
    </form>
  );
};