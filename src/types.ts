export type BrickStatus = 'new' | 'reviewing' | 'mastered';

export interface Brick {
  id: string;
  nativeText: string;     // English, e.g. "Where is the library?"
  targetText: string;     // Spanish, e.g. "¿Dónde está la biblioteca?"
  pronunciation?: string;  // Phonetic spelling, e.g. "/¿don-de es-ta la bi-blio-te-ca?/"
  status: BrickStatus;
  tags: string[];
  collectionId: string;
  pronunciationScore?: number;
  accuracyScore?: number;
  audioUrl?: string;      // Simulated audio file recording
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;           // e.g. "Travel Phrases"
  iconName: string;       // Lucide icon name, e.g. "Plane"
  tags: string[];
  color: string;          // e.g. "secondary" | "primary" | "tertiary"
  description: string;
  progress: number;       // Percent mastered
}

export interface LearningSession {
  totalBricks: number;
  completedBricks: number;
  scoreSum: number;
}
