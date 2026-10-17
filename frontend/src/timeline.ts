export const TIMELINE_START = 9;
export const TIMELINE_END = 19;
export const TIME_STEP = 0.25;

export function formatTime(value: number) {
  const minutes = Math.round(value * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function snapTime(value: number) {
  return Math.max(TIMELINE_START, Math.min(TIMELINE_END, Math.round(value / TIME_STEP) * TIME_STEP));
}

export function timeAtPosition(clientX: number, left: number, width: number) {
  if (width <= 0) return TIMELINE_START;
  return snapTime(TIMELINE_START + ((clientX - left) / width) * (TIMELINE_END - TIMELINE_START));
}
