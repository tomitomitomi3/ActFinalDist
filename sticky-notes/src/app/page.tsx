"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
import { useTheme } from "@/hooks/useTheme";
import { useNotes } from "@/hooks/useNotes";
import { useReminders } from "@/hooks/useReminders";
import { Header } from "@/components/Header";
import { NoteCard } from "@/components/NoteCard";
import { FilterType, Note, NoteFormData } from "@/types";
import { FileService } from "@/services/files";
import { NoteForm } from "@/components/NoteForm";
import { FilterBar } from "@/components/FilterBar";

export default function StickyNotesApp() {
  const { isDark, toggleTheme } = useTheme();
  const { notes, addNote, updateNote, deleteNote, importNotes, markAsNotified } = useNotes();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  
  const [filter, setFilter] = useState<FilterType>("todas");
  const [search, setSearch] = useState<string>("");

  useReminders(notes, markAsNotified);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchText = 
        n.titulo.toLowerCase().includes(search.toLowerCase()) || 
        n.texto.toLowerCase().includes(search.toLowerCase());
      
      if (!matchText) return false;
      if (filter === "todas") return true;
      
      const tVenc = n.vencimiento ? new Date(n.vencimiento).getTime() : null;
      const now = Date.now();

      if (filter === "vencidas") return tVenc && tVenc <= now;
      if (filter === "futuras") return tVenc && tVenc > now;
      return true;
    });
  }, [notes, filter, search]);

  const handleSave = (formData: NoteFormData) => {
    if (editingNote) {
      updateNote(editingNote.id, formData);
      setEditingNote(null);
    } else {
      addNote(formData);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExport = () => FileService.exportNotes(notes);

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${isDark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      <Header 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onExport={handleExport}
        onImport={importNotes}
        search={search}
        setSearch={setSearch}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <NoteForm 
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          onSave={handleSave}
          editingNote={editingNote}
          onCancelEdit={() => setEditingNote(null)}
          isDark={isDark}
        />

        <FilterBar 
          currentFilter={filter} 
          setFilter={setFilter} 
          isDark={isDark} 
        />

        {filteredNotes.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <div className="inline-block p-4 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
              <Search size={40} />
            </div>
            <p className="text-lg">No hay notas que mostrar.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filteredNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isDark={isDark} 
                onEdit={handleEditClick} 
                onDelete={deleteNote} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}