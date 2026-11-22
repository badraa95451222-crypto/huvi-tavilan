import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Play, RotateCcw, Sparkles, Upload, Users, Volume2, VolumeX } from 'lucide-react';
import { CREATOR_CREDIT, FRIEND_PROFILES, GAME_TITLE } from '../data/itemsAndFriends';
import { getTrustSummaryText } from '../data/dialogues';
import { EndingType, TrustScores } from '../types/game';
import { PixelPortrait } from './PixelPortrait';
import { soundEngine } from '../audio/soundEngine';

/* ============================================================
   PIXEL-ART ATMOSPHERIC BACKGROUND FOR TITLE & ENDINGS
   ============================================================ */
const PixelBackdropCanvas: React.FC<{ variant?: 'menu' | 'light' | 'shadow' }> = ({
  variant = 'menu',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const render = (t: number) => {
      const w = 160;
      const h = 90;
      ctx.imageSmoothingEnabled = false;

      // Sky gradient bands
      if (variant === 'light') {
        ctx.fillStyle = '#1b1d36';
        ctx.fillRect(0, 0, w, 35);
        ctx.fillStyle = '#3b2b4a';
        ctx.fillRect(0, 35, w, 25);
        ctx.fillStyle = '#a86448';
        ctx.fillRect(0, 60, w, 30);
      } else if (variant === 'shadow') {
        ctx.fillStyle = '#06040a';
        ctx.fillRect(0, 0, w, 90);
      } else {
        ctx.fillStyle = '#070912';
        ctx.fillRect(0, 0, w, 40);
        ctx.fillStyle = '#0c1020';
        ctx.fillRect(0, 40, w, 50);
      }

      // Moon / Sun
      ctx.fillStyle = variant === 'light' ? '#ffd88a' : variant === 'shadow' ? '#7a1f31' : '#d8d5c5';
      ctx.fillRect(122, 14, 12, 12);
      ctx.fillRect(120, 16, 16, 8);

      // Stars / Ash motes
      for (let i = 0; i < 20; i++) {
        const sx = (i * 23 + Math.floor(t / 220)) % w;
        const sy = (i * 13) % 48;
        ctx.fillStyle =
          variant === 'shadow'
            ? 'rgba(224, 90, 109, 0.4)'
            : 'rgba(235, 228, 210, 0.45)';
        ctx.fillRect(sx, sy, 1, 1);
      }

      // Silhouette of the old house
      ctx.fillStyle = '#0a0c14';
      ctx.fillRect(48, 44, 64, 34);
      // Roof triangle
      for (let r = 0; r < 16; r++) {
        ctx.fillRect(44 + r * 2, 44 - r, 72 - r * 4, 2);
      }
      // Chimney
      ctx.fillRect(96, 26, 6, 16);

      // Glowing windows
      const flicker = Math.sin(t / 260) > 0.3;
      const winColor =
        variant === 'light'
          ? '#ffd17a'
          : variant === 'shadow'
          ? '#9e2638'
          : flicker
          ? '#d99b43'
          : '#8f6224';
      ctx.fillStyle = winColor;
      ctx.fillRect(58, 54, 8, 8);
      ctx.fillRect(92, 54, 8, 8);
      ctx.fillRect(76, 36, 6, 6);

      // Ground
      ctx.fillStyle = '#05060a';
      ctx.fillRect(0, 76, w, 14);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={90}
      className="pixelated absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
    />
  );
};

/* ============================================================
   1. LOADING SCREEN
   ============================================================ */
export const LoadingScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 950;
    let raf = 0;
    const step = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(step);
      } else {
        window.setTimeout(onDone, 180);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#07080d] px-6 text-center relative">
      <div className="font-pixel-title text-2xl sm:text-4xl text-amber-200 tracking-wider mb-6">
        {GAME_TITLE}
      </div>
      <div className="w-64 sm:w-80 h-4 border-2 border-[#3c4259] bg-[#0e111a] p-0.5">
        <div
          className="h-full bg-amber-400 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 text-xs font-mono-ui text-slate-400">
        Дурсамжийн сүүдрийг ачааллаж байна... {progress}%
      </div>
    </div>
  );
};

/* ============================================================
   2. MAIN MENU / TITLE SCREEN
   ============================================================ */
