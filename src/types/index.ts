export interface Collection {
  id: number;
  name: string;
  description: string | null;
  brickCount: number | null;
  learnedCount: number | null;
  tags: string[];
}

export interface Brick {
  id: number;
  nativeText: string;
  targetText: string;
  targetAudioPath: string;
  targetPron: string | null;
  context: string | null;
  unitType: string;
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

export interface Learner {
  id: number;
  name: string;
  email?: string | null;
  isEmailVerified?: boolean;
  avatarUrl?: string;
}

export interface Snippet {
  id: number;
  content: string;
  translation: string | null;
  contentAudioPath: string | null;
  contentPron: string | null;
  context: string | null;
  isPublic: boolean;
  lastEditAt: string;
  creator: Learner;
  reaction: string | null;
  contributionCount: number;
  tags: string[];
}

export type ActiveTab = "practice" | "collections" | "discover" | "profile";
export type Subview =
  | { type: "addBrick"; collectionId: number }
  | { type: "editBrick"; brick: Brick }
  | null;

export type AuthMode = "login" | "register" | "forgot-password";
export type ForgotPasswordStep = 1 | 2;

export type BrickStatus = "new" | "learned";
export type SortOption = "random" | "newest" | "oldest" | "az" | "za";

export interface AudioContribution {
  id: string;
  author: string;
  avatarUrl?: string;
  audioUrl?: string;
  likes: number;
  isLiked?: boolean;
  isReported?: boolean;
  createdAt: string;
}
