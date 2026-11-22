import { FriendProfile, InventoryItem, SpeakerId } from '../types/game';

export const GAME_TITLE = 'ХУВЬ ТАВИЛАН' as const;
export const CREATOR_CREDIT = 'Тоглоом бүтээгч: Шидбадар' as const;

export const FRIEND_PROFILES: FriendProfile[] = [
  {
    id: 'kryss',
    name: 'Kryss',
    role: 'Эрэгтэй найз · Логик сэтгэгч',
    personality:
      'Тайван, нухацтай, ажигч залуу. Даруухан бараан хувцас өмсөж, богино засалттай үстэй тэрээр аливааг баримтаар шинжилж хуучин байшингийн захидал, бүтцийг тайлахад тусалдаг ч Destiny-ийн гэр бүлийн өнгөрсөнтэй холбоотой нэгэн нууцыг тээж явна.',
    secretHint: 'Байшингийн зураглалыг хэтэрхий сайн мэддэг...',
    color: 'text-sky-300',
    accentHex: '#67b7e1',
  },
  {
    id: 'mikey',
    name: 'Mikey',
    role: 'Эрэгтэй найз · Хөгжилтэй, зоримог',
    personality:
      'Богино замбараагүй үстэй, өвөрмөц хувцаслалттай, хөгжилтэй бөгөөд өөртөө итгэлтэй залуу. Аймшигтай мөчид ч хошигнон Destiny-ийн сэтгэлийг өргөдөг ч байшин дахь үзэгдэл гүнзгийрэх тусам бодит айдсыг мэдэрч эхэлнэ.',
    secretHint: 'Инээдмийн ард жинхэнэ түгшүүр нуугдаж байна...',
    color: 'text-amber-300',
    accentHex: '#e6a84c',
  },
  {
    id: 'vana',
    name: 'Vana',
    role: 'Эрэгтэй найз · Мэдрэмжтэй, ухаалаг',
    personality:
      'Бараан өнгийн хувцастай, тайван бөгөөд нууцлаг төрхтэй залуу. Бусдын анзаардаггүй нарийн зүйлсийг мэдэрч, хуучин гэрэл зураг, тэмдэглэл, дурсамжуудын холбоосыг тайлан гэр бүлийнх нь мэддэг эртний нууцыг аажмаар илчилнэ.',
    secretHint: 'Түүний гэр бүл 15 жилийн өмнөх шөнийг санадаг...',
    color: 'text-teal-300',
    accentHex: '#7cc4b8',
  },
];

export const SPEAKER_META: Record<SpeakerId, { label: string; colorHex: string }> = {
  destiny: { label: 'Destiny', colorHex: '#f0e6d2' },
  kryss: { label: 'Kryss', colorHex: '#67b7e1' },
  mikey: { label: 'Mikey', colorHex: '#e6a84c' },
  vana: { label: 'Vana', colorHex: '#7cc4b8' },
  narrator: { label: 'Хүүрнэл', colorHex: '#9aa3b8' },
  shadow: { label: 'Сүүдэр', colorHex: '#e05a6d' },
};

export const INVENTORY_ITEMS: Record<string, InventoryItem> = {
  study_key: {
    id: 'study_key',
    name: 'Зэвэрсэн Түлхүүр',
    description: 'Зочны өрөөний хуучин шүүгээнээс олдсон хүнд хүрэл түлхүүр. Ажлын өрөөний цоожинд таарна.',
    icon: 'key',
    chapter: 1,
  },
  torn_letter: {
    id: 'torn_letter',
    name: 'Урагдсан Захидал',
    description: 'Kryss-ийн шинжилсэн хуучин хуудас: «07 дугаар сарын тэр шөнө хэн ч ганцаараа ороогүй...»',
    icon: 'scroll',
    chapter: 1,
  },
  old_photo: {
    id: 'old_photo',
    name: 'Хуучин Гэрэл Зураг',
    description: 'Vana-ийн холбож өгсөн зураг. Ар талд нь «0» ба «1998» гэсэн бүдэг тэмдэглэл байна.',
    icon: 'image',
    chapter: 2,
  },
  kryss_confession: {
    id: 'kryss_confession',
    name: 'Нууц Тамгатай Захидал',
    description: 'Kryss-ийн аавын үлдээсэн захидал. Тамганы тоо нь «7». Тэр Destiny-ийн гэр бүлийг хамгаалах амлалт өгсөн байжээ.',
    icon: 'mail',
    chapter: 2,
  },
  pocket_watch: {
    id: 'pocket_watch',
    name: 'Зогссон Халаасны Цаг',
    description: 'Mikey-ийн зориг гаргаж шалгасан тавиураас олдсон цаг. Зүү нь «2» ба «4» дээр гацжээ.',
    icon: 'clock',
    chapter: 2,
  },
  silver_locket: {
    id: 'silver_locket',
    name: 'Мөнгөн Медальон',
    description: 'Архивын авдраас олдсон ээжийн медальон. Дотор нь гурван найзын нэрийг сийлээгүй ч сэтгэл дулаацуулам гэрэлтэй.',
    icon: 'gem',
    chapter: 2,
  },
  lantern_shard: {
    id: 'lantern_shard',
    name: 'Амьд Гэрлийн Дэнлүү',
    description: 'Mikey айдас дундаасаа босож асаасан жижиг дэнлүү. Зоригийн бэлгэдэл.',
    icon: 'flame',
    chapter: 3,
  },
  truth_mirror: {
    id: 'truth_mirror',
    name: 'Тольны Хэлтэрхий',
    description: 'Vana болон Kryss-ийн сэжүүрээр олдсон тунгалаг хэлтэрхий. Өнгөрснийг гажуудуулахгүй харуулна.',
    icon: 'sparkles',
    chapter: 3,
  },
};
