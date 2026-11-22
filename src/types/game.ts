export type GameScreen = 'LOADING' | 'MENU' | 'INTRO' | 'PLAYING' | 'ENDING' | 'CREDITS';

export type ChapterId = 1 | 2 | 3;

export type Direction = 'down' | 'up' | 'left' | 'right';

export type SpeakerId = 'destiny' | 'kryss' | 'mikey' | 'vana' | 'narrator' | 'shadow';

export type FriendId = 'kryss' | 'mikey' | 'vana';

export type PuzzleId = 'fuse_box' | 'memory_lock' | 'altar_balance';

export type EndingType = 'LIGHT' | 'SHADOW';

export interface TrustScores {
  kryss: number;
  mikey: number;
  vana: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  chapter: ChapterId;
}

export interface DialogueChoice {
  label: string;
  nextNodeId?: string;
  trustDelta?: Partial<TrustScores>;
  setFlag?: string;
  giveItem?: string;
  removeItem?: string;
  requireFlag?: string;
  requireItem?: string;
  triggerEnding?: EndingType;
}

export interface DialogueLine {
  speaker: SpeakerId;
  text: string;
  choices?: DialogueChoice[];
  nextNodeId?: string;
  setFlag?: string;
  giveItem?: string;
  removeItem?: string;
  openPuzzle?: PuzzleId;
  changeChapter?: ChapterId;
  triggerEnding?: EndingType;
  sfx?: 'blip' | 'clue' | 'creak' | 'thunder' | 'chime';
}

export type DialogueTree = Record<string, DialogueLine[]>;

export type ObjectType =
  | 'npc_kryss'
  | 'npc_mikey'
  | 'npc_vana'
  | 'desk'
  | 'bookshelf'
  | 'photo_frame'
  | 'fuse_box'
  | 'door_locked'
  | 'door_next'
  | 'chest'
  | 'clock'
  | 'diary'
  | 'mirror'
  | 'altar'
  | 'shadow_figure'
  | 'candle';

export interface MapObject {
  id: string;
  x: number;
  y: number;
  type: ObjectType;
  label: string;
  solid: boolean;
  npcId?: FriendId;
  hiddenIfFlag?: string;
  requireFlag?: string;
  dialogueId?: string;
  fallbackDialogueId?: string;
}

export interface ChapterMap {
  id: ChapterId;
  title: string;
  subtitle: string;
  objectiveDefault: string;
  width: number;
  height: number;
  /**
   * 0 = dark floorboard, 1 = wall, 2 = carpet/rug, 3 = stone/basement tile, 4 = stairs/threshold
   */
  tiles: number[][];
  spawn: { x: number; y: number };
  ambientHex: string;
  darknessAlpha: number;
  lightRadius: number;
  objects: MapObject[];
}

export interface SaveSlotData {
  slot: number;
  gameTitle: 'ХУВЬ ТАВИЛАН';
  chapter: ChapterId;
  chapterTitle: string;
  timestamp: string;
  playerPos: { x: number; y: number };
  direction: Direction;
  inventory: string[];
  flags: Record<string, boolean>;
  trust: TrustScores;
}

export interface FriendProfile {
  id: FriendId;
  name: string;
  role: string;
  personality: string;
  secretHint: string;
  color: string;
  accentHex: string;
}
