"use client";

import { useEffect } from "react";
import { Note } from "../types";

export function useReminders(notes: Note[], markAsNotified: (id: string) => void) {
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      notes.forEach(note => {
        if (!note.vencimiento || note.notificada) return;
        const time = new Date(note.vencimiento).getTime();
        
        if (time <= now) {
          alert(`⏰ ¡RECORDATORIO!\n\nNota: "${note.titulo || 'Sin título'}"\nHa llegado a su fecha de vencimiento.`);
          markAsNotified(note.id);
        }
      });
    };

    const id = setInterval(checkReminders, 10_000);
    return () => clearInterval(id);
  }, [notes, markAsNotified]);
}