interface MainMenuProps {
  onNewGame: () => void;
  onOpenLoad: () => void;
  onOpenCredits: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export const MainMenuScreen: React.FC<MainMenuProps> = ({
  onNewGame,
  onOpenLoad,
  onOpenCredits,
  muted,
  onToggleMute,
}) => {
  const [showFriends, setShowFriends] = useState(false);

  return (
    <div className="h-full w-full relative flex flex-col justify-between bg-[#07080d] overflow-y-auto px-4 py-6 sm:py-8">
      <PixelBackdropCanvas variant="menu" />
      <div className="crt-scanlines absolute inset-0 pointer-events-none opacity-40" />

      {/* Top right audio toggle */}
      <div className="relative z-10 flex justify-end max-w-4xl w-full mx-auto">
        <button
          type="button"
          onClick={onToggleMute}
          className="pixel-btn px-3 py-2 text-xs text-slate-200 inline-flex items-center gap-1.5"
        >
          {muted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
          <span>{muted ? 'Дуу хаалттай' : 'Дуу нээлттэй'}</span>
        </button>
      </div>

      {/* Center Hero Title & Menu */}
      <div className="relative z-10 max-w-xl w-full mx-auto my-auto flex flex-col items-center text-center py-4">
        <p className="text-xs sm:text-sm text-amber-300/80 tracking-widest mb-3 font-mono-ui">
          ГУРВАН БҮЛЭГТ СЭТГЭЛ ЗҮЙН АЙМШГИЙН АДАЛ ЯВДАЛ
        </p>

        <h1 className="font-pixel-title text-3xl sm:text-5xl text-[#f5ecd9] tracking-wide leading-tight drop-shadow-[0_4px_0_#1e140c]">
          {GAME_TITLE}
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
          Destiny болон түүний найзууд Kryss, Mikey, Vana нар 15 жилийн өмнөх хуучин байшингийн нууц руу эргэн ирлээ. Таны сонголт нөхөрлөл ба хувь тавиланг шийднэ.
        </p>

        <div className="mt-7 w-full max-w-xs flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              onNewGame();
            }}
            className="pixel-btn-primary py-3 px-4 text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Шинэ тоглоом эхлүүлэх
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              onOpenLoad();
            }}
            className="pixel-btn py-3 px-4 text-sm text-[#e6dfd1] inline-flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-amber-300" /> Хадгалсан тоглоом ачаалах
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              setShowFriends(true);
            }}
            className="pixel-btn py-3 px-4 text-sm text-[#e6dfd1] inline-flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-sky-300" /> Дүрүүд ба Найзууд
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              onOpenCredits();
            }}
            className="pixel-btn py-3 px-4 text-sm text-[#e6dfd1] inline-flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-violet-300" /> Бүтээгчийн титр
          </button>
        </div>
      </div>

      {/* Bottom Creator Credit (small, elegant pixel-art font) */}
      <footer className="relative z-10 text-center pt-2">
        <p className="font-pixel-title text-[10px] sm:text-[11px] text-amber-200/80 tracking-wider">
          {CREATOR_CREDIT}
        </p>
      </footer>

      {/* Friends Showcase Modal */}
      {showFriends && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="pixel-panel w-full max-w-xl p-5 max-h-[86vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-pixel-title text-[10px] text-amber-300">{GAME_TITLE}</div>
                <h2 className="font-pixel-title text-xs sm:text-sm text-white mt-1">
                  ГОЛ ДҮР БА НАЙЗУУД
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowFriends(false)}
                className="pixel-btn px-3 py-1.5 text-xs text-slate-200"
              >
                Хаах
              </button>
            </div>

            <div className="space-y-3">
              <div className="border border-[#32384f] bg-[#0e111a] p-3 flex items-start gap-3">
                <PixelPortrait speaker="destiny" size={48} />
                <div>
                  <div className="font-pixel-title text-xs text-[#f0e6d2]">Destiny</div>
                  <div className="text-[11px] text-amber-300/90 mt-0.5">Гол дүр</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    15 жилийн өмнөх гал түймрээс амьд үлдсэн гол баатар. Өнгөрсөн үеийн үнэн болон найзуудынхаа нууцыг илчлэхээр хуучин байшинд эргэн ирэв.
                  </p>
                </div>
              </div>

              {FRIEND_PROFILES.map((friend) => (
                <div
                  key={friend.id}
                  className="border border-[#32384f] bg-[#0e111a] p-3 flex items-start gap-3"
                >
                  <PixelPortrait speaker={friend.id} size={48} />
                  <div>
                    <div
                      className="font-pixel-title text-xs"
                      style={{ color: friend.accentHex }}
                    >
                      {friend.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{friend.role}</div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {friend.personality}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   3. GAME INTRODUCTION SCREEN
   ============================================================ */
export const IntroScreen: React.FC<{ onStartChapter1: () => void }> = ({
  onStartChapter1,
}) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: `${GAME_TITLE} · УДИРТГАЛ`,
      text: 'Арван таван жилийн өмнө Destiny-ийн гэр бүлийн хуучин байшин нууцлаг сүүдэрт автаж, тэр шөнийн түүх мөнхөд тасарчээ.',
    },
    {
      title: 'ДӨРВӨН НАЙЗ · НЭГ ХУВЬ ТАВИЛАН',
      text: 'Өнөөдөр Destiny хамгийн ойрын гурван найз — тайван ажигч Kryss, хөгжилтэй зоримог Mikey, мэдрэмжтэй нууцлаг Vana нарын хамт тэр байшингийн босгыг алхлаа.',
    },
    {
      title: 'АНХААР',
      text: 'Байшин доторх сэжүүр бүрийг шалгаж, найзуудтайгаа ярилц. Таны харилцаа болон хийсэн сонголтууд Бүлэг III-ийн төгсгөлийг шийдэх болно.',
    },
  ];

  const current = slides[step];

  return (
    <div className="h-full w-full flex items-center justify-center bg-[#07080d] px-4 relative">
      <PixelBackdropCanvas variant="menu" />
      <div className="pixel-panel max-w-xl w-full p-6 sm:p-8 relative z-10 text-center">
        <div className="font-pixel-title text-[10px] text-amber-300 mb-3">
          {current.title}
        </div>

        <div className="flex items-center justify-center gap-3 mb-5">
          <PixelPortrait speaker="destiny" size={44} />
          <PixelPortrait speaker="kryss" size={44} />
          <PixelPortrait speaker="mikey" size={44} />
          <PixelPortrait speaker="vana" size={44} />
        </div>

        <p className="text-sm sm:text-base text-[#ece6da] leading-relaxed min-h-[4.5rem]">
          {current.text}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs font-mono-ui text-slate-400">
            {step + 1} / {slides.length}
          </span>
          {step < slides.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('click');
                setStep((s) => s + 1);
              }}
              className="pixel-btn-primary px-5 py-2.5 text-xs sm:text-sm"
            >
              Үргэлжлүүлэх →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('chime');
                onStartChapter1();
              }}
              className="pixel-btn-primary px-5 py-2.5 text-xs sm:text-sm"
            >
              Бүлэг I эхлүүлэх →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   4. CREDITS SCREEN
   ============================================================ */
