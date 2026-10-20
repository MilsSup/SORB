import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../ui';
import { editTime, getTimeError, normalizeTime, TIME_PATTERN, timeOptions, timeToMinutes } from '../time-input';
import './time-input.css';

type Props = {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  after?: string;
  className?: string;
  hideLabel?: boolean;
};

export function TimeInput({ label, name, value, onChange, required, min, max, after, className = '', hideLabel = false }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const caretRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [active, setActive] = useState(0);
  const error = getTimeError(value, { required, min, max, after });
  const options = timeOptions({ min, max, after });

  useLayoutEffect(() => { inputRef.current?.setCustomValidity(error); }, [error]);
  useLayoutEffect(() => {
    if (caretRef.current !== null) {
      inputRef.current?.setSelectionRange(caretRef.current, caretRef.current);
      caretRef.current = null;
    }
  });
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const control = controlRef.current;
      const popup = popupRef.current;
      if (!control || !popup) return;
      const bounds = control.getBoundingClientRect();
      const below = window.innerHeight - bounds.bottom - 12;
      const above = bounds.top - 12;
      const height = Math.min(248, Math.max(above, below));
      popup.style.maxHeight = `${height}px`;
      popup.style.width = `${Math.max(140, bounds.width)}px`;
      popup.style.left = `${Math.max(8, Math.min(bounds.left, window.innerWidth - Math.max(140, bounds.width) - 8))}px`;
      popup.style.top = `${below >= Math.min(height, popup.scrollHeight) ? bounds.bottom + 5 : Math.max(8, bounds.top - Math.min(height, popup.scrollHeight) - 5)}px`;
    };
    place();
    optionRefs.current[active]?.focus({ preventScroll: true });
    optionRefs.current[active]?.scrollIntoView({ block: 'nearest' });
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, active]);

  function closeList(restoreFocus = false) {
    popupRef.current?.hidePopover();
    if (restoreFocus) inputRef.current?.focus({ preventScroll: true });
  }

  function openList() {
    if (!options.length) return;
    const minutes = timeToMinutes(value) ?? timeToMinutes(options[0])!;
    const nearest = options.reduce((best, option, index) => Math.abs(timeToMinutes(option)! - minutes) < Math.abs(timeToMinutes(options[best])! - minutes) ? index : best, 0);
    setActive(nearest);
    popupRef.current?.showPopover();
  }

  function update(next: string, caret?: number) {
    caretRef.current = caret ?? null;
    onChange(next);
    // A digit may be overwritten with itself, without a React value change.
    if (next === value && caret !== undefined) inputRef.current?.setSelectionRange(caret, caret);
  }

  return <div className={`time-field ${className}`} onKeyDown={event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); closeList(true); }
  }}>
    <label className={hideLabel ? 'sr-only' : 'time-field-label'} htmlFor={id}>{label}</label>
    <div className="time-control" ref={controlRef}>
      <input id={id} ref={inputRef} name={name} type="text" inputMode="numeric" autoComplete="off" spellCheck={false}
        placeholder="ЧЧ:ММ" value={value} required={required} pattern={TIME_PATTERN.source}
        aria-invalid={showError && !!error} aria-describedby={showError && error ? `${id}-error` : undefined}
        onInvalid={event => {
          event.preventDefault();
          setShowError(true);
          const form = event.currentTarget.form;
          if (!form || form.querySelector(':invalid') === event.currentTarget) inputRef.current?.focus();
        }}
        onBlur={() => setShowError(true)}
        onChange={event => {
          const native = event.nativeEvent as InputEvent;
          const cursor = event.target.selectionStart ?? 0;
          if (native.inputType === 'insertText' && native.data && /^\d$/.test(native.data)) {
            const start = Math.max(0, cursor - 1);
            const removed = Math.max(0, value.length + 1 - event.target.value.length);
            const edited = editTime(value, start, start + removed, native.data);
            update(edited.value, edited.caret);
          } else if (native.inputType?.startsWith('delete')) {
            const removed = Math.max(0, value.length - event.target.value.length);
            const backward = native.inputType === 'deleteContentBackward' && removed === 1;
            const forward = native.inputType === 'deleteContentForward' && removed === 1;
            const edited = editTime(value, backward ? cursor + 1 : cursor, backward ? cursor + 1 : forward ? cursor : cursor + removed, backward ? 'Backspace' : 'Delete');
            update(edited.value, edited.caret);
          } else {
            const next = normalizeTime(event.target.value);
            if (next !== null) update(next);
          }
        }}
        onPaste={event => {
          event.preventDefault();
          const next = normalizeTime(event.clipboardData.getData('text'));
          if (next !== null) update(next, next.length);
        }}
        onKeyDown={event => {
          if (event.ctrlKey || event.metaKey || event.altKey || event.nativeEvent.isComposing) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openList(); return; }
          if (event.key === ':') {
            event.preventDefault();
            if (/^\d_:__$/.test(value)) update(`0${value[0]}:__`, 3);
            else inputRef.current?.setSelectionRange(3, 3);
            return;
          }
          if (/^\d$/.test(event.key) || event.key === 'Backspace' || event.key === 'Delete') {
            event.preventDefault();
            const edited = editTime(value, event.currentTarget.selectionStart ?? 0, event.currentTarget.selectionEnd ?? 0, event.key);
            update(edited.value, edited.caret);
          } else if (event.key.length === 1) event.preventDefault();
        }} />
      <button type="button" className="time-clock" data-wp-local aria-label={`Выбрать время: ${label}`}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`} disabled={!options.length}
        onClick={() => open ? closeList(true) : openList()}><Icon name="clock" size={17} /></button>
    </div>
    <div id={`${id}-options`} ref={popupRef} className="time-options" popover="auto" role="listbox" aria-label={`${label}: время с шагом 15 минут`}
      onToggle={event => setOpen((event.nativeEvent as ToggleEvent).newState === 'open')}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeList(); }}
      onKeyDown={event => {
        const next = ({ ArrowDown: Math.min(active + 1, options.length - 1), ArrowUp: Math.max(active - 1, 0), Home: 0, End: options.length - 1 } as Record<string, number>)[event.key];
        if (next !== undefined) { event.preventDefault(); setActive(next); }
      }}>
      {options.map((option, index) => <button key={option} ref={node => { optionRefs.current[index] = node; }} type="button" role="option"
        data-wp-local aria-selected={value === option} tabIndex={active === index ? 0 : -1}
        onClick={() => { update(option); setShowError(true); closeList(true); }}>{option}{value === option && <Icon name="check" size={14} />}</button>)}
      {options.length === 0 && <p>Нет подходящего времени</p>}
    </div>
    {showError && error && <p className="time-field-error" id={`${id}-error`} role="alert">{error}</p>}
  </div>;
}
