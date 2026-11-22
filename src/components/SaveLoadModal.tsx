import React, { useState } from 'react';
import { Save, Trash2, Upload, X } from 'lucide-react';
import { GAME_TITLE } from '../data/itemsAndFriends';
import { SaveSlotData } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

const STORAGE_KEY = 'khuv_tavilan_saves_v1';

export function readAllSaveSlots(): (SaveSlotData | null)[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [null, null, null];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [null, null, null];
    return [parsed[0] ?? null, parsed[1] ?? null, parsed[2] ?? null];
  } catch {
    return [null, null, null];
  }
}

export function writeSaveSlot(slotIndex: number, data: SaveSlotData) {
  const slots = readAllSaveSlots();
  slots[slotIndex] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

export function deleteSaveSlot(slotIndex: number) {
  const slots = readAllSaveSlots();
  slots[slotIndex] = null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

interface SaveLoadModalProps {
  mode: 'save' | 'load';
  currentSnapshot?: Omit<SaveSlotData, 'slot' | 'timestamp' | 'gameTitle'>;
  onLoadSlot: (slot: SaveSlotData) => void;
  onClose: () => void;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  mode,
  currentSnapshot,
  onLoadSlot,
  onClose,
}) => {
  const [slots, setSlots] = useState<(SaveSlotData | null)[]>(() => readAllSaveSlots());
  const [feedback, setFeedback] = useState('');

  const handleSave = (idx: number) => {
    if (!currentSnapshot) return;
    const now = new Date();
    const formatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const data: SaveSlotData = {
      ...currentSnapshot,
      slot: idx + 1,
      gameTitle: GAME_TITLE,
      timestamp: formatted,
    };
    writeSaveSlot(idx, data);
    setSlots(readAllSaveSlots());
    soundEngine.playSfx('chime');
    setFeedback(`${idx + 1}-р үүрэнд амжилттай хадгалагдлаа.`);
  };

  const handleDelete = (idx: number) => {
    deleteSaveSlot(idx);
    setSlots(readAllSaveSlots());
    soundEngine.playSfx('click');
    setFeedback(`${idx + 1}-р хадгалалтыг устгалаа.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="pixel-panel w-full max-w-lg p-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="pixel-btn p-1.5 absolute top-3 right-3 text-slate-300"
          aria-label="Хаах"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4 pr-8">
          <div className="font-pixel-title text-[10px] text-amber-400/90 mb-1">
            {GAME_TITLE}
          </div>
          <h3 className="font-pixel-title text-xs sm:text-sm text-[#f0e6d2]">
            {mode === 'save' ? 'ХАДГАЛАХ ХЭСЭГ' : 'ХАДГАЛСАН ТОГЛООМ АЧААЛАХ'}
          </h3>
        </div>

        <div className="space-y-3">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className="border border-[#333952] bg-[#0e111a] p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-pixel-title text-amber-300">
                  ҮҮР #{idx + 1}
                </div>
                {slot ? (
                  <div className="mt-1 space-y-0.5">
                    <div className="text-xs text-[#ece6da] font-semibold truncate">
                      {slot.gameTitle} · {slot.chapterTitle}
                    </div>
                    <div className="text-[11px] font-mono-ui text-slate-400">
                      {slot.timestamp} · Эд зүйлс: {slot.inventory.length}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 mt-1">Хоосон үүр</div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {mode === 'save' && (
                  <button
                    type="button"
                    onClick={() => handleSave(idx)}
                    className="pixel-btn-primary px-3 py-2 text-xs inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Хадгалах
                  </button>
                )}
                {slot && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playSfx('click');
                        onLoadSlot(slot);
                      }}
                      className="pixel-btn px-3 py-2 text-xs text-emerald-200 inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Нээх
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="pixel-btn p-2 text-rose-300"
                      aria-label="Устгах"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {feedback && (
          <p className="mt-3 text-xs text-emerald-300 font-mono-ui">{feedback}</p>
        )}
      </div>
    </div>
  );
};