export const CreditsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#07080d] px-4 relative">
      <PixelBackdropCanvas variant="menu" />
      <div className="pixel-panel max-w-lg w-full p-6 sm:p-8 relative z-10 text-center">
        <h2 className="font-pixel-title text-xl sm:text-2xl text-amber-200 mb-2">
          {GAME_TITLE}
        </h2>
        <p className="font-pixel-title text-[11px] text-amber-300/90 mb-6">
          {CREATOR_CREDIT}
        </p>

        <div className="border-t border-b border-[#2e344a] py-4 space-y-3 text-xs sm:text-sm text-slate-300 text-left">
          <div>
            <span className="text-amber-300 font-semibold">Гол дүр:</span> Destiny
          </div>
          <div>
            <span className="text-sky-300 font-semibold">Kryss:</span> Хамгийн ойрын логикч найз, байшин ба гэр бүлийн нууцлаг гэрч.
          </div>
          <div>
            <span className="text-amber-300 font-semibold">Mikey:</span> Хөгжилтэй, зоримог мэт боловч эцэст нь айдсаа ялан гарсан дотны найз.
          </div>
          <div>
            <span className="text-teal-300 font-semibold">Vana:</span> Нууцлаг, тайван залуу, дурсамж ба гэрэл зургийн холбоосыг тайлагч ухаалаг найз.
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx('click');
            onBack();
          }}
          className="pixel-btn mt-6 px-5 py-2.5 text-xs sm:text-sm text-slate-200"
        >
          Үндсэн цэс рүү буцах
        </button>
      </div>
    </div>
  );
};

/* ============================================================
   5. ENDING & FINAL ENDING CREDITS SCREEN
   ============================================================ */
