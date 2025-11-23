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
import { Note } from "../types"; // Importas la interfaz
import { STORAGE_KEY } from "../constants";

export const StorageService = {
  getNotes: (): Note[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Error leyendo storage", e);
      return [];
    }
  },
  
  saveNotes: (notes: Note[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },

  getTheme: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("modoOscuro") === "true";
  },

  saveTheme: (isDark: boolean): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("modoOscuro", isDark.toString());
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
};