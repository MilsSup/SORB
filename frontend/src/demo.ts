import type { BookingStatus } from './ui';

export type PreviewRole = 'admin' | 'employee' | 'responsible';
export const roleLabels: Record<PreviewRole, string> = { admin: 'Администратор', employee: 'Сотрудник', responsible: 'Сотрудник + ответственный' };
export type CancellationPreview = { id: string; title: string; date: string; time: string; resources: string[]; own: boolean; status: BookingStatus };
export type ResourceCategory = 'rooms' | 'equipment' | 'people' | 'zones';
export type CalendarEvent = { id: number; title: string; owner: string; start: number; duration: number; tone: 'green' | 'amber' | 'purple' | 'neutral'; status: 'confirmed' | 'pending' | 'completed' };
export type CalendarResource = { id: number; name: string; meta: string; icon: string; category: ResourceCategory; events: CalendarEvent[]; groupIds: string[]; location: string; roomId?: number; mobility?: 'fixed' | 'portable'; serviceMode?: 'office' | 'remote' | 'hybrid'; workingHours?: { from: number; to: number } };
export const resourceGroups = [
  { id: 'shooting', name: 'Для съёмки' },
  { id: 'meetings', name: 'Для встреч' },
  { id: 'portable', name: 'Мобильная техника' },
];
// Participants can be responsible for resources without being bookable specialists.
export const demoParticipants = [
  { id: 'anastasia', name: 'Анастасия Морозова' },
  { id: 'anna', name: 'Анна Смирнова' },
  { id: 'alexey', name: 'Алексей Волков' },
  { id: 'maria', name: 'Мария Соколова' },
  { id: 'elena', name: 'Елена Павлова' },
  { id: 'dmitry', name: 'Дмитрий Ковалёв' },
];

// Fixed fixtures keep the visual prototype independent of the API and current date.
export const demoResources: CalendarResource[] = [
  { id: 1, name: 'Студия «Свет»', meta: '60 м² · до 12 человек', icon: 'building', category: 'rooms', groupIds: ['shooting'], location: 'Медиацентр · 2 этаж, 201', events: [
    { id: 1, title: 'Съёмка новой коллекции', owner: 'Анастасия М.', start: 10, duration: 2.5, tone: 'green', status: 'confirmed' },
    { id: 2, title: 'Предметная съёмка', owner: 'Дмитрий К.', start: 14, duration: 3, tone: 'amber', status: 'pending' },
  ] },
  { id: 2, name: 'Переговорная «Лес»', meta: '24 м² · до 8 человек', icon: 'users', category: 'rooms', groupIds: ['meetings'], location: 'Медиацентр · 2 этаж, 203', events: [
    { id: 3, title: 'Планёрка команды', owner: 'Мария С.', start: 9.5, duration: 1.5, tone: 'purple', status: 'confirmed' },
    { id: 4, title: 'Встреча с клиентом', owner: 'Анастасия М.', start: 13, duration: 2, tone: 'green', status: 'confirmed' },
  ] },
  { id: 3, name: 'Камера Sony α7 IV', meta: 'Камера · комплект с оптикой', icon: 'camera', category: 'equipment', groupIds: ['shooting', 'portable'], location: 'Медиацентр · выдача в студии', roomId: 1, mobility: 'portable', events: [
    { id: 1, title: 'Съёмка новой коллекции', owner: 'Анастасия М.', start: 10, duration: 2.5, tone: 'green', status: 'confirmed' },
    { id: 5, title: 'Интервью с гостем', owner: 'Алексей В.', start: 15, duration: 2, tone: 'purple', status: 'confirmed' },
  ] },
  { id: 4, name: 'Проектор Epson', meta: 'Full HD · HDMI, USB-C', icon: 'monitor', category: 'equipment', groupIds: ['meetings'], location: 'Медиацентр · переговорная', roomId: 2, mobility: 'fixed', events: [
    { id: 4, title: 'Встреча с клиентом', owner: 'Анастасия М.', start: 13, duration: 2, tone: 'green', status: 'confirmed' },
    { id: 6, title: 'Обслуживание', owner: 'Плановая проверка', start: 16, duration: 3, tone: 'neutral', status: 'completed' },
  ] },
  { id: 5, name: 'Мария Соколова', meta: 'Фотограф · портрет, предмет', icon: 'user', category: 'people', groupIds: ['shooting'], location: 'Съёмка в студии медиацентра', roomId: 1, serviceMode: 'office', workingHours: { from: 10, to: 18 }, events: [
    { id: 1, title: 'Съёмка новой коллекции', owner: 'Анастасия М.', start: 10, duration: 2.5, tone: 'green', status: 'confirmed' },
    { id: 2, title: 'Предметная съёмка', owner: 'Дмитрий К.', start: 14, duration: 3, tone: 'amber', status: 'pending' },
  ] },
  { id: 6, name: 'Алексей Волков', meta: 'Звукорежиссёр · запись, монтаж', icon: 'mic', category: 'people', groupIds: ['shooting'], location: 'Запись в медиацентре · монтаж онлайн', serviceMode: 'hybrid', events: [
    { id: 7, title: 'Запись подкаста', owner: 'Елена П.', start: 11, duration: 2, tone: 'purple', status: 'confirmed' },
    { id: 5, title: 'Интервью с гостем', owner: 'Алексей В.', start: 15, duration: 2, tone: 'purple', status: 'confirmed' },
  ] },
  { id: 7, name: 'Циклорама', meta: 'Съёмочная зона · белый фон', icon: 'layers', category: 'zones', groupIds: ['shooting'], location: 'Медиацентр · студия «Свет»', roomId: 1, events: [
    { id: 2, title: 'Предметная съёмка', owner: 'Дмитрий К.', start: 14, duration: 3, tone: 'amber', status: 'pending' },
  ] },
];

export function calendarCancellation(event: CalendarEvent): CancellationPreview {
  const time = (value: number) => `${String(Math.floor(value)).padStart(2, '0')}:${String(Math.round((value % 1) * 60)).padStart(2, '0')}`;
  const ids: Record<number, string> = { 1: 'БР-0128', 2: 'БР-0129', 4: 'БР-0136' };
  return { id: ids[event.id] ?? `БР-${String(140 + event.id).padStart(4, '0')}`, title: event.title, date: '19 октября 2026', time: `${time(event.start)}–${time(event.start + event.duration)}`, resources: demoResources.filter(resource => resource.events.some(item => item.id === event.id)).map(resource => resource.name), own: event.owner === 'Анастасия М.', status: event.status };
}

export const categories: { id: ResourceCategory | 'all'; label: string; icon: string; count: number }[] = [
  { id: 'all', label: 'Все ресурсы', icon: 'grid', count: 7 },
  { id: 'rooms', label: 'Помещения', icon: 'building', count: 2 },
  { id: 'equipment', label: 'Оборудование', icon: 'camera', count: 2 },
  { id: 'people', label: 'Специалисты', icon: 'users', count: 2 },
  { id: 'zones', label: 'Спецзоны', icon: 'layers', count: 1 },
];
