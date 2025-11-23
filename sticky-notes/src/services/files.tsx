"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { Note } from "../types";
import { COLORS } from "@/constants";

export const FileService = {
  exportNotes: (notes: Note[]): void => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sticky-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  parseImportedFile: (fileContent: string): Note[] => {
    try {
      const parsed = JSON.parse(fileContent);
      if (!Array.isArray(parsed)) throw new Error("Formato inválido");
      
      // Sanitización y tipado de datos entrantes
      return parsed.map((n: any) => ({
        id: n.id || crypto.randomUUID(),
        titulo: n.titulo || "",
        texto: n.texto || "",
        color: n.color || COLORS[0].hex,
        vencimiento: n.vencimiento || null,
        creadaEn: n.creadaEn || new Date().toISOString(),
        notificada: !!n.notificada
      }));
    } catch (e) {
      throw new Error("No se pudo leer el archivo JSON");
    }
  }
};