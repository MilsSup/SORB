import { useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { categories, demoResources } from '../demo';
import type { CalendarEvent, PreviewRole, ResourceCategory } from '../demo';
import { Icon } from '../ui';
import { formatTime, snapTime, timeAtPosition, TIMELINE_END, TIMELINE_START, TIME_STEP } from '../timeline';
import { timeToMinutes } from '../time-input';
import { TimeInput } from './TimeInput';

type Props = { role: PreviewRole; onEvent: (event: CalendarEvent) => void; onInfo: (text: string) => void };
type DragState = { kind: 'pan' | 'cursor'; pointerId: number; startX: number; scrollLeft: number; moved: boolean };
const zoomLevels = [80, 112, 144];

export function CalendarPage({ role, onEvent, onInfo }: Props) {
  const [category, setCategory] = useState<ResourceCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [availableFrom, setAvailableFrom] = useState('09:00');
  const [availableTo, setAvailableTo] = useState('10:00');
  const [selectedTime, setSelectedTime] = useState(12.5);
  const [zoom, setZoom] = useState(0);
  const [panning, setPanning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClick = useRef(false);

  const from = (timeToMinutes(availableFrom) ?? NaN) / 60;
  const to = (timeToMinutes(availableTo) ?? NaN) / 60;
  const validInterval = Number.isFinite(from) && Number.isFinite(to) && from >= 9 && to <= 19 && from < to;
  const filtered = demoResources.filter(resource => (category === 'all' || category === resource.category)
    && resource.name.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru'))
    && (!onlyAvailable || (validInterval && from >= (resource.workingHours?.from ?? 9) && to <= (resource.workingHours?.to ?? 19)
      && !resource.events.some(event => event.start < to && event.start + event.duration > from))));

  function selectAt(clientX: number) {
    const bounds = axisRef.current?.getBoundingClientRect();
    if (bounds) setSelectedTime(timeAtPosition(clientX, bounds.left, bounds.width));
  }

  function beginPan(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as Element;
    suppressClick.current = false;
    if (event.button !== 0 || event.pointerType === 'touch' || target.closest('button, a, input, select, label, .resource-label, .resource-column-heading')) return;
    if (!target.closest('.resource-track, .hour-headings')) return;
    if (event.currentTarget.scrollWidth <= event.currentTarget.clientWidth + 1) return;
    dragRef.current = { kind: 'pan', pointerId: event.pointerId, startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function beginCursor(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    suppressClick.current = false;
    dragRef.current = { kind: 'cursor', pointerId: event.pointerId, startX: event.clientX, scrollLeft: 0, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    event.preventDefault();
    event.stopPropagation();
  }

  function movePointer(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.kind === 'cursor') {
      selectAt(event.clientX);
      return;
    }
    if (Math.abs(event.clientX - drag.startX) > 5) drag.moved = true;
    if (drag.moved && scrollRef.current) {
      setPanning(true);
      scrollRef.current.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
    }
  }

  function endPointer(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.kind === 'cursor' || !drag.moved) selectAt(event.clientX);
    suppressClick.current = drag.kind === 'pan' && drag.moved;
    dragRef.current = null;
    setPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function cancelPointer() {
    dragRef.current = null;
    suppressClick.current = false;
    setPanning(false);
  }

  function moveWithKey(event: KeyboardEvent<HTMLButtonElement>) {
    const increment = event.shiftKey ? 1 : TIME_STEP;
    const value = ({ ArrowLeft: selectedTime - increment, ArrowDown: selectedTime - increment, ArrowRight: selectedTime + increment, ArrowUp: selectedTime + increment, Home: TIMELINE_START, End: TIMELINE_END } as Record<string, number>)[event.key];
    if (value === undefined) return;
    event.preventDefault();
    const next = snapTime(value);
    setSelectedTime(next);
    const viewport = scrollRef.current;
    const axis = axisRef.current?.getBoundingClientRect();
    if (viewport && axis) {
      const bounds = viewport.getBoundingClientRect();
      const labels = viewport.querySelector('.resource-column-heading')?.getBoundingClientRect().width ?? 0;
      const x = axis.left + (next - TIMELINE_START) / (TIMELINE_END - TIMELINE_START) * axis.width;
      if (x > bounds.right - 22) viewport.scrollLeft += x - bounds.right + 22;
      else if (x < bounds.left + labels + 22) viewport.scrollLeft -= bounds.left + labels + 22 - x;
    }
  }

  function scrollHour(direction: number) {
    const width = axisRef.current?.getBoundingClientRect().width ?? 800;
    scrollRef.current?.scrollBy({ left: direction * width / 10, behavior: 'smooth' });
  }

  return <>
    <div className="calendar-navigation">
      <div className="category-tabs" aria-label="Категории ресурсов">{categories.map(item => <button type="button" key={item.id} aria-pressed={category === item.id} className={category === item.id ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(item.id)}><Icon name={item.icon} size={16} /><span>{item.label}</span><small>{item.count}</small></button>)}</div>
      <span className="calendar-counts">7 ресурсов · 6 бронирований</span>
    </div>
    <div className="calendar-layout">
      <section className="calendar-panel" aria-label="Календарь ресурсов на 19 октября 2026 года">
        <div className="calendar-toolbar">
          <div className="calendar-date"><h2>19 октября <span>2026</span></h2><span className="weekday">Понедельник</span></div>
          <div className="calendar-date-actions">
            <div className="timeline-zoom"><button className="icon-button small" aria-label="Уменьшить масштаб" disabled={zoom === 0} onClick={() => setZoom(zoom - 1)}>−</button><span>{zoom === 0 ? '100%' : zoom === 1 ? '140%' : '180%'}</span><button className="icon-button small" aria-label="Увеличить масштаб" disabled={zoom === zoomLevels.length - 1} onClick={() => setZoom(zoom + 1)}>+</button></div>
            <div className="day-arrows"><button className="icon-button small" aria-label="Прокрутить шкалу на час назад" onClick={() => scrollHour(-1)}><Icon name="chevron-left" size={17} /></button><button className="icon-button small" aria-label="Прокрутить шкалу на час вперёд" onClick={() => scrollHour(1)}><Icon name="chevron-right" size={17} /></button></div>
          </div>
        </div>
        <div className="calendar-subtoolbar">
          <label className="resource-search"><Icon name="search" size={16} /><input aria-label="Поиск ресурса в календаре" value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти ресурс" /></label>
          <div className="calendar-subtools"><span className="timezone">Барнаул · UTC+7</span><button className={`availability-button${filtersOpen ? ' selected' : ''}`} aria-label="Фильтры доступности" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}><Icon name="filter" size={16} />Доступность{onlyAvailable && <span className="connection-dot" />}</button></div>
        </div>
        {filtersOpen && <div className="calendar-filter-row availability-filter"><label className="availability-checkbox"><input type="checkbox" checked={onlyAvailable} onChange={event => setOnlyAvailable(event.target.checked)} />Свободны весь интервал</label><div className="availability-times"><TimeInput label="Начало интервала доступности" min="09:00" max="19:00" value={availableFrom} onChange={setAvailableFrom} required /><TimeInput label="Конец интервала доступности" min="09:00" max="19:00" after={availableFrom} value={availableTo} onChange={setAvailableTo} required /></div>{!validInterval && <p className="availability-error" role="alert">Окончание должно быть позже начала в пределах 09:00–19:00.</p>}{onlyAvailable && validInterval && <p className="availability-result" role="status">{availableFrom}–{availableTo}: свободно {filtered.length} из {demoResources.length} ресурсов.</p>}</div>}
        <div className={`timeline-scroll${panning ? ' is-panning' : ''}`} ref={scrollRef} onPointerDown={beginPan} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={cancelPointer} onLostPointerCapture={() => { if (dragRef.current) cancelPointer(); }} onKeyDownCapture={() => { suppressClick.current = false; }} onClickCapture={event => { if (suppressClick.current) { event.stopPropagation(); suppressClick.current = false; } }}>
          <div className="timeline" style={{ '--hour-pixels': `${zoomLevels[zoom]}px` } as CSSProperties}>
            <div className="timeline-heading"><div className="resource-column-heading">Ресурс <span>{filtered.length}</span></div><div className="hour-headings" ref={axisRef} onClick={event => { if (!dragRef.current && !suppressClick.current) selectAt(event.clientX); }}>{Array.from({ length: 10 }, (_, index) => <span key={index}>{formatTime(index + 9)}</span>)}</div></div>
            <div className="timeline-body">
              {filtered.map((resource, index) => <div key={resource.id} className={`resource-row${index === 0 || resource.category !== filtered[index - 1].category ? ' category-start' : ''}`}>
                <div className="resource-label"><span className={`resource-icon resource-icon-${resource.category}`}><Icon name={resource.icon} size={18} /></span><div><strong>{resource.name}</strong><small>{resource.meta}</small></div></div>
                <div className="resource-track" onClick={event => { if (!suppressClick.current && !(event.target as Element).closest('button')) selectAt(event.clientX); }}>
                  <div className="hour-lines" aria-hidden="true" />
                  {resource.events.map((event, eventIndex) => <button key={`${event.id}-${eventIndex}`} type="button" className={`calendar-event event-${event.tone}`} style={{ left: `${(event.start - 9) * 10}%`, width: `calc(${event.duration * 10}% - 5px)` }} onClick={() => event.tone === 'neutral' ? onInfo('Проектор Epson: обслуживание с 16:00 до 19:00.') : onEvent(event)} aria-label={`${event.title}, ${resource.name}, ${formatTime(event.start)}–${formatTime(event.start + event.duration)}`} title={`${event.title} · ${formatTime(event.start)}–${formatTime(event.start + event.duration)}`}><span className="event-time">{formatTime(event.start)}–{formatTime(event.start + event.duration)}{event.tone === 'amber' && <Icon name="clock" size={11} />}</span><strong>{event.title}</strong><span className="event-owner">{event.owner}</span></button>)}
                </div>
              </div>)}
              {filtered.length === 0 && <div className="empty-state"><Icon name="search" size={24} /><h3>Ресурсы не найдены</h3><p>Измените название или фильтры.</p><button className="button" onClick={() => { setQuery(''); setCategory('all'); setOnlyAvailable(false); }}>Сбросить фильтры</button></div>}
              {filtered.length > 0 && <div className={`time-cursor${selectedTime === TIMELINE_END ? ' at-end' : selectedTime === TIMELINE_START ? ' at-start' : ''}`} style={{ left: `calc(var(--resource-width) + (100% - var(--resource-width)) * ${(selectedTime - 9) / 10})` }}><button type="button" className="time-cursor-slider" role="slider" aria-label="Выбранное время" aria-valuemin={TIMELINE_START} aria-valuemax={TIMELINE_END} aria-valuenow={selectedTime} aria-valuetext={formatTime(selectedTime)} onPointerDown={beginCursor} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={cancelPointer} onLostPointerCapture={() => { if (dragRef.current) cancelPointer(); }} onKeyDown={moveWithKey}><span className="time-cursor-value">{formatTime(selectedTime)}</span></button></div>}
            </div>
          </div>
        </div>
        <div className="calendar-footer"><div className="calendar-legend"><span><i className="legend-green" />Подтверждено</span><span><i className="legend-amber" />На согласовании</span><span><i className="legend-purple" />Бронь коллег</span><span><i className="legend-neutral" />Недоступно</span></div><span className="timeline-instruction">Щелчок — выбрать время · Перетаскивание — прокрутить</span></div>
      </section>
      <aside className="day-sidebar" aria-label="Ваши планы на день">
        <section className="my-day-card"><div className="section-label"><h2>Мои бронирования</h2><span>19 окт</span></div><div className="day-booking"><span className="day-booking-time">10:00–12:30</span><h3>Съёмка новой коллекции</h3><p>Студия «Свет» · камера · фотограф</p><button className="text-button" onClick={() => onEvent(demoResources[0].events[0])}>Открыть<Icon name="arrow-up-right" size={14} /></button></div><div className="day-booking"><span className="day-booking-time">13:00–15:00</span><h3>Встреча с клиентом</h3><p>Переговорная «Лес» · проектор</p><button className="text-button" onClick={() => onEvent(demoResources[1].events[1])}>Открыть<Icon name="arrow-up-right" size={14} /></button></div><Link className="all-bookings-link" to="/bookings">Все бронирования<Icon name="arrow-right" size={16} /></Link></section>
        {role !== 'employee' && <Link className="approval-callout" to="/approvals"><Icon name="approvals" size={20} /><div><h3>На согласовании <span>{role === 'admin' ? 3 : 2}</span></h3><p>{role === 'admin' ? 'Заявки по ресурсам организации' : 'Заявки по студии и камере'}</p></div><Icon name="chevron-right" size={16} /></Link>}
      </aside>
    </div>
  </>;
}