interface EndingScreenProps {
  ending: EndingType;
  trust: TrustScores;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  ending,
  trust,
  onRestart,
  onMainMenu,
}) => {
  const [showFinalCredits, setShowFinalCredits] = useState(false);
  const isLight = ending === 'LIGHT';
  const trustSummary = getTrustSummaryText(trust);

  if (showFinalCredits) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#06070c] px-4 relative">
        <PixelBackdropCanvas variant={isLight ? 'light' : 'shadow'} />
        <div className="pixel-panel max-w-lg w-full p-6 sm:p-8 relative z-10 text-center">
          <div className="text-[11px] font-mono-ui text-amber-300/80 mb-2">
            ТОГЛООМЫН ТӨГСГӨЛИЙН ТИТР
          </div>
          <h2 className="font-pixel-title text-2xl sm:text-3xl text-[#f5ecd9] mb-3">
            {GAME_TITLE}
          </h2>
          <p className="font-pixel-title text-[11px] text-amber-300 mb-6">
            {CREATOR_CREDIT}
          </p>

          <div className="border-t border-b border-[#31374d] py-4 space-y-2.5 text-xs text-slate-300">
            <p className="text-slate-200 font-semibold">
              {isLight
                ? 'Төгсгөл I · Үнэний Гэрэл — Та нөхөрлөл болон үнэнийг сонголоо.'
                : 'Төгсгөл II · Сүүдрийн Цуурай — Өнгөрсний сүүдэр дахин цоожлогдлоо.'}
            </p>
            <p className="text-slate-400">{trustSummary}</p>
            <div className="pt-2 flex justify-center gap-4 text-[11px] font-mono-ui">
              <span className="text-sky-300">Kryss: {trust.kryss}</span>
              <span className="text-amber-300">Mikey: {trust.mikey}</span>
              <span className="text-teal-300">Vana: {trust.vana}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('click');
                onRestart();
              }}
              className="pixel-btn-primary px-4 py-2.5 text-xs inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Дахин тоглох
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('click');
                onMainMenu();
              }}
              className="pixel-btn px-4 py-2.5 text-xs text-slate-200"
            >
              Үндсэн цэс
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-[#06070c] px-4 py-4 overflow-y-auto relative">
      <PixelBackdropCanvas variant={isLight ? 'light' : 'shadow'} />
      <div className="pixel-panel max-w-2xl w-full p-5 sm:p-7 relative z-10">
        <div className="flex items-center gap-2 text-xs font-pixel-title mb-2">
          <Sparkles className={`w-4 h-4 ${isLight ? 'text-amber-300' : 'text-rose-400'}`} />
          <span className={isLight ? 'text-amber-300' : 'text-rose-400'}>
            {isLight ? 'ТӨГСГӨЛ I · ҮНЭНИЙ ГЭРЭЛ' : 'ТӨГСГӨЛ II · СҮҮДРИЙН ЦУУРАЙ'}
          </span>
        </div>

        <h2 className="font-pixel-title text-lg sm:text-2xl text-white mb-3">
          {GAME_TITLE}
        </h2>

        <p className="text-xs sm:text-sm text-[#ece6da] leading-relaxed mb-4">
          {isLight
            ? 'Destiny найзуудынхаа гарыг атган үнэнийг хүлээн зөвшөөрөх мөчид танхимын харанхуй сүүдэр аажмаар сарнив. 15 жилийн өмнөх харуусал, гэр бүлийн нууц бүгд уучлал ба гэрэл дор амар амгаланг оллоо. Үүрийн туяа хуучин цонхоор тусч, дөрвөн найз хамтдаа байшингаас гарч одлоо.'
            : 'Destiny сүүдрийн эргэлзээнд автаж, өнгөрсөн үеийн хаалгыг үүрд түгжихээр шийдэв. Тэр мөчид танхимын гэрэл бөхөж, Kryss, Mikey, Vana нарын дуудлага алсран бүдгэрлээ. Хуучин байшин өнгөрснийг дахин нуусан ч тэдний хувь тавилан сүүдрийн цуурай болон үлдэв.'}
        </p>

        {/* Friends reactions */}
        <div className="space-y-2.5 mb-5">
          <div className="border border-[#2e344a] bg-[#0d1018] p-2.5 flex items-center gap-3">
            <PixelPortrait speaker="kryss" size={40} />
            <p className="text-xs text-slate-200">
              <span className="text-sky-300 font-semibold">Kryss: </span>
              {isLight
                ? '«Аавын маань амлалт эцэст нь биеллээ. Баярлалаа, Destiny.»'
                : '«Би чамайг алдахыг хүсээгүй юм шүү, Destiny... Уучлаарай.»'}
            </p>
          </div>
          <div className="border border-[#2e344a] bg-[#0d1018] p-2.5 flex items-center gap-3">
            <PixelPortrait speaker="mikey" size={40} />
            <p className="text-xs text-slate-200">
              <span className="text-amber-300 font-semibold">Mikey: </span>
              {isLight
                ? '«Хөөх... Бид үнэхээр амьд гарлаа шүү дээ! Одоо халуун цай ууцгаая!»'
                : '«Үгүй ээ, хаалга битгий хаагдаач! Destiny, бид энд байна!»'}
            </p>
          </div>
          <div className="border border-[#2e344a] bg-[#0d1018] p-2.5 flex items-center gap-3">
            <PixelPortrait speaker="vana" size={40} />
            <p className="text-xs text-slate-200">
              <span className="text-teal-300 font-semibold">Vana: </span>
              {isLight
                ? '«Дурсамж одоо өвдөлт биш, харин биднийг холбох гүүр боллоо.»'
                : '«Сүүдэр бидний нэрийг шивнэсээр үлдлээ... Дахин уулзах өдөр хүртэл.»'}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-4 font-mono-ui">{trustSummary}</div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx('click');
            setShowFinalCredits(true);
          }}
          className="pixel-btn-primary w-full py-3 text-xs sm:text-sm font-semibold"
        >
          Төгсгөлийн титр үзэх →
        </button>
      </div>
    </div>
  );
};
