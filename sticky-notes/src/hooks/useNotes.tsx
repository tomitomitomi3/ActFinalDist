"use client";

import React, { useEffect, useState, useRef } from "react";
import { StorageService } from "../services/storage";
import { Note, NoteFormData } from "../types";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setNotes(StorageService.getNotes());
  }, []);

  useEffect(() => {
    StorageService.saveNotes(notes);
  }, [notes]);

  const addNote = (noteData: NoteFormData) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      creadaEn: new Date().toISOString(),
      notificada: false,
      titulo: noteData.titulo,
      texto: noteData.texto,
      color: noteData.color,
      vencimiento: noteData.vencimiento || null
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, updatedData: NoteFormData) => {
    setNotes(prev => prev.map(n => n.id === id ? { 
      ...n, 
      ...updatedData, 
      vencimiento: updatedData.vencimiento || null, 
      notificada: false 
    } : n));
  };

  const deleteNote = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta nota?")) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const importNotes = (newNotes: Note[]) => {
    setNotes(prev => [...newNotes, ...prev]);
  };

  const markAsNotified = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, notificada: true } : n));
  };

  return { notes, addNote, updateNote, deleteNote, importNotes, markAsNotified };
}