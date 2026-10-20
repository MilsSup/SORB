// A complete 24-hour time: 00:00–23:59. Partial mask values are not valid times.
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function timeToMinutes(value: string): number | null {
  if (value.length !== 5 || !TIME_PATTERN.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isTimeRangeValid(start: string, end: string) {
  const from = timeToMinutes(start);
  const to = timeToMinutes(end);
  return from !== null && to !== null && to > from;
}

type TimeRules = { required?: boolean; min?: string; max?: string; after?: string };

export function getTimeError(value: string, { required, min, max, after }: TimeRules = {}) {
  if (!value) return required ? 'Укажите время.' : '';
  const minutes = timeToMinutes(value);
  if (minutes === null) return 'Введите время в формате ЧЧ:ММ, от 00:00 до 23:59.';
  if (min && minutes < (timeToMinutes(min) ?? 0)) return `Укажите время не раньше ${min}.`;
  if (max && minutes > (timeToMinutes(max) ?? 1439)) return `Укажите время не позже ${max}.`;
  const start = after ? timeToMinutes(after) : null;
  if (start !== null && minutes <= start) return 'Окончание должно быть позже начала.';
  return '';
}

export function timeOptions({ min = '00:00', max = '23:59', after }: TimeRules = {}) {
  const start = Math.max(timeToMinutes(min) ?? 0, (after ? timeToMinutes(after) : null) ?? -1);
  const end = timeToMinutes(max) ?? 1439;
  const options: string[] = [];
  for (let minutes = Math.ceil(start / 15) * 15; minutes <= end; minutes += 15) {
    if (after && minutes <= (timeToMinutes(after) ?? -1)) continue;
    options.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return options;
}

const slots = [0, 1, 3, 4];
type TimeEdit = { value: string; caret: number };

// Overwrite the selected digit slots; keep the colon and other digits in place.
export function editTime(value: string, start: number, end: number, key: string): TimeEdit {
  const chars = (value || '__:__').split('');
  for (const slot of slots) if (slot >= start && slot < end) chars[slot] = '_';
  let caret = start;
  if (/^\d$/.test(key)) {
    const slot = slots.find(position => position >= start);
    if (slot !== undefined) {
      chars[slot] = key;
      caret = slot === 1 ? 3 : slot + 1;
    }
  } else if (key === 'Backspace' && start === end) {
    const slot = slots.findLast(position => position < start);
    if (slot !== undefined) { chars[slot] = '_'; caret = slot; }
  } else if (key === 'Delete' && start === end) {
    const slot = slots.find(position => position >= start);
    if (slot !== undefined) { chars[slot] = '_'; caret = slot; }
  }
  return { value: slots.every(slot => chars[slot] === '_') ? '' : chars.join(''), caret };
}

// Also handles paste, mobile keyboards and browser autofill without key events.
export function normalizeTime(value: string) {
  const text = value.trim();
  const separated = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (separated) return `${separated[1].padStart(2, '0')}:${separated[2]}`;
  if (/^\d{3,4}$/.test(text)) {
    const digits = text.padStart(4, '0');
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }
  if (!text) return '';
  if (/^[\d_:]{1,5}$/.test(text)) {
    const chars = text.replace(':', '').padEnd(4, '_').slice(0, 4);
    return `${chars.slice(0, 2)}:${chars.slice(2)}`;
  }
  return null;
}
