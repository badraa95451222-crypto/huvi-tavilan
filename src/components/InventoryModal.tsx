import React, { useState } from 'react';
import { Backpack, Clock, Flame, Gem, Image, Key, Mail, ScrollText, Sparkles, Users, X } from 'lucide-react';
import { FRIEND_PROFILES, INVENTORY_ITEMS } from '../data/itemsAndFriends';
import { TrustScores } from '../types/game';
import { PixelPortrait } from './PixelPortrait';

interface InventoryModalProps {
  inventory: string[];
  trust: TrustScores;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  key: <Key className="w-4 h-4 text-amber-300" />,
  scroll: <ScrollText className="w-4 h-4 text-sky-300" />,
  image: <Image className="w-4 h-4 text-violet-300" />,
  mail: <Mail className="w-4 h-4 text-sky-300" />,
  clock: <Clock className="w-4 h-4 text-amber-300" />,
  gem: <Gem className="w-4 h-4 text-emerald-300" />,
  flame: <Flame className="w-4 h-4 text-orange-400" />,
  sparkles: <Sparkles className="w-4 h-4 text-violet-300" />,
};

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  trust,
  onClose,
}) => {
  const [tab, setTab] = useState<'items' | 'friends'>('items');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="pixel-panel w-full max-w-lg p-5 relative max-h-[85vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="pixel-btn p-1.5 absolute top-3 right-3 text-slate-300"
          aria-label="Хаах"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4 pr-8">
          <button
            type="button"
            onClick={() => setTab('items')}
            className={`pixel-btn px-3 py-2 text-xs inline-flex items-center gap-1.5 ${
              tab === 'items' ? 'border-amber-400 text-amber-200 bg-amber-950/40' : 'text-slate-300'
            }`}
          >
            <Backpack className="w-3.5 h-3.5" /> Цүнх ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('friends')}
            className={`pixel-btn px-3 py-2 text-xs inline-flex items-center gap-1.5 ${
              tab === 'friends' ? 'border-amber-400 text-amber-200 bg-amber-950/40' : 'text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Найзууд
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-2.5">
          {tab === 'items' ? (
            inventory.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                Таны цүнх одоогоор хоосон байна. Эргэн тойрноо шалгаж сэжүүр цуглуулна уу.
              </div>
            ) : (
              inventory.map((itemId) => {
                const item = INVENTORY_ITEMS[itemId];
                if (!item) return null;
                return (
                  <div
                    key={item.id}
                    className="border border-[#2f354a] bg-[#0e111a] p-3 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 bg-[#171b29] border border-[#3a415c] flex items-center justify-center shrink-0">
                      {ICON_MAP[item.icon] ?? <Key className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-amber-200">
                        {item.name}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            FRIEND_PROFILES.map((friend) => {
              const score = trust[friend.id];
              const statusLabel =
                score >= 3
                  ? 'Гүн итгэлцэл'
                  : score >= 1
                  ? 'Эерэг харилцаа'
                  : score === 0
                  ? 'Төвийг сахисан'
                  : 'Үл итгэлцэл';
              return (
                <div
                  key={friend.id}
                  className="border border-[#2f354a] bg-[#0e111a] p-3 flex items-start gap-3"
                >
                  <PixelPortrait speaker={friend.id} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className="font-pixel-title text-xs"
                        style={{ color: friend.accentHex }}
                      >
                        {friend.name}
                      </span>
                      <span className="text-[11px] font-mono-ui text-slate-300">
                        Итгэлцэл: {score > 0 ? `+${score}` : score} · {statusLabel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{friend.role}</div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {friend.personality}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
