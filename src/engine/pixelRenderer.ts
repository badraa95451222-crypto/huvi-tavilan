import { ChapterMap, Direction, MapObject, ObjectType } from '../types/game';

export const TILE_SIZE = 24;

interface RenderState {
  map: ChapterMap;
  playerPos: { x: number; y: number };
  direction: Direction;
  walkFrame: number;
  timeMs: number;
  flags: Record<string, boolean>;
  nearbyObject: MapObject | null;
}

function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: number,
  gx: number,
  gy: number,
  chapterId: number
) {
  const px = gx * TILE_SIZE;
  const py = gy * TILE_SIZE;
  const seed = (gx * 37 + gy * 17) % 5;

  if (tile === 1) {
    // Wall
    drawRect(ctx, px, py, TILE_SIZE, TILE_SIZE, chapterId === 3 ? '#171320' : '#1b1d2b');
    drawRect(ctx, px, py, TILE_SIZE, 6, chapterId === 3 ? '#251e33' : '#292d40');
    drawRect(ctx, px, py + TILE_SIZE - 3, TILE_SIZE, 3, '#0b0c12');
    // Subtle brick/panel lines
    drawRect(ctx, px + 4, py + 9, 16, 1, '#12141f');
    drawRect(ctx, px + 11, py + 14, 1, 7, '#12141f');
    return;
  }

  if (tile === 2) {
    // Patterned worn rug
    const base = chapterId === 1 ? '#381822' : chapterId === 2 ? '#23203d' : '#2b1429';
    const trim = chapterId === 1 ? '#572736' : chapterId === 2 ? '#3b3563' : '#4a2146';
    drawRect(ctx, px, py, TILE_SIZE, TILE_SIZE, base);
    if (seed === 0 || seed === 3) {
      drawRect(ctx, px + 4, py + 4, 4, 4, trim);
      drawRect(ctx, px + 16, py + 16, 4, 4, trim);
    }
    drawRect(ctx, px, py, TILE_SIZE, 1, '#160d14');
    return;
  }

  if (tile === 3) {
    // Cold stone basement floor
    drawRect(ctx, px, py, TILE_SIZE, TILE_SIZE, seed % 2 === 0 ? '#181a24' : '#151720');
    drawRect(ctx, px, py, TILE_SIZE, 1, '#0e1017');
    drawRect(ctx, px, py, 1, TILE_SIZE, '#0e1017');
    if (seed === 2) {
      drawRect(ctx, px + 6, py + 10, 8, 1, '#232736');
    }
    return;
  }

  if (tile === 4) {
    // Threshold / Doorway mat
    drawRect(ctx, px, py, TILE_SIZE, TILE_SIZE, '#2b241d');
    drawRect(ctx, px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6, '#3b3025');
    return;
  }

  // Tile 0: Aged wooden floorboards
  const woodMain = seed === 1 ? '#231b18' : seed === 4 ? '#1e1714' : '#211916';
  drawRect(ctx, px, py, TILE_SIZE, TILE_SIZE, woodMain);
  drawRect(ctx, px, py + 7, TILE_SIZE, 1, '#140f0d');
  drawRect(ctx, px, py + 15, TILE_SIZE, 1, '#140f0d');
  drawRect(ctx, px, py + 23, TILE_SIZE, 1, '#140f0d');
  drawRect(ctx, px + ((gx * 7) % 18) + 2, py + 2, 1, 5, '#17110f');
  drawRect(ctx, px + ((gy * 11) % 16) + 3, py + 10, 1, 5, '#17110f');
}

