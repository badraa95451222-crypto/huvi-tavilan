import React, { useEffect, useState } from 'react';
import { DialogueChoice, DialogueLine } from '../types/game';
import { SPEAKER_META } from '../data/itemsAndFriends';
import { PixelPortrait } from './PixelPortrait';
import { soundEngine } from '../audio/soundEngine';

interface DialogueBoxProps {
  line: DialogueLine;
  onAdvance: () => void;
  onSelectChoice: (choice: DialogueChoice) => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  line,
  onAdvance,
  onSelectChoice,
}) => {
  const [visibleChars, setVisibleChars] = useState(0);
  const fullText = line.text;
  const isComplete = visibleChars >= fullText.length;

  useEffect(() => {
    setVisibleChars(0);
  }, [line]);

  useEffect(() => {
    if (visibleChars >= fullText.length) return;
    const timer = window.setTimeout(() => {
      const next = visibleChars + 1;
      setVisibleChars(next);
      if (next % 3 === 1) {
        soundEngine.playBlip(line.speaker);
      }
    }, 18);
    return () => window.clearTimeout(timer);
  }, [visibleChars, fullText, line.speaker]);

  const handleBoxClick = () => {
    if (!isComplete) {
      setVisibleChars(fullText.length);
      return;
    }
    if (!line.choices || line.choices.length === 0) {
      soundEngine.playSfx('click');
      onAdvance();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isComplete) {
          setVisibleChars(fullText.length);
        } else if (!line.choices || line.choices.length === 0) {
          soundEngine.playSfx('click');
          onAdvance();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullText.length, isComplete, line.choices, onAdvance]);

  const meta = SPEAKER_META[line.speaker];

  return (
    <div
      className="w-full max-w-3xl mx-auto pixel-panel p-3 sm:p-4 pointer-events-auto"
      role="dialog"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 sm:gap-4" onClick={handleBoxClick}>
        <PixelPortrait
          speaker={line.speaker}
          size={56}
          className="mt-0.5"
          animate={true}
          isSpeaking={!isComplete}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className="font-pixel-title text-[11px] sm:text-xs tracking-wide"
              style={{ color: meta.colorHex }}
            >
              {meta.label}
            </span>
            {isComplete && (!line.choices || line.choices.length === 0) && (
              <span className="text-[11px] text-amber-300/90 animate-pulse font-mono-ui">
                Үргэлжлүүлэх ▾
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[#ece6da] min-h-[3.2rem]">
            {fullText.slice(0, visibleChars)}
          </p>
        </div>
      </div>

      {isComplete && line.choices && line.choices.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#2c3145] flex flex-col gap-2">
          {line.choices.map((choice, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundEngine.playSfx('click');
                onSelectChoice(choice);
              }}
              className="pixel-btn text-left px-3 py-2.5 text-xs sm:text-sm text-[#f3ecde] hover:text-amber-200 flex items-center gap-2 min-h-[42px]"
            >
              <span className="text-amber-400 font-pixel-title text-[10px]">
                {idx + 1}.
              </span>
              <span>{choice.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
