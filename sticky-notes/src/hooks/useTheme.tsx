"use client";

import React, { useEffect, useState, useRef } from "react";
import { StorageService } from "../services/storage";
import { Note, NoteFormData } from "../types";

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    setIsDark(StorageService.getTheme());
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newVal = !prev;
      StorageService.saveTheme(newVal);
      return newVal;
    });
  };

  return { isDark, toggleTheme };
}