export interface Collection {
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
  collectionId: number;
  learned: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type PracticeLang = "en" | "ja" | "vi";

export interface Learner {
  id: number;
  name: string;
  email?: string | null;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  practice_lang?: PracticeLang | string;
  practiceLang?: PracticeLang | string;
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

export type ActiveTab = "practice" | "bricks" | "discover" | "profile";
export type Subview =
  | { type: "addBrick"; collectionId?: number }
  | { type: "editBrick"; brick: Brick }
  | { type: "search" }
  | null;

export type AuthMode = "login" | "register" | "forgot-password";
export type ForgotPasswordStep = 1 | 2;

export type BrickStatus = "new" | "learned";
export type SortOption = "random" | "newest" | "oldest" | "az" | "za";
