export interface Note {
    id: string;
    titulo: string;
    texto: string;
    color: string;
    vencimiento: string | null;
    creadaEn: string;
    notificada: boolean;
  }
  
  // Tipo para los datos del formulario (sin ID ni metadatos)
 export interface NoteFormData {
    titulo: string;
    texto: string;
    color: string;
    vencimiento: string;
  }
  
 export interface ColorOption {
    id: string;
    hex: string;
    label: string;
  }

export type FilterType = "todas" | "vencidas" | "futuras";