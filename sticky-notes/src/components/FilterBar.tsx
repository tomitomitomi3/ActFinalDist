"use client";

import { FilterType } from "@/types";
import React, { useEffect, useState, useRef } from "react";

interface FilterBarProps {
  currentFilter: FilterType;
  setFilter: (f: FilterType) => void;
  isDark: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, setFilter, isDark }) => (
  <div className="flex justify-end mb-6">
    <div className={`inline-flex rounded-lg p-1 border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
      {(["todas", "vencidas", "futuras"] as FilterType[]).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-1.5 text-sm rounded-md capitalize transition-all ${
            currentFilter === f 
              ? (isDark ? "bg-slate-700 text-white shadow-sm" : "bg-slate-100 text-slate-900 shadow-sm font-semibold") 
              : "opacity-60 hover:opacity-100"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  </div>
);