function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  who: 'destiny' | 'kryss' | 'mikey' | 'vana',
  direction: Direction,
  walkFrame: number,
  timeMs: number
) {
  const px = gx * TILE_SIZE;
  const py = gy * TILE_SIZE;
  const breathCycle =
    who === 'mikey'
      ? Math.sin(timeMs / 360 + gx) > 0.35
      : who === 'vana'
      ? Math.sin(timeMs / 680 + gx) > 0.25
      : Math.sin(timeMs / 540 + gx) > 0.7;
  const bob = walkFrame % 2 === 1 ? -1 : breathCycle ? -1 : 0;

  // Shadow on floor
  drawRect(ctx, px + 5, py + 19, 14, 4, 'rgba(0,0,0,0.45)');

  const palette = {
    destiny: {
      hair: '#1c1824',
      skin: '#e6c5a8',
      coat: '#2c3245',
      accent: '#d99b43',
      pants: '#171a26',
    },
    kryss: {
      // Calm serious male in modest dark navy/charcoal coat, short neat hair
      hair: '#151a24',
      skin: '#dfc0a5',
      coat: '#222b3a',
      accent: '#48607d',
      pants: '#131720',
    },
    mikey: {
      // Cheerful confident male in distinctive layered rust-amber jacket, short messy hair
      hair: '#5c361e',
      skin: '#e7c19e',
      coat: '#994e1f',
      accent: '#f0b85b',
      pants: '#222630',
    },
    vana: {
      // Mysterious calm male in dark slate/charcoal high-collar coat, short swept male hair
      hair: '#191d24',
      skin: '#e3c7b4',
      coat: '#1c2329',
      accent: '#4a6b66',
      pants: '#11151a',
    },
  }[who];

  // Legs (masculine trousers)
  const stepOffset = walkFrame % 2 === 1 ? 1 : 0;
  drawRect(ctx, px + 7, py + 16 + stepOffset, 4, 5 - stepOffset, palette.pants);
  drawRect(ctx, px + 13, py + 16 + (1 - stepOffset), 4, 5 - (1 - stepOffset), palette.pants);

  // Broader torso / jacket
  drawRect(ctx, px + 5, py + 10 + bob, 14, 7, palette.coat);
  if (who === 'mikey') {
    // Open sporty jacket with inner shirt stripe
    drawRect(ctx, px + 10, py + 10 + bob, 4, 7, '#262220');
    drawRect(ctx, px + 7, py + 12 + bob, 2, 1, palette.accent);
    drawRect(ctx, px + 15, py + 12 + bob, 2, 1, palette.accent);
  } else if (who === 'vana') {
    // Dark high-collar coat trim
    drawRect(ctx, px + 8, py + 10 + bob, 8, 2, palette.accent);
    drawRect(ctx, px + 11, py + 12 + bob, 2, 5, '#12171c');
  } else {
    drawRect(ctx, px + 8, py + 10 + bob, 8, 2, palette.accent);
  }

  // Arms
  drawRect(ctx, px + 3, py + 11 + bob, 2, 5, palette.coat);
  drawRect(ctx, px + 19, py + 11 + bob, 2, 5, palette.coat);

  // Head (square masculine shape)
  drawRect(ctx, px + 7, py + 3 + bob, 10, 7, palette.skin);

  // Short male hairstyles — distinct per character, never long hair
  if (who === 'mikey') {
    // Short slightly messy spiky male hair
    drawRect(ctx, px + 6, py + 1 + bob, 12, 3, palette.hair);
    drawRect(ctx, px + 7, py + 0 + bob, 3, 2, palette.hair);
    drawRect(ctx, px + 12, py + 0 + bob, 3, 2, palette.hair);
  } else if (who === 'vana') {
    // Short swept-side masculine haircut
    drawRect(ctx, px + 6, py + 1 + bob, 12, 3, palette.hair);
    drawRect(ctx, px + 6, py + 3 + bob, 2, 2, palette.hair);
    drawRect(ctx, px + 15, py + 2 + bob, 3, 2, palette.hair);
  } else {
    // Kryss / Destiny: clean short cropped male hair
    drawRect(ctx, px + 6, py + 1 + bob, 12, 3, palette.hair);
    drawRect(ctx, px + 6, py + 3 + bob, 1, 2, palette.hair);
    drawRect(ctx, px + 17, py + 3 + bob, 1, 2, palette.hair);
  }

  // Eyes & brows based on direction
  if (direction === 'down') {
    drawRect(ctx, px + 9, py + 6 + bob, 2, 2, '#11131a');
    drawRect(ctx, px + 13, py + 6 + bob, 2, 2, '#11131a');
  } else if (direction === 'left') {
    drawRect(ctx, px + 8, py + 6 + bob, 2, 2, '#11131a');
  } else if (direction === 'right') {
    drawRect(ctx, px + 14, py + 6 + bob, 2, 2, '#11131a');
  } else {
    // facing up -> short back of head hair
    drawRect(ctx, px + 7, py + 3 + bob, 10, 6, palette.hair);
  }
}

