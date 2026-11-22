import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Backpack, Hand, Pause } from 'lucide-react';
import { Direction } from '../types/game';

interface MobileControlsProps {
  onMove: (dir: Direction) => void;
  onStopMove: () => void;
  onInteract: () => void;
  onOpenInventory: () => void;
  onOpenPause: () => void;
  hasNearbyObject: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onStopMove,
  onInteract,
  onOpenInventory,
  onOpenPause,
  hasNearbyObject,
}) => {
  const dirBtnProps = (dir: Direction) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onMove(dir);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      onStopMove();
    },
    onPointerLeave: () => onStopMove(),
    onPointerCancel: () => onStopMove(),
  });

  return (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-2 px-2 py-1 select-none touch-none">
      {/* Virtual D-Pad */}
      <div className="grid grid-cols-3 gap-1 w-[138px] sm:w-[150px]">
        <div />
        <button
          type="button"
          aria-label="Дээш явах"
          {...dirBtnProps('up')}
          className="pixel-btn h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center text-[#d6d0c4] active:bg-amber-500/20"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button
          type="button"
          aria-label="Зүүн тийш явах"
          {...dirBtnProps('left')}
          className="pixel-btn h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center text-[#d6d0c4] active:bg-amber-500/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Доош явах"
          {...dirBtnProps('down')}
          className="pixel-btn h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center text-[#d6d0c4] active:bg-amber-500/20"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Баруун тийш явах"
          {...dirBtnProps('right')}
          className="pixel-btn h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center text-[#d6d0c4] active:bg-amber-500/20"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenInventory}
          className="pixel-btn h-12 px-3 flex flex-col items-center justify-center gap-0.5 text-[#d6d0c4]"
          aria-label="Цүнх ба Найзууд"
        >
          <Backpack className="w-4 h-4 text-amber-300" />
          <span className="text-[10px]">Цүнх</span>
        </button>

        <button
          type="button"
          onClick={onOpenPause}
          className="pixel-btn h-12 px-3 flex flex-col items-center justify-center gap-0.5 text-[#d6d0c4]"
          aria-label="Түр зогсоох ба хадгалах"
        >
          <Pause className="w-4 h-4 text-slate-300" />
          <span className="text-[10px]">Цэс</span>
        </button>

        <button
          type="button"
          onClick={onInteract}
          className={`h-14 w-20 sm:w-24 flex flex-col items-center justify-center gap-1 border-2 transition-colors ${
            hasNearbyObject
              ? 'border-amber-400 bg-amber-900/50 text-amber-100'
              : 'border-[#4d5470] bg-[#161926] text-[#c7c0b3]'
          }`}
          aria-label="Шалгах эсвэл ярилцах"
        >
          <Hand className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Шалгах</span>
        </button>
      </div>
    </div>
  );
};
