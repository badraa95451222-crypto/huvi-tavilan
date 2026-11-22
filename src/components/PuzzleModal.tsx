import React, { useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { PuzzleId } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface PuzzleModalProps {
  puzzleId: PuzzleId;
  inventory: string[];
  onSolve: (puzzleId: PuzzleId) => void;
  onClose: () => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzleId,
  inventory,
  onSolve,
  onClose,
}) => {
  // Puzzle 1: Fuse box sequence ['blue', 'red', 'gold']
  const [fuseSeq, setFuseSeq] = useState<string[]>([]);
  const [fuseError, setFuseError] = useState('');

  // Puzzle 2: 4-digit memory lock: 0 7 2 4
  const [digits, setDigits] = useState<number[]>([0, 0, 0, 0]);
  const [lockError, setLockError] = useState('');

  // Puzzle 3: Altar balance (assign 3 symbols to Kryss / Mikey / Vana)
  const [slots, setSlots] = useState<{ kryss: string; mikey: string; vana: string }>({
    kryss: '',
    mikey: '',
    vana: '',
  });
  const [selectedRelic, setSelectedRelic] = useState<string | null>(null);
  const [altarError, setAltarError] = useState('');

  const handleFuseClick = (color: 'blue' | 'red' | 'gold') => {
    if (fuseSeq.includes(color)) return;
    const next = [...fuseSeq, color];
    setFuseSeq(next);
    setFuseError('');
    soundEngine.playSfx('click');

    if (next.length === 3) {
      if (next[0] === 'blue' && next[1] === 'red' && next[2] === 'gold') {
        soundEngine.playSfx('chime');
        onSolve('fuse_box');
      } else {
        soundEngine.playSfx('error');
        setFuseError('Дараалал буруу байна! Номын тавиур дээрх дарааллыг санаарай.');
        window.setTimeout(() => setFuseSeq([]), 650);
      }
    }
  };

  const handleDigitChange = (idx: number, delta: number) => {
    soundEngine.playSfx('click');
    setLockError('');
    setDigits((prev) => prev.map((d, i) => (i === idx ? (d + delta + 10) % 10 : d)));
  };

  const handleCheckLock = () => {
    if (digits.join('') === '0724') {
      soundEngine.playSfx('chime');
      onSolve('memory_lock');
    } else {
      soundEngine.playSfx('error');
      setLockError('Код буруу байна. Зураг (0), Тамга (7), Ханын цаг (2, 4)-г шалгаарай.');
    }
  };

  const hasLantern = inventory.includes('lantern_shard');
  const hasMirror = inventory.includes('truth_mirror');
  const hasLocket = inventory.includes('silver_locket');
  const allRelicsFound = hasLantern && hasMirror && hasLocket;

  const relics = [
    { id: 'letter', label: 'Захидал (Ухаан)', ready: true },
    { id: 'lantern', label: 'Дэнлүү (Зориг)', ready: hasLantern },
    { id: 'mirror', label: 'Толь ба Медальон (Дурсамж)', ready: hasMirror && hasLocket },
  ];

  const handlePlaceRelic = (pedestal: 'kryss' | 'mikey' | 'vana') => {
    if (!selectedRelic) return;
    soundEngine.playSfx('click');
    setAltarError('');
    setSlots((prev) => ({
      ...prev,
      [pedestal]: selectedRelic,
    }));
    setSelectedRelic(null);
  };

  const handleCheckAltar = () => {
    if (slots.kryss === 'letter' && slots.mikey === 'lantern' && slots.vana === 'mirror') {
      soundEngine.playSfx('chime');
      onSolve('altar_balance');
    } else {
      soundEngine.playSfx('error');
      setAltarError('Сүлднүүд таарахгүй байна. Найз бүрийн мөн чанарт тохирох зүйлийг байрлуул.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="pixel-panel w-full max-w-md p-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="pixel-btn p-1.5 absolute top-3 right-3 text-slate-300"
          aria-label="Хаах"
        >
          <X className="w-4 h-4" />
        </button>

        {puzzleId === 'fuse_box' && (
          <div>
            <h3 className="font-pixel-title text-xs sm:text-sm text-amber-300 mb-2">
              ЦАХИЛГААН САМБАР
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
              Гурван шилжүүлэгчийг аюулгүй дарааллаар асаана уу. (Сэжүүр: ХӨХ → УЛААН → АЛТАН)
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { id: 'red' as const, label: 'УЛААН', bg: 'bg-rose-900/60 border-rose-400 text-rose-100' },
                { id: 'gold' as const, label: 'АЛТАН', bg: 'bg-amber-900/60 border-amber-400 text-amber-100' },
                { id: 'blue' as const, label: 'ХӨХ', bg: 'bg-sky-900/60 border-sky-400 text-sky-100' },
              ].map((sw) => {
                const orderIdx = fuseSeq.indexOf(sw.id);
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => handleFuseClick(sw.id)}
                    className={`border-2 py-4 px-2 flex flex-col items-center gap-2 transition-transform active:scale-95 ${sw.bg} ${
                      orderIdx >= 0 ? 'ring-2 ring-white/70' : ''
                    }`}
                  >
                    <span className="text-xs font-bold">{sw.label}</span>
                    <span className="text-[11px] font-mono-ui opacity-85">
                      {orderIdx >= 0 ? `#${orderIdx + 1}` : 'УНТАРСАН'}
                    </span>
                  </button>
                );
              })}
            </div>
            {fuseError && <p className="text-xs text-rose-400 mb-3">{fuseError}</p>}
            <button
              type="button"
              onClick={() => setFuseSeq([])}
              className="pixel-btn px-3 py-2 text-xs text-slate-300 inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Дахин эхлүүлэх
            </button>
          </div>
        )}

        {puzzleId === 'memory_lock' && (
          <div>
            <h3 className="font-pixel-title text-xs sm:text-sm text-amber-300 mb-2">
              ДУРСАМЖИЙН ЦООЖ
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
              Vana-ийн зураг, Kryss-ийн захидал, Mikey-ийн олсон цаг дээрх 4 оронтой кодыг оруулна уу.
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              {digits.map((digit, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDigitChange(idx, 1)}
                    className="pixel-btn w-11 h-9 text-sm font-bold text-amber-200"
                  >
                    ▲
                  </button>
                  <div className="w-11 h-12 bg-[#0a0c12] border-2 border-[#4e5673] flex items-center justify-center font-pixel-title text-base text-white">
                    {digit}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDigitChange(idx, -1)}
                    className="pixel-btn w-11 h-9 text-sm font-bold text-amber-200"
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>
            {lockError && <p className="text-xs text-rose-400 mb-3">{lockError}</p>}
            <button
              type="button"
              onClick={handleCheckLock}
              className="pixel-btn-primary w-full py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Авдрыг нээх
            </button>
          </div>
        )}

        {puzzleId === 'altar_balance' && (
          <div>
            <h3 className="font-pixel-title text-xs sm:text-sm text-amber-300 mb-2">
              ГУРВАН СҮЛДНИЙ ТАВЦАН
            </h3>
            {!allRelicsFound ? (
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <p>
                  Тавцанг идэвхжүүлэхийн тулд Mikey-ээс <span className="text-amber-300">Амьд Гэрлийн Дэнлүү</span>, зүүн талын толиноос <span className="text-teal-300">Тольны Хэлтэрхий</span> олох шаардлагатай.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="pixel-btn-primary w-full py-2 text-xs"
                >
                  Танхимыг үргэлжлүүлэн шалгах
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-300 mb-3">
                  Доорх бэлгэдлээс нэгийг сонгоод тохирох найзын тавцан дээр дарж байрлуулна уу.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {relics.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRelic(r.id)}
                      className={`pixel-btn px-2.5 py-1.5 text-xs ${
                        selectedRelic === r.id ? 'border-amber-400 bg-amber-900/40 text-amber-100' : 'text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { key: 'kryss' as const, title: 'Kryss · Ухаан' },
                    { key: 'mikey' as const, title: 'Mikey · Зориг' },
                    { key: 'vana' as const, title: 'Vana · Дурсамж' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handlePlaceRelic(p.key)}
                      className="pixel-btn p-2.5 text-center flex flex-col items-center gap-1 min-h-[72px] justify-center"
                    >
                      <span className="text-[11px] font-semibold text-amber-200">{p.title}</span>
                      <span className="text-[10px] text-slate-300">
                        {slots[p.key]
                          ? relics.find((x) => x.id === slots[p.key])?.label
                          : '[Хоосон]'}
                      </span>
                    </button>
                  ))}
                </div>
                {altarError && <p className="text-xs text-rose-400 mb-3">{altarError}</p>}
                <button
                  type="button"
                  onClick={handleCheckAltar}
                  className="pixel-btn-primary w-full py-2.5 text-sm font-semibold"
                >
                  Тэнцвэрийг баталгаажуулах
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