function drawMapObject(
  ctx: CanvasRenderingContext2D,
  obj: MapObject,
  timeMs: number,
  flags: Record<string, boolean>
) {
  const px = obj.x * TILE_SIZE;
  const py = obj.y * TILE_SIZE;
  const t: ObjectType = obj.type;

  if (t === 'npc_kryss') {
    drawCharacterSprite(ctx, obj.x, obj.y, 'kryss', 'down', 0, timeMs);
    return;
  }
  if (t === 'npc_mikey') {
    drawCharacterSprite(ctx, obj.x, obj.y, 'mikey', 'down', 0, timeMs + 300);
    return;
  }
  if (t === 'npc_vana') {
    drawCharacterSprite(ctx, obj.x, obj.y, 'vana', 'down', 0, timeMs + 600);
    return;
  }

  if (t === 'desk') {
    drawRect(ctx, px + 2, py + 5, 20, 14, '#473022');
    drawRect(ctx, px + 3, py + 6, 18, 4, '#5e402e');
    drawRect(ctx, px + 5, py + 12, 6, 5, '#362318');
    drawRect(ctx, px + 13, py + 12, 6, 5, '#362318');
    drawRect(ctx, px + 7, py + 14, 2, 1, '#d9a441');
    drawRect(ctx, px + 15, py + 14, 2, 1, '#d9a441');
    return;
  }

  if (t === 'bookshelf') {
    drawRect(ctx, px + 2, py + 2, 20, 20, '#38251a');
    drawRect(ctx, px + 4, py + 4, 16, 6, '#1f1510');
    drawRect(ctx, px + 4, py + 13, 16, 6, '#1f1510');
    // Pixel books
    drawRect(ctx, px + 5, py + 5, 3, 5, '#8c3b3b');
    drawRect(ctx, px + 9, py + 5, 3, 5, '#3b648c');
    drawRect(ctx, px + 13, py + 4, 3, 6, '#b58e3d');
    drawRect(ctx, px + 6, py + 14, 4, 5, '#4b6e4b');
    drawRect(ctx, px + 12, py + 14, 5, 5, '#6b4775');
    return;
  }

  if (t === 'photo_frame') {
    drawRect(ctx, px + 4, py + 3, 16, 17, '#5c4228');
    drawRect(ctx, px + 6, py + 5, 12, 13, '#222633');
    drawRect(ctx, px + 8, py + 8, 3, 4, '#8f7d6a');
    drawRect(ctx, px + 13, py + 8, 3, 4, '#8f7d6a');
    drawRect(ctx, px + 10, py + 12, 4, 4, '#a6927c');
    return;
  }

  if (t === 'fuse_box') {
    const powered = Boolean(flags.power_restored);
    drawRect(ctx, px + 4, py + 3, 16, 18, '#3f4654');
    drawRect(ctx, px + 6, py + 5, 12, 14, '#242933');
    drawRect(ctx, px + 8, py + 7, 3, 3, powered ? '#38d97c' : '#e04f5f');
    drawRect(ctx, px + 13, py + 7, 3, 3, powered ? '#38d97c' : '#73353e');
    drawRect(ctx, px + 8, py + 13, 8, 2, '#9aa5bd');
    return;
  }

  if (t === 'door_locked' || t === 'door_next') {
    const unlocked =
      (t === 'door_locked' && flags.power_restored && flags.ch1_got_key) ||
      (t === 'door_next' && flags.ch2_chest_opened);
    drawRect(ctx, px + 2, py + 2, 20, 20, '#362116');
    drawRect(ctx, px + 4, py + 4, 16, 17, unlocked ? '#1c241d' : '#4a2e1f');
    drawRect(ctx, px + 16, py + 12, 2, 2, unlocked ? '#5cd68d' : '#d99b43');
    return;
  }

  if (t === 'chest') {
    const opened = Boolean(flags.ch2_chest_opened);
    drawRect(ctx, px + 3, py + 6, 18, 13, '#3b2d26');
    drawRect(ctx, px + 3, py + 6, 18, 3, '#6b7280');
    drawRect(ctx, px + 3, py + 15, 18, 2, '#6b7280');
    drawRect(ctx, px + 10, py + 10, 4, 4, opened ? '#5cd68d' : '#e0a943');
    return;
  }

  if (t === 'clock') {
    drawRect(ctx, px + 6, py + 2, 12, 20, '#3f281b');
    drawRect(ctx, px + 8, py + 4, 8, 8, '#e3d8c1');
    drawRect(ctx, px + 11, py + 6, 1, 3, '#1f1b18');
    drawRect(ctx, px + 11, py + 8, 3, 1, '#1f1b18');
    drawRect(ctx, px + 11, py + 14, 2, 5, '#c7973e');
    return;
  }

  if (t === 'diary') {
    drawRect(ctx, px + 4, py + 6, 16, 13, '#33241d');
    drawRect(ctx, px + 6, py + 8, 6, 8, '#e6dcc8');
    drawRect(ctx, px + 12, py + 8, 6, 8, '#d9ceb8');
    drawRect(ctx, px + 7, py + 10, 4, 1, '#6e5e4e');
    drawRect(ctx, px + 13, py + 10, 4, 1, '#6e5e4e');
    return;
  }

  if (t === 'mirror') {
    drawRect(ctx, px + 5, py + 2, 14, 20, '#5a4e6b');
    drawRect(ctx, px + 7, py + 4, 10, 16, '#8da7bd');
    drawRect(ctx, px + 8, py + 6, 2, 6, '#c7e2f5');
    // Crack line
    drawRect(ctx, px + 11, py + 8, 2, 2, '#1f2330');
    drawRect(ctx, px + 13, py + 10, 2, 4, '#1f2330');
    return;
  }

  if (t === 'altar') {
    const solved = Boolean(flags.ch3_altar_solved);
    drawRect(ctx, px + 2, py + 5, 20, 15, '#2b2d3c');
    drawRect(ctx, px + 4, py + 7, 16, 11, '#3e4157');
    const pulse = Math.sin(timeMs / 240) > 0;
    drawRect(ctx, px + 6, py + 10, 3, 3, solved ? '#7cd0f5' : pulse ? '#59829c' : '#3a5163');
    drawRect(ctx, px + 11, py + 10, 3, 3, solved ? '#f0b85b' : pulse ? '#a87e3c' : '#634c28');
    drawRect(ctx, px + 16, py + 10, 3, 3, solved ? '#c7a4f2' : pulse ? '#7e60a6' : '#4a3863');
    return;
  }

  if (t === 'candle') {
    const flicker = Math.sin(timeMs / 110 + px) > 0 ? 1 : 0;
    drawRect(ctx, px + 5, py + 9, 14, 11, '#3a291e');
    drawRect(ctx, px + 10, py + 5, 4, 6, '#d9cfc1');
    drawRect(ctx, px + 11, py + 2 + flicker, 2, 3, '#ffbe4d');
    drawRect(ctx, px + 11, py + 3, 1, 2, '#fff1b8');
    return;
  }

  if (t === 'shadow_figure') {
    const floatY = Math.round(Math.sin(timeMs / 320) * 2);
    drawRect(ctx, px + 5, py + 2 + floatY, 14, 19, '#08050a');
    drawRect(ctx, px + 7, py + 0 + floatY, 10, 5, '#0d0712');
    // Glowing crimson eyes
    drawRect(ctx, px + 8, py + 5 + floatY, 2, 2, '#f24b64');
    drawRect(ctx, px + 14, py + 5 + floatY, 2, 2, '#f24b64');
  }
}

