import { useEffect, useRef, useState } from 'react';
import type { CancellationPreview } from '../demo';
import { Icon } from '../ui';

export function CancellationDialog({ booking, onClose }: { booking: CancellationPreview; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    dialog?.showModal();
    return () => { dialog?.close(); if (opener instanceof HTMLElement && opener.isConnected) opener.focus(); };
  }, []);
  return <dialog ref={ref} className="preview-dialog cancellation-dialog" aria-labelledby="cancel-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-header"><div><span className="eyebrow">{booking.id} · МЕДИАЦЕНТР «СРЕДА»</span><h2 id="cancel-title">Отменить бронирование?</h2></div><button className="icon-button" aria-label="Закрыть окно отмены" onClick={onClose}><Icon name="x" /></button></div>
    <form className="cancellation-content" onSubmit={event => { event.preventDefault(); setNotice('Отмена бронирования недоступна.'); }}>
      <h3>{booking.title}</h3><p className="cancel-interval"><Icon name="calendar" size={17} />{booking.date} · {booking.time} · UTC+7</p>
      {!booking.own && <div className="inline-notice"><Icon name="shield" size={18} /><p>Вы отменяете заявку другого участника. Действие будет записано в истории.</p></div>}
      <p className="cancel-explanation">Будет отменена вся заявка: время перечисленных ресурсов освободится, а участники получат уведомление.</p>
      <ul className="cancel-resource-list">{booking.resources.map(resource => <li key={resource}><Icon name="layers" size={15} />{resource}</li>)}</ul>
      <label className="field">Причина отмены <span className="optional">необязательно</span><textarea name="reason" rows={3} maxLength={1000} placeholder="Например, планы изменились" /></label>
      {notice && <div className="cancel-error" role="alert">{notice}</div>}
      <div className="dialog-footer"><div className="cancel-actions"><button type="button" className="button" autoFocus onClick={onClose}>Оставить бронирование</button><button type="submit" className="button button-danger">{notice ? 'Повторить отмену' : 'Подтвердить отмену'}</button></div></div>
    </form>
  </dialog>;
}
