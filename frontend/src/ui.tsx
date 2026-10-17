import type { CSSProperties } from 'react';

const paths: Record<string, string> = {
  lock: 'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 10h2m4 0h2m-8 4h2',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  layers: 'm12 3 10 5-10 5L2 8l10-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  clipboard: 'M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3M9 2h6v5H9zM8 12h8m-8 5h5',
  approvals: 'M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M8 12l4 4L22 4',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  settings: 'm9 3 .7-1h4.6l.7 3 2 .9 2.6-.7 2.3 4-1.9 2.1v2.4l1.9 2.1-2.3 4-2.6-.7-2 .9-.7 3H9.7l-.7-3-2-.9-2.6.7-2.3-4L4 13.7v-2.4L2.1 9.2l2.3-4 2.6.7L9 5V3Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  search: 'm21 21-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z',
  filter: 'M4 7h16M7 12h10m-7 5h4',
  'chevron-down': 'm7 10 5 5 5-5',
  'chevron-left': 'm14 6-6 6 6 6',
  'chevron-right': 'm10 6 6 6-6 6',
  'arrow-right': 'M4 12h16m-6-6 6 6-6 6',
  'arrow-up-right': 'M7 17 17 7M7 7h10v10',
  plus: 'M12 5v14M5 12h14',
  x: 'm6 6 12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12a2 2 0 0 0 4 0',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42m-11.3 11.3-1.42 1.42M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  moon: 'M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z',
  help: 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4m.1 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  building: 'M4 22V3h12v19M16 9h4v13M8 7h4m-4 4h4m-4 4h4m-4 7v-3h4v3M2 22h20',
  'map-pin': 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  camera: 'M14.5 4h-5L7 7H3a1 1 0 0 0-1 1v12h20V8a1 1 0 0 0-1-1h-4l-2.5-3ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  monitor: 'M3 3h18v13H3zM8 21h8m-4-5v5',
  mic: 'M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Zm7 8v2a7 7 0 0 1-14 0v-2m7 9v3m-4 0h8',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-4 10 3 3 5-6',
  mail: 'M2 4h20v16H2zM2 4l10 9L22 4',
  link: 'm10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
  logout: 'M9 4H4v16h5m6-13 5 5-5 5M8 12h12',
  menu: 'M3 6h18M3 12h18M3 18h18',
  info: 'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  leaf: 'M20 3C10 2 3 6 4 14a6 6 0 0 0 6 6c8 1 12-6 10-17ZM4 21 16 9',
};

export function Icon({ name, size = 20, className = '', strokeWidth = 1.7, style }: { name: string; size?: number; className?: string; strokeWidth?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true"><path d={paths[name] ?? paths.grid} /></svg>;
}

export type BookingStatus = 'confirmed' | 'pending' | 'revision' | 'cancelled' | 'completed';
export function StatusBadge({ status, compact = false }: { status: BookingStatus; compact?: boolean }) {
  const labels = { confirmed: 'Подтверждено', pending: 'На согласовании', revision: 'Требует исправления', cancelled: 'Отменено', completed: 'Завершено' };
  return <span className={`status-badge status-${status}${compact ? ' status-compact' : ''}`}><span />{labels[status]}</span>;
}
