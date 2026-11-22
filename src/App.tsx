import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Backpack, Pause, Volume2, VolumeX } from 'lucide-react';
import { CHAPTER_MAPS } from './data/maps';
import { DIALOGUE_TREES } from './data/dialogues';
import { GAME_TITLE, INVENTORY_ITEMS } from './data/itemsAndFriends';
import { renderGameScene, TILE_SIZE } from './engine/pixelRenderer';
import { soundEngine } from './audio/soundEngine';
import {
  ChapterId,
  DialogueChoice,
  DialogueLine,
  Direction,
  EndingType,
  GameScreen,
  MapObject,
  PuzzleId,
  SaveSlotData,
  TrustScores,
} from './types/game';
import { DialogueBox } from './components/DialogueBox';
import { MobileControls } from './components/MobileControls';
import { PuzzleModal } from './components/PuzzleModal';
import { InventoryModal } from './components/InventoryModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import {
  CreditsScreen,
  EndingScreen,
  IntroScreen,
  LoadingScreen,
  MainMenuScreen,
} from './components/Screens';

const INITIAL_TRUST: TrustScores = { kryss: 0, mikey: 0, vana: 0 };

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('LOADING');
  const [chapter, setChapter] = useState<ChapterId>(1);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(CHAPTER_MAPS[1].spawn);
  const [direction, setDirection] = useState<Direction>('down');
  const [walkFrame, setWalkFrame] = useState(0);

  const [inventory, setInventory] = useState<string[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [trust, setTrust] = useState<TrustScores>(INITIAL_TRUST);
  const [ending, setEnding] = useState<EndingType>('LIGHT');

  // Active overlays
  const [dialogueQueue, setDialogueQueue] = useState<{
    nodeId: string;
    index: number;
  } | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<PuzzleId | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [saveModalMode, setSaveModalMode] = useState<'save' | 'load' | null>(null);
  const [toast, setToast] = useState<string>('');
  const [muted, setMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const holdDirRef = useRef<Direction | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  const currentMap = CHAPTER_MAPS[chapter];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
    if (!next && screen === 'PLAYING') {
      soundEngine.startAmbience();
    }
  };

  // Reset new game state
  const startNewGame = useCallback(() => {
    setChapter(1);
    setPlayerPos(CHAPTER_MAPS[1].spawn);
    setDirection('down');
    setInventory([]);
    setFlags({});
    setTrust({ ...INITIAL_TRUST });
    setDialogueQueue(null);
    setActivePuzzle(null);
    setShowInventory(false);
    setShowPause(false);
    setScreen('INTRO');
  }, []);

  const beginChapter1 = useCallback(() => {
    setScreen('PLAYING');
    if (!muted) soundEngine.startAmbience();
    setDialogueQueue({ nodeId: 'ch1_kryss_talk', index: 0 });
  }, [muted]);

  const handleLoadSlot = useCallback(
    (slot: SaveSlotData) => {
      setChapter(slot.chapter);
      setPlayerPos(slot.playerPos);
      setDirection(slot.direction);
      setInventory(slot.inventory);
      setFlags(slot.flags);
      setTrust(slot.trust);
      setSaveModalMode(null);
      setShowPause(false);
      setDialogueQueue(null);
      setActivePuzzle(null);
      setScreen('PLAYING');
      if (!muted) soundEngine.startAmbience();
      showToast(`${slot.slot}-р хадгалалт ачаалагдлаа.`);
    },
    [muted, showToast]
  );

  // Determine nearby interactable object in front of or adjacent to player
  const nearbyObject: MapObject | null = useMemo(() => {
    const delta: Record<Direction, { dx: number; dy: number }> = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 },
    };
    const frontX = playerPos.x + delta[direction].dx;
    const frontY = playerPos.y + delta[direction].dy;

    const visible = currentMap.objects.filter(
      (o) => !o.hiddenIfFlag || !flags[o.hiddenIfFlag]
    );

    const exact = visible.find((o) => o.x === frontX && o.y === frontY);
    if (exact) return exact;

    return (
      visible.find(
        (o) => Math.abs(o.x - playerPos.x) + Math.abs(o.y - playerPos.y) === 1
      ) ?? null
    );
  }, [currentMap.objects, direction, flags, playerPos]);

  const canMoveTo = useCallback(
    (nx: number, ny: number): boolean => {
      if (nx < 0 || ny < 0 || nx >= currentMap.width || ny >= currentMap.height) {
        return false;
      }
      if (currentMap.tiles[ny][nx] === 1) return false;
      const blockedByObj = currentMap.objects.some(
        (o) => o.solid && (!o.hiddenIfFlag || !flags[o.hiddenIfFlag]) && o.x === nx && o.y === ny
      );
      return !blockedByObj;
    },
    [currentMap, flags]
  );

  const stepMove = useCallback(
    (dir: Direction) => {
      if (screen !== 'PLAYING' || dialogueQueue || activePuzzle || showInventory || showPause || saveModalMode) {
        return;
      }
      const now = performance.now();
      if (now - lastMoveTimeRef.current < 135) return;
      lastMoveTimeRef.current = now;

      setDirection(dir);
      const delta: Record<Direction, { dx: number; dy: number }> = {
        up: { dx: 0, dy: -1 },
        down: { dx: 0, dy: 1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 },
      };
      const nx = playerPos.x + delta[dir].dx;
      const ny = playerPos.y + delta[dir].dy;

      if (canMoveTo(nx, ny)) {
        setPlayerPos({ x: nx, y: ny });
        setWalkFrame((f) => f + 1);
        soundEngine.playStep();
      }
    },
    [activePuzzle, canMoveTo, dialogueQueue, playerPos, saveModalMode, screen, showInventory, showPause]
  );

  // Continuous hold movement (touch or keyboard)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (holdDirRef.current) {
        stepMove(holdDirRef.current);
      }
    }, 145);
    return () => window.clearInterval(interval);
  }, [stepMove]);

  const applyLineSideEffects = useCallback(
    (line: DialogueLine) => {
      if (line.sfx && line.sfx !== 'blip') {
        soundEngine.playSfx(line.sfx);
      }
      if (line.setFlag) {
        setFlags((prev) => ({ ...prev, [line.setFlag!]: true }));
      }
      if (line.giveItem) {
        setInventory((prev) => {
          if (prev.includes(line.giveItem!)) return prev;
          const item = INVENTORY_ITEMS[line.giveItem!];
          if (item) showToast(`Эд зүйл олдлоо: ${item.name}`);
          return [...prev, line.giveItem!];
        });
      }
      if (line.removeItem) {
        setInventory((prev) => prev.filter((id) => id !== line.removeItem));
      }
    },
    [showToast]
  );

  const openDialogueNode = useCallback(
    (nodeId: string) => {
      const lines = DIALOGUE_TREES[nodeId];
      if (!lines || lines.length === 0) return;
      setDialogueQueue({ nodeId, index: 0 });
      applyLineSideEffects(lines[0]);
    },
    [applyLineSideEffects]
  );

  const handleInteract = useCallback(() => {
    if (screen !== 'PLAYING' || activePuzzle || showInventory || showPause || saveModalMode) return;
    if (dialogueQueue) return;
    if (!nearbyObject) return;

    soundEngine.playSfx('click');

    // Special conditional triggers on doors / shadow
    if (nearbyObject.id === 'ch1_door' || nearbyObject.id === 'ch1_door_r') {
      if (flags.power_restored && inventory.includes('study_key')) {
        openDialogueNode('ch1_door_unlocked_transition');
        return;
      }
    }

    if (nearbyObject.id === 'ch2_door' || nearbyObject.id === 'ch2_door_r') {
      if (flags.ch2_chest_opened) {
        openDialogueNode('ch2_door_unlocked_transition');
        return;
      }
    }

    if (nearbyObject.type === 'shadow_figure' || nearbyObject.id === 'ch3_door' || nearbyObject.id === 'ch3_door_r') {
      if (flags.ch3_altar_solved) {
        openDialogueNode('ch3_final_confrontation');
        return;
      }
    }

    if (nearbyObject.type === 'fuse_box' && flags.power_restored) {
      showToast('Цахилгаан самбар хэвийн ажиллаж байна.');
      return;
    }

    if (nearbyObject.type === 'chest' && flags.ch2_chest_opened) {
      showToast('Архивын төмөр авдар аль хэдийн нээгдсэн байна.');
      return;
    }

    if (nearbyObject.type === 'altar' && flags.ch3_altar_solved) {
      showToast('Гурван Сүлд нэгдсэн байна. Өнгөрсний Сүүдэртэй нүүр тул!');
      return;
    }

    if (nearbyObject.dialogueId) {
      openDialogueNode(nearbyObject.dialogueId);
    }
  }, [
    activePuzzle,
    dialogueQueue,
    flags,
    inventory,
    nearbyObject,
    openDialogueNode,
    saveModalMode,
    screen,
    showInventory,
    showPause,
    showToast,
  ]);

  const activeDialogueLine: DialogueLine | null = useMemo(() => {
    if (!dialogueQueue) return null;
    const lines = DIALOGUE_TREES[dialogueQueue.nodeId];
    return lines?.[dialogueQueue.index] ?? null;
  }, [dialogueQueue]);

  const finishLineTransitions = useCallback(
    (line: DialogueLine) => {
      if (line.openPuzzle) {
        setDialogueQueue(null);
        setActivePuzzle(line.openPuzzle);
        return true;
      }
      if (line.changeChapter) {
        const nextChap = line.changeChapter;
        setDialogueQueue(null);
        setChapter(nextChap);
        setPlayerPos(CHAPTER_MAPS[nextChap].spawn);
        setDirection('down');
        showToast(CHAPTER_MAPS[nextChap].title);
        return true;
      }
      if (line.triggerEnding) {
        setDialogueQueue(null);
        soundEngine.stopAmbience();
        setEnding(line.triggerEnding);
        setScreen('ENDING');
        return true;
      }
      return false;
    },
    [showToast]
  );

  const handleAdvanceDialogue = useCallback(() => {
    if (!dialogueQueue || !activeDialogueLine) return;
    if (finishLineTransitions(activeDialogueLine)) return;

    const lines = DIALOGUE_TREES[dialogueQueue.nodeId];
    const nextIdx = dialogueQueue.index + 1;
    if (lines && nextIdx < lines.length) {
      setDialogueQueue({ nodeId: dialogueQueue.nodeId, index: nextIdx });
      applyLineSideEffects(lines[nextIdx]);
    } else if (activeDialogueLine.nextNodeId) {
      openDialogueNode(activeDialogueLine.nextNodeId);
    } else {
      setDialogueQueue(null);
    }
  }, [activeDialogueLine, applyLineSideEffects, dialogueQueue, finishLineTransitions, openDialogueNode]);

  const handleSelectChoice = useCallback(
    (choice: DialogueChoice) => {
      if (choice.trustDelta) {
        setTrust((prev) => ({
          kryss: prev.kryss + (choice.trustDelta?.kryss ?? 0),
          mikey: prev.mikey + (choice.trustDelta?.mikey ?? 0),
          vana: prev.vana + (choice.trustDelta?.vana ?? 0),
        }));
      }
      if (choice.setFlag) {
        setFlags((prev) => ({ ...prev, [choice.setFlag!]: true }));
      }
      if (choice.giveItem) {
        setInventory((prev) => (prev.includes(choice.giveItem!) ? prev : [...prev, choice.giveItem!]));
      }
      if (choice.triggerEnding) {
        setDialogueQueue(null);
        soundEngine.stopAmbience();
        setEnding(choice.triggerEnding);
        setScreen('ENDING');
        return;
      }
      if (choice.nextNodeId) {
        openDialogueNode(choice.nextNodeId);
      } else {
        setDialogueQueue(null);
      }
    },
    [openDialogueNode]
  );

  const handleSolvePuzzle = useCallback(
    (puzzleId: PuzzleId) => {
      setActivePuzzle(null);
      if (puzzleId === 'fuse_box') {
        setFlags((prev) => ({ ...prev, power_restored: true }));
        showToast('Гэрэл аслаа! Ажлын өрөөний хаалганы түгжээг шалгаарай.');
      } else if (puzzleId === 'memory_lock') {
        setFlags((prev) => ({ ...prev, ch2_chest_opened: true }));
        setInventory((prev) =>
          prev.includes('silver_locket') ? prev : [...prev, 'silver_locket']
        );
        showToast('Авдар нээгдлээ! Мөнгөн Медальон олдлоо.');
      } else if (puzzleId === 'altar_balance') {
        setFlags((prev) => ({ ...prev, ch3_altar_solved: true }));
        showToast('Гурван Сүлд нэгдлээ! Одоо Сүүдэртэй нүүр тулна уу.');
        openDialogueNode('ch3_final_confrontation');
      }
    },
    [openDialogueNode, showToast]
  );

  // Keyboard Listeners
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: 'up',
      w: 'up',
      W: 'up',
      ArrowDown: 'down',
      s: 'down',
      S: 'down',
      ArrowLeft: 'left',
      a: 'left',
      A: 'left',
      ArrowRight: 'right',
      d: 'right',
      D: 'right',
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'PLAYING') return;

      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        holdDirRef.current = dir;
        stepMove(dir);
        return;
      }

      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        if (!dialogueQueue && !activePuzzle && !showInventory && !showPause && !saveModalMode) {
          e.preventDefault();
          handleInteract();
        }
      } else if (e.key === 'i' || e.key === 'I') {
        if (!dialogueQueue && !activePuzzle && !showPause && !saveModalMode) {
          setShowInventory((v) => !v);
        }
      } else if (e.key === 'Escape') {
        if (saveModalMode) setSaveModalMode(null);
        else if (showInventory) setShowInventory(false);
        else if (activePuzzle) setActivePuzzle(null);
        else if (!dialogueQueue) setShowPause((v) => !v);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir && holdDirRef.current === dir) {
        holdDirRef.current = null;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    activePuzzle,
    dialogueQueue,
    handleInteract,
    saveModalMode,
    screen,
    showInventory,
    showPause,
    stepMove,
  ]);

  // Canvas 60fps animation loop
  useEffect(() => {
    if (screen !== 'PLAYING') return;
    let rafId = 0;

    const draw = (timeMs: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderGameScene(ctx, {
            map: currentMap,
            playerPos,
            direction,
            walkFrame,
            timeMs,
            flags,
            nearbyObject,
          });
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [currentMap, direction, flags, nearbyObject, playerPos, screen, walkFrame]);

  // Dynamic objective text
  const currentObjective = useMemo(() => {
    if (chapter === 1) {
      if (!flags.power_restored) {
        return 'Зүүн хойд талын цахилгаан самбарыг асааж, найзуудтайгаа ярилц.';
      }
      if (!inventory.includes('study_key')) {
        return 'Зэвэрсэн түлхүүрийг олж (баруун доод шүүгээ), хойд хаалгыг нээ.';
      }
      return 'Ажлын өрөөний хойд хаалга руу оч.';
    }
    if (chapter === 2) {
      if (!flags.ch2_chest_opened) {
        return 'Зураг, захидал, цагнаас 4 оронтой код цуглуулж төмөр авдрыг нээ.';
      }
      return 'Баруун хойд талын зоорийн шат руу буу.';
    }
    if (!flags.ch3_altar_solved) {
      return 'Mikey-ээс дэнлүү, зүүн толиноос хэлтэрхий авч Гурван Сүлдний тавцанг тэнцвэржүүл.';
    }
    return 'Өнгөрсний Сүүдэртэй нүүр тулж эцсийн сонголтоо хий.';
  }, [chapter, flags, inventory]);

  return (
    <div className="h-full w-full bg-[#07080d] text-[#e8e2d5] relative overflow-hidden flex flex-col">
      {screen === 'LOADING' && <LoadingScreen onDone={() => setScreen('MENU')} />}

      {screen === 'MENU' && (
        <MainMenuScreen
          onNewGame={startNewGame}
          onOpenLoad={() => setSaveModalMode('load')}
          onOpenCredits={() => setScreen('CREDITS')}
          muted={muted}
          onToggleMute={toggleMute}
        />
      )}

      {screen === 'INTRO' && <IntroScreen onStartChapter1={beginChapter1} />}

      {screen === 'CREDITS' && <CreditsScreen onBack={() => setScreen('MENU')} />}

      {screen === 'ENDING' && (
        <EndingScreen
          ending={ending}
          trust={trust}
          onRestart={startNewGame}
          onMainMenu={() => setScreen('MENU')}
        />
      )}

      {screen === 'PLAYING' && (
        <div className="h-full w-full flex flex-col justify-between max-w-4xl mx-auto px-2 sm:px-4 py-2 gap-1.5">
          {/* Compact Top HUD */}
          <header className="pixel-panel px-3 py-2 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-pixel-title text-[10px] sm:text-xs text-amber-300 truncate">
                  {GAME_TITLE}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-[11px] sm:text-xs text-slate-200 font-semibold truncate">
                  {currentMap.title}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate mt-0.5">
                Зорилго: {currentObjective}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleMute}
                className="pixel-btn p-2 text-slate-200"
                aria-label="Дуу"
              >
                {muted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
              </button>
              <button
                type="button"
                onClick={() => setShowInventory(true)}
                className="pixel-btn px-2.5 py-2 text-xs text-slate-200 hidden sm:inline-flex items-center gap-1.5"
              >
                <Backpack className="w-4 h-4 text-amber-300" />
                <span>Цүнх ({inventory.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPause(true)}
                className="pixel-btn px-2.5 py-2 text-xs text-slate-200 hidden sm:inline-flex items-center gap-1.5"
              >
                <Pause className="w-4 h-4" />
                <span>Цэс</span>
              </button>
            </div>
          </header>

          {/* Main Pixel-Art Viewport */}
          <main className="relative flex-1 min-h-0 flex items-center justify-center">
            <div className="relative w-full h-full max-h-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={currentMap.width * TILE_SIZE}
                height={currentMap.height * TILE_SIZE}
                className="pixelated max-w-full max-h-full w-auto h-auto aspect-[18/12] border-2 border-[#343a52] bg-[#07080d] shadow-2xl"
              />

              {/* Toast Banner */}
              {toast && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pixel-panel px-4 py-2 text-xs sm:text-sm text-amber-200 whitespace-nowrap">
                  {toast}
                </div>
              )}

              {/* Nearby Object Label Pill-free indicator */}
              {nearbyObject && !activeDialogueLine && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-[#0d1018]/90 border border-amber-400/60 px-3 py-1 text-xs text-amber-100 whitespace-nowrap">
                  {nearbyObject.label} · [E / Шалгах]
                </div>
              )}

              {/* Dialogue Overlay */}
              {activeDialogueLine && (
                <div className="absolute inset-x-2 bottom-2 z-30">
                  <DialogueBox
                    line={activeDialogueLine}
                    onAdvance={handleAdvanceDialogue}
                    onSelectChoice={handleSelectChoice}
                  />
                </div>
              )}
            </div>
          </main>

          {/* Touch Controls & Desktop Hint */}
          <footer className="shrink-0">
            <MobileControls
              onMove={(dir) => {
                holdDirRef.current = dir;
                stepMove(dir);
              }}
              onStopMove={() => {
                holdDirRef.current = null;
              }}
              onInteract={handleInteract}
              onOpenInventory={() => setShowInventory(true)}
              onOpenPause={() => setShowPause(true)}
              hasNearbyObject={Boolean(nearbyObject)}
            />
            <div className="hidden sm:block text-center text-[11px] text-slate-500 mt-0.5 font-mono-ui">
              Удирдлага: WASD / Сум · E эсвэл Space: Шалгах / Ярилцах · I: Цүнх ба Найзууд · Esc: Цэс
            </div>
          </footer>
        </div>
      )}

      {/* Modals */}
      {activePuzzle && (
        <PuzzleModal
          puzzleId={activePuzzle}
          inventory={inventory}
          onSolve={handleSolvePuzzle}
          onClose={() => setActivePuzzle(null)}
        />
      )}

      {showInventory && (
        <InventoryModal
          inventory={inventory}
          trust={trust}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showPause && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="pixel-panel w-full max-w-sm p-5 text-center space-y-2.5">
            <div className="font-pixel-title text-[10px] text-amber-300">{GAME_TITLE}</div>
            <h3 className="font-pixel-title text-sm text-white pb-2 border-b border-[#2e344a]">
              ТҮР ЗОГСООСОН
            </h3>
            <button
              type="button"
              onClick={() => setShowPause(false)}
              className="pixel-btn-primary w-full py-2.5 text-xs sm:text-sm"
            >
              Үргэлжлүүлэх
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPause(false);
                setSaveModalMode('save');
              }}
              className="pixel-btn w-full py-2.5 text-xs sm:text-sm text-slate-200"
            >
              Тоглоом хадгалах
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPause(false);
                setSaveModalMode('load');
              }}
              className="pixel-btn w-full py-2.5 text-xs sm:text-sm text-slate-200"
            >
              Хадгалсан тоглоом ачаалах
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPause(false);
                soundEngine.stopAmbience();
                setScreen('MENU');
              }}
              className="pixel-btn w-full py-2.5 text-xs sm:text-sm text-rose-300"
            >
              Үндсэн цэс рүү гарах
            </button>
          </div>
        </div>
      )}

      {saveModalMode && (
        <SaveLoadModal
          mode={saveModalMode}
          currentSnapshot={
            screen === 'PLAYING'
              ? {
                  chapter,
                  chapterTitle: currentMap.title,
                  playerPos,
                  direction,
                  inventory,
                  flags,
                  trust,
                }
              : undefined
          }
          onLoadSlot={handleLoadSlot}
          onClose={() => setSaveModalMode(null)}
        />
      )}
    </div>
  );
}
