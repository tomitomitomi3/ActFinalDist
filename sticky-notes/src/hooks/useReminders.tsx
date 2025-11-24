"use client";

import { useEffect } from "react";
import { Note } from "../types";

export function useReminders(notes: Note[], markAsNotified: (id: string) => void) {
  
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      
      const now = Date.now();

      notes.forEach(note => {
        if (!note.vencimiento || note.notificada) return;
        
        const time = new Date(note.vencimiento).getTime();
        
        if (time <= now) {
          
          if (Notification.permission === "granted") {
            const notification = new Notification("⏰ Recordatorio Sticky Notes", {
              body: `La nota "${note.titulo || 'Sin título'}" ha vencido.`,
              icon: "/sticky-note.png", 
              tag: note.id, 
              requireInteraction: true 
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            markAsNotified(note.id);
          } 
          
          else if (Notification.permission !== "denied") {
            console.log("Permiso de notificación no concedido aún.");
          }
        }
      });
    };

    const id = setInterval(checkReminders, 10_000);
    
    return () => clearInterval(id);
  }, [notes, markAsNotified]);
}