export function renderGameScene(
  ctx: CanvasRenderingContext2D,
  state: RenderState
) {
  const { map, playerPos, direction, walkFrame, timeMs, flags, nearbyObject } = state;
  const widthPx = map.width * TILE_SIZE;
  const heightPx = map.height * TILE_SIZE;

  ctx.imageSmoothingEnabled = false;
  drawRect(ctx, 0, 0, widthPx, heightPx, map.ambientHex);

  // 1. Tiles
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      drawTile(ctx, map.tiles[y][x], x, y, map.id);
    }
  }

  // 2. Depth-sorted entities (objects + player by Y)
  const visibleObjects = map.objects.filter(
    (o) => !o.hiddenIfFlag || !flags[o.hiddenIfFlag]
  );

  type Drawable =
    | { kind: 'player'; y: number }
    | { kind: 'obj'; y: number; obj: MapObject };

  const drawables: Drawable[] = [
    { kind: 'player', y: playerPos.y },
    ...visibleObjects.map((obj) => ({ kind: 'obj' as const, y: obj.y, obj })),
  ];
  drawables.sort((a, b) => a.y - b.y);

  for (const item of drawables) {
    if (item.kind === 'player') {
      drawCharacterSprite(ctx, playerPos.x, playerPos.y, 'destiny', direction, walkFrame, timeMs);
    } else {
      drawMapObject(ctx, item.obj, timeMs, flags);
    }
  }

  // 3. Atmospheric Darkness & Flashlight Radial Glow
  const playerCenterX = playerPos.x * TILE_SIZE + TILE_SIZE / 2;
  const playerCenterY = playerPos.y * TILE_SIZE + TILE_SIZE / 2;
  const effectiveDarkness =
    map.id === 1 && flags.power_restored ? 0.24 : map.darknessAlpha;
  const flicker = Math.sin(timeMs / 170) * 3;
  const radius =
    (map.id === 1 && flags.power_restored ? map.lightRadius * 1.65 : map.lightRadius) + flicker;

  const grad = ctx.createRadialGradient(
    playerCenterX,
    playerCenterY,
    18,
    playerCenterX,
    playerCenterY,
    radius
  );
  grad.addColorStop(0, 'rgba(255, 224, 170, 0.06)');
  grad.addColorStop(0.45, `rgba(7, 8, 14, ${effectiveDarkness * 0.45})`);
  grad.addColorStop(1, `rgba(5, 6, 11, ${effectiveDarkness})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, widthPx, heightPx);

  // 4. Subtle floating dust motes
  ctx.fillStyle = 'rgba(225, 212, 185, 0.24)';
  for (let i = 0; i < 14; i++) {
    const mx = ((i * 71 + Math.floor(timeMs / 85)) % widthPx);
    const my = ((i * 47 + Math.floor(Math.sin(timeMs / 900 + i) * 14) + 120) % heightPx);
    ctx.fillRect(mx, my, 1, 1);
  }

  // 5. Interaction indicator above nearby object
  if (nearbyObject) {
    const ix = nearbyObject.x * TILE_SIZE + 5;
    const iy = nearbyObject.y * TILE_SIZE - 10 + Math.round(Math.sin(timeMs / 200) * 1.5);
    drawRect(ctx, ix, iy, 14, 9, '#0e111a');
    ctx.strokeStyle = '#e6a84c';
    ctx.lineWidth = 1;
    ctx.strokeRect(ix + 0.5, iy + 0.5, 13, 8);
    ctx.fillStyle = '#f7dfb9';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('E', ix + 5, iy + 7);
  }
}
