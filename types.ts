
export enum Category {
  UNIFORM = 'UNIT BERUNIFORM',
  KELAB = 'KELAB DAN PERSATUAN',
  SUKAN = 'SUKAN DAN PERMAINAN',
  M1S1 = '1M1S'
}

export const SUB_UNITS: Record<Category, string[]> = {
  [Category.UNIFORM]: ['TKRS', 'ST JOHN AMBULANS', 'TUNAS PUTERI', 'PPIM', 'PENGAKAP'],
  [Category.KELAB]: ['FOTOGRAFI', 'KOMPUTER', 'DOKTOR MUDA', 'PRS+KERJAYA', 'KESENIAN&KEBUDAYAAN', 'PENDIDIKAN ISLAM'],
  [Category.SUKAN]: ['RAGBI', 'BOLA SEPAK', 'BOLA BALING', 'BOLA TAMPAR', 'BOLA JARING'],
  [Category.M1S1]: ['RAGBI', 'BOLA SEPAK', 'BOLA BALING', 'BOLA TAMPAR', 'BOLA JARING']
};

export interface Student {
  name: string;
  className: string;
  unit: string;
  category: Category;
  advisor: string;
}

export interface AttendanceRecord {
  id: string;
  category: Category;
  unit: string;
  date: string;
  time: string;
  place: string;
  meetingNo: number;
  advisors: string[];
  attendance: Record<string, boolean>; // student name -> present
  reporterName: string;
  title: string;
  activity: string;
  reflection: string;
  images: string[]; // base64 strings
  createdAt: number;
}

export interface SheetData {
  students: Student[];
  teachers: string[];
}
