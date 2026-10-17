export interface Island {
  id: number;
  name: string;
  description: string | null;
  brickCount: number | null;
  learnedCount: number | null;
  tags: string[];
}

export type TargetLang = "en" | "ja" | "vi";

export interface Brick {
  id: number;
  nativeText: string;
  targetText: string;
  targetLang?: TargetLang | string;
  targetAudioPath: string;
  targetPron: string | null;
  context: string | null;
  kind: string;
  isPrivate: boolean;
  lastEditAt: string;
  tags: string[];
  islandId: number;
  learned: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type RetrievalLang = "en" | "ja" | "vi";

export interface Learner {
  id: number;
  name: string;
  email?: string | null;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  retrieval_lang?: RetrievalLang | string;
  retrievalLang?: RetrievalLang | string;
}

export interface DiscoverVideo {
  id: string;
  ytbVideoId: string;
  title: string;
  channel: string;
  start: number;
  duration: number;
  transcript: string;
  translation: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
}

export interface BrickInitialData {
  nativeText?: string;
  targetText?: string;
  targetLang?: TargetLang | string;
  pronunciation?: string | null;
  context?: string | null;
  kind?: string;
  tags?: string[];
  audioBlob?: Blob | null;
  audioUrl?: string | null;
  islandId?: number;
}

export type ActiveTab = "retrieval" | "bricks" | "discover" | "profile";
export type Subview =
  | { type: "addBrick"; islandId?: number; initialData?: BrickInitialData }
  | { type: "editBrick"; brick: Brick }
  | { type: "search" }
  | null;

export type AuthMode = "login" | "register" | "forgot-password";
export type ForgotPasswordStep = 1 | 2;

export type BrickStatus = "new" | "learned";
export type SortOption = "random" | "newest" | "oldest" | "az" | "za";
