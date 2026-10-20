import { useEffect, useId, useRef, useState } from 'react';
import type { ResourceCategory } from '../demo';
import { demoParticipants, demoResources, resourceGroups } from '../demo';
import { Icon } from '../ui';
import './resource-form.css';
import { TimeInput } from './TimeInput';
import { isTimeRangeValid } from '../time-input';

const resourceTypes: { value: ResourceCategory; label: string; icon: string }[] = [
  { value: 'rooms', label: 'Помещение', icon: 'building' },
  { value: 'equipment', label: 'Оборудование', icon: 'camera' },
  { value: 'people', label: 'Специалист', icon: 'user' },
  { value: 'zones', label: 'Спецзона', icon: 'layers' },
];
const initialGroups = resourceGroups.map(group => group.name);
const rooms = demoResources.filter(resource => resource.category === 'rooms');
const responsiblePeople = demoParticipants;

export function ResourceFormDialog({ onClose }: { onClose: () => void }) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [type, setType] = useState<ResourceCategory>('equipment');
  const [groups, setGroups] = useState(initialGroups);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState('');
  const [groupError, setGroupError] = useState('');
  const [approval, setApproval] = useState('responsible');
  const [schedule, setSchedule] = useState('organization');
  const [availableFrom, setAvailableFrom] = useState('09:00');
  const [availableUntil, setAvailableUntil] = useState('19:00');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!openerRef.current && document.activeElement instanceof HTMLElement) {
      openerRef.current = document.activeElement;
    }
    if (!dialog.open) dialog.showModal();
    nameRef.current?.focus();
    return () => {
      // Closing during StrictMode cleanup must not dismiss the mounted form.
      dialog.close();
      if (openerRef.current?.isConnected) openerRef.current.focus();
    };
  }, []);

  function addGroup() {
    const title = newGroup.trim();
    if (!title) {
      setGroupError('Укажите название группы.');
      return;
    }
    if (groups.some(group => group.toLocaleLowerCase('ru') === title.toLocaleLowerCase('ru'))) {
      setGroupError('Такая группа уже есть. Выберите её в списке.');
      return;
    }
    setGroups([...groups, title]);
    setSelectedGroups([...selectedGroups, title]);
    setNewGroup('');
    setGroupError('');
    setAddingGroup(false);
  }

  return <dialog
    ref={dialogRef}
    className="rf-dialog"
    aria-labelledby={`${id}-title`}
    aria-describedby={`${id}-intro`}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
  >
    <div className="rf-dialog-content">
      <header className="rf-header">
        <div className="rf-heading-icon"><Icon name="plus" size={23} /></div>
        <div><span className="eyebrow">РЕСУРСЫ ОРГАНИЗАЦИИ</span><h2 id={`${id}-title`}>Новый ресурс</h2><p id={`${id}-intro`}>Характеристики, размещение и правила бронирования.</p></div>
        <button type="button" className="icon-button rf-close" aria-label="Закрыть форму добавления ресурса" onClick={onClose}><Icon name="x" /></button>
      </header>

      <form onSubmit={event => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        if (schedule === 'custom' && (!values.getAll('days').length || !isTimeRangeValid(availableFrom, availableUntil))) {
          setNotice('Проверьте график: выберите хотя бы один день и укажите окончание позже начала.');
          return;
        }
        setNotice('Сохранение ресурса недоступно.');
      }}>
        <div className="rf-form-body">
          <section className="rf-section" aria-labelledby={`${id}-basics`}>
            <div className="rf-section-heading"><span>01</span><div><h3 id={`${id}-basics`}>Основное</h3><p>Название и тип помогут быстро найти ресурс.</p></div></div>
            <label className="field rf-field">Название <span className="rf-required">обязательно</span><input ref={nameRef} name="name" required maxLength={120} placeholder="Например, камера Sony α7 IV" /></label>
            <fieldset className="rf-type-fieldset"><legend>Тип ресурса</legend><div className="rf-types">{resourceTypes.map(item => <label key={item.value} className={`rf-type${type === item.value ? ' rf-type-selected' : ''}`}><input type="radio" name="resourceType" value={item.value} checked={type === item.value} onChange={() => setType(item.value)} /><Icon name={item.icon} size={19} /><span>{item.label}</span></label>)}</div></fieldset>
            <label className="field rf-field">Описание <span className="optional">необязательно</span><textarea name="description" rows={2} placeholder="Для каких задач подходит и что нужно знать перед использованием" /></label>
            <label className="field rf-field">Характеристики <span className="optional">необязательно</span><textarea name="specifications" rows={2} placeholder={type === 'rooms' ? 'Например, 24 м², до 8 человек, доска и экран' : type === 'people' ? 'Например, предметная съёмка, ретушь, опыт 5 лет' : type === 'zones' ? 'Например, белый фон, ширина 4 м, постоянный свет' : 'Например, полнокадровая камера, объектив 24–70 мм, 2 аккумулятора'} /></label>
          </section>

          <section className="rf-section" aria-labelledby={`${id}-groups`}>
            <div className="rf-section-heading"><span>02</span><div><h3 id={`${id}-groups`}>Группы для поиска</h3><p>Организация создаёт свои группы. Ресурс может входить в несколько.</p></div></div>
            <fieldset className="rf-groups"><legend className="sr-only">Группы ресурса</legend>{groups.map(group => <label key={group} className={selectedGroups.includes(group) ? 'rf-group rf-group-selected' : 'rf-group'}><input type="checkbox" name="groups" value={group} checked={selectedGroups.includes(group)} onChange={() => setSelectedGroups(current => current.includes(group) ? current.filter(item => item !== group) : [...current, group])} /><span>{group}</span></label>)}</fieldset>
            {addingGroup ? <div className="rf-add-group">
              <label className="field rf-field">Название новой группы<input autoFocus value={newGroup} maxLength={60} placeholder="Например, Для подкастов" aria-invalid={!!groupError} aria-describedby={groupError ? `${id}-group-error` : undefined} onChange={event => { setNewGroup(event.target.value); setGroupError(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addGroup(); } }} /></label>
              <div className="rf-add-group-actions"><button type="button" className="button button-small" onClick={addGroup}><Icon name="check" size={14} />Добавить</button><button type="button" className="rf-text-button" onClick={() => { setAddingGroup(false); setGroupError(''); }}>Отмена</button></div>
              {groupError && <p className="rf-error" id={`${id}-group-error`} role="alert">{groupError}</p>}
            </div> : <button type="button" className="rf-text-button rf-create-group" onClick={() => setAddingGroup(true)}><Icon name="plus" size={15} />Создать группу</button>}
          </section>

          <section className="rf-section" aria-labelledby={`${id}-location`}>
            <div className="rf-section-heading"><span>03</span><div><h3 id={`${id}-location`}>{type === 'people' ? 'Формат и место услуги' : 'Размещение'}</h3><p>{type === 'people' ? 'Укажите, как можно воспользоваться услугами специалиста.' : 'Где находится ресурс и можно ли его перемещать.'}</p></div></div>
            {type === 'equipment' && <fieldset className="rf-choice-fieldset"><legend>Использование оборудования</legend><div className="rf-choice-row"><label><input type="radio" name="mobility" value="stationary" defaultChecked />Стационарный</label><label><input type="radio" name="mobility" value="portable" />Переносной</label></div></fieldset>}
            {type === 'people' && <label className="field rf-field">Формат услуги<select name="workFormat" defaultValue="unspecified"><option value="office">Очно · в офисе</option><option value="remote">Онлайн</option><option value="hybrid">Очно или онлайн</option><option value="unspecified">Не указано</option></select></label>}
            <div className="rf-columns">
              <label className="field rf-field">{type === 'people' ? 'Место оказания услуги' : 'Местоположение'} <span className="optional">необязательно</span><input name="location" placeholder={type === 'people' ? 'Например, онлайн или студия «Свет»' : 'Медиацентр · 2 этаж'} /></label>
              {type !== 'rooms' && <label className="field rf-field">Привязка к помещению <span className="optional">необязательно</span><select name="room" defaultValue=""><option value="">Без привязки</option>{rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>}
            </div>
            <p className="rf-hint rf-placement-note">Чтобы забронировать помещение вместе с ресурсом, добавьте его в заявку отдельно.</p>
          </section>

          <section className="rf-section" aria-labelledby={`${id}-availability`}>
            <div className="rf-section-heading"><span>04</span><div><h3 id={`${id}-availability`}>Правила бронирования</h3><p>Как подтверждается бронь и когда доступен ресурс.</p></div></div>
            <div className="rf-columns">
              <label className="field rf-field">Подтверждение<select name="approval" value={approval} onChange={event => setApproval(event.target.value)}><option value="automatic">Автоматически</option><option value="responsible">Ответственным</option></select></label>
              {approval === 'responsible' && <label className="field rf-field">Ответственный<select name="responsible" defaultValue="" required><option value="" disabled>Выберите участника</option>{responsiblePeople.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>}
            </div>
            <label className="field rf-field">График доступности<select name="schedule" value={schedule} onChange={event => setSchedule(event.target.value)}><option value="organization">Как у организации · пн–пт, 09:00–19:00</option><option value="custom">Свой график</option></select></label>
            {schedule === 'custom' && <div className="rf-custom-schedule"><fieldset className="rf-days"><legend>Дни недели</legend>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => <label key={day}><input type="checkbox" name="days" value={index} defaultChecked={index < 5} /><span>{day}</span></label>)}</fieldset><div className="rf-columns"><TimeInput className="field rf-field" label="Начало доступности" name="availableFrom" value={availableFrom} onChange={setAvailableFrom} required /><TimeInput className="field rf-field" label="Окончание доступности" name="availableUntil" value={availableUntil} onChange={setAvailableUntil} after={availableFrom} required /></div></div>}
            <p className="rf-hint rf-timezone"><Icon name="clock" size={14} />Время организации · Барнаул, UTC+7</p>
          </section>
        </div>

        <footer className="rf-footer">
          {notice && <p className="rf-save-error" role="alert"><Icon name="info" size={17} />{notice}</p>}
          <div className="rf-footer-row"><button type="button" className="button" onClick={onClose}>Отмена</button><button type="submit" className="button button-primary">Сохранить ресурс<Icon name="check" size={16} /></button></div>
        </footer>
      </form>
    </div>
  </dialog>;
}
