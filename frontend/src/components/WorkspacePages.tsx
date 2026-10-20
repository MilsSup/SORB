import { useEffect, useState } from 'react';
import { categories as demoCategories, demoResources, resourceGroups } from '../demo';
import type { CancellationPreview, ResourceCategory as CalendarCategory } from '../demo';
import { Icon, StatusBadge } from '../ui';
import './workspace-pages.css';
import { TimeInput } from './TimeInput';

type Page = 'resources' | 'bookings' | 'approvals' | 'team' | 'settings';
type ResourceCategory = 'all' | CalendarCategory;
type WorkspaceRole = 'admin' | 'employee' | 'responsible';
type WorkspacePageProps = { page: Page; role: WorkspaceRole; onAddResource: () => void; onCancelBooking: (booking: CancellationPreview) => void };

const resourcePresentation: Record<number, { categoryName: string; illustration: string; responsible: string; initials: string; automatic: boolean; maintenance?: boolean }> = {
  1: { categoryName: 'Помещение', illustration: 'studio', responsible: 'Ксения Паздникова', initials: 'КП', automatic: false },
  2: { categoryName: 'Помещение', illustration: 'meeting', responsible: 'Автоматически', initials: '', automatic: true },
  3: { categoryName: 'Оборудование', illustration: 'camera', responsible: 'Ксения Паздникова', initials: 'КП', automatic: false },
  4: { categoryName: 'Оборудование', illustration: 'light', responsible: 'Вячеслав Черданцев', initials: 'ВЧ', automatic: false, maintenance: true },
  5: { categoryName: 'Специалист', illustration: 'photographer', responsible: 'Никита Пчелинцев', initials: 'НП', automatic: false },
  6: { categoryName: 'Специалист', illustration: 'podcast', responsible: 'Вячеслав Черданцев', initials: 'ВЧ', automatic: false },
  7: { categoryName: 'Специальная зона', illustration: 'quiet', responsible: 'Автоматически', initials: '', automatic: true },
};
const resources = demoResources.map(resource => ({ ...resource, ...resourcePresentation[resource.id], detail: resource.meta }));
const responsibleResourceNames = resources.filter(resource => resource.responsible === 'Ксения Паздникова').map(resource => resource.name);
const serviceModeLabels = { office: 'Услуга очно', remote: 'Услуга онлайн', hybrid: 'Очно или онлайн' };
const resourcePlacementId = (resource: typeof resources[number]) => resource.category === 'rooms' ? `room-${resource.id}` : resource.roomId ? `room-${resource.roomId}` : resource.location;
const resourceRoomName = (roomId: number | undefined) => resources.find(resource => resource.id === roomId)?.name;

function SearchField({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (value: string) => void }) {
  return <label className="wp-search"><Icon name="search" size={17} /><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={event => onChange?.(event.target.value)} /></label>;
}

function ResourceArtwork({ kind, icon }: { kind: string; icon: string }) {
  return <div className={`wp-artwork wp-artwork-${kind}`} aria-hidden="true"><Icon name={icon} size={34} strokeWidth={1.5} /></div>;
}

function ResourcesPage({ role, onAddResource }: Pick<WorkspacePageProps, 'role' | 'onAddResource'>) {
  const [category, setCategory] = useState<ResourceCategory>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [groupId, setGroupId] = useState('all');
  const [location, setLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const categories = demoCategories.map(category => ({ ...category, title: category.label }));
  const locations = Array.from(new Map(resources.map(resource => [resourcePlacementId(resource), { id: resourcePlacementId(resource), name: resource.category === 'rooms' ? resource.name : resourceRoomName(resource.roomId) ?? resource.location }])).values());
  const filtersCount = Number(groupId !== 'all') + Number(location !== 'all');
  const visible = resources.filter(resource => (category === 'all' || resource.category === category)
    && (groupId === 'all' || resource.groupIds.includes(groupId))
    && (location === 'all' || resourcePlacementId(resource) === location)
    && `${resource.name} ${resource.detail} ${resource.location}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="wp-page">
    <div className="wp-toolbar"><div className="wp-tabs" aria-label="Категории ресурсов">{categories.map(tab => <button type="button" key={tab.id} aria-pressed={category === tab.id} className={category === tab.id ? 'wp-tab wp-tab-active' : 'wp-tab'} onClick={() => setCategory(tab.id)}>{tab.title}<span>{tab.count}</span></button>)}</div></div>
    <div className="wp-toolbar wp-resource-toolbar"><SearchField placeholder="Найти ресурс" value={query} onChange={setQuery} /><div className="wp-toolbar-right"><button type="button" className={`wp-button${showFilters ? ' wp-filter-active' : ''}`} data-wp-local aria-expanded={showFilters} aria-controls="resource-filters" onClick={() => setShowFilters(!showFilters)}><Icon name="filter" size={15} />Фильтры{filtersCount > 0 && <span className="wp-filter-count">{filtersCount}</span>}</button><span className="wp-view-switch"><button type="button" className={view === 'grid' ? 'wp-view-active' : ''} aria-pressed={view === 'grid'} aria-label="Карточки ресурсов" onClick={() => setView('grid')}><Icon name="grid" size={16} /></button><button type="button" className={view === 'list' ? 'wp-view-active' : ''} aria-pressed={view === 'list'} aria-label="Список ресурсов" onClick={() => setView('list')}><span className="wp-list-icon"><i /><i /><i /></span></button></span>{role === 'admin' && <button type="button" className="wp-button wp-button-brand wp-add-resource" data-wp-local onClick={onAddResource}><Icon name="plus" size={16} />Добавить ресурс</button>}</div></div>
    {showFilters && <div className="wp-resource-filters" id="resource-filters"><label>Группа<select value={groupId} onChange={event => setGroupId(event.target.value)}><option value="all">Все группы</option>{resourceGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label><label>Размещение<select value={location} onChange={event => setLocation(event.target.value)}><option value="all">Все места</option>{locations.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}</select></label>{filtersCount > 0 && <button type="button" className="wp-button" data-wp-local onClick={() => { setGroupId('all'); setLocation('all'); }}>Сбросить</button>}</div>}
    <div className={`wp-resource-grid${view === 'list' ? ' wp-resources-list' : ''}`}>{visible.map(resource => <article className={`wp-resource-card${resource.maintenance ? ' wp-resource-maintenance' : ''}`} key={resource.name}>
      <div className="wp-resource-image"><ResourceArtwork kind={resource.illustration} icon={resource.icon} /><span className="wp-category-label">{resource.categoryName}</span>{resource.maintenance && <span className="wp-maintenance-label"><span />Обслуживание с 16:00</span>}</div>
      <div className="wp-resource-body"><h2>{resource.name}</h2><p className="wp-resource-description">{resource.detail}</p><div className="wp-resource-groups">{resource.groupIds.map(id => resourceGroups.find(group => group.id === id)).filter(group => group !== undefined).map(group => <span key={group.id}>{group.name}</span>)}</div><p className="wp-resource-location"><Icon name="map-pin" size={13} /><span>{resource.category === 'people' && <small>Место оказания услуги</small>}{resource.location || 'Место не указано'}</span></p>{resource.category === 'people' && resource.serviceMode ? <p className="wp-resource-placement"><Icon name={resource.serviceMode === 'remote' ? 'monitor' : 'users'} size={12} />{serviceModeLabels[resource.serviceMode]}</p> : resource.mobility && <p className="wp-resource-placement"><Icon name={resource.mobility === 'portable' ? 'arrow-up-right' : 'building'} size={12} /><span>{resource.mobility === 'portable' ? 'Можно переносить' : 'Стационарный ресурс'}{resource.roomId && <> · {resource.mobility === 'portable' ? 'выдача' : 'размещение'}: {resourceRoomName(resource.roomId)}</>}</span></p>}<div className="wp-resource-bottom"><span className={resource.automatic ? 'wp-auto-label' : 'wp-manual-label'}><Icon name={resource.automatic ? 'check' : 'shield'} size={13} />{resource.automatic ? 'Автоподтверждение' : 'Согласует ответственный'}</span>{resource.initials && <span className="wp-small-avatar" title={resource.responsible}>{resource.initials}</span>}</div></div>
    </article>)}</div>
    {visible.length === 0 && <div className="wp-empty"><Icon name="search" size={30} /><h3>Ресурс не найден</h3><p>Попробуйте другое название, категорию или размещение.</p></div>}
    <div className="wp-list-footer"><span>{query || category !== 'all' || filtersCount > 0 ? `Найдено ресурсов: ${visible.length}` : `Все ${resources.length} ресурсов организации`}</span></div>
  </div>;
}

const bookings = [
  { title: 'Съёмка новой коллекции', number: 'БР-0128', day: '19', month: 'окт', date: 'Сегодня', time: '10:00–12:30', resources: ['Студия «Свет»', 'Камера Sony α7 IV', 'Никита Пчелинцев'], status: 'confirmed', author: 'Ксения Паздникова', initials: 'КП', own: true },
  { title: 'Встреча с клиентом', number: 'БР-0136', day: '19', month: 'окт', date: 'Сегодня', time: '13:00–15:00', resources: ['Переговорная «Лес»', 'Проектор Epson'], status: 'confirmed', author: 'Ксения Паздникова', initials: 'КП', own: true },
  { title: 'Предметная съёмка', number: 'БР-0129', day: '19', month: 'окт', date: 'Сегодня', time: '14:00–17:00', resources: ['Студия «Свет»', 'Никита Пчелинцев', 'Циклорама'], status: 'pending', author: 'Адум Джидда', initials: 'АД', own: false },
  { title: 'Интервью с командой', number: 'БР-0130', day: '20', month: 'окт', date: 'Завтра', time: '11:00–12:30', resources: ['Переговорная «Лес»', 'Проектор Epson'], status: 'revision', author: 'Ксения Паздникова', initials: 'КП', own: true },
  { title: 'Запись образовательного курса', number: 'БР-0131', day: '21', month: 'окт', date: 'Ср, 21 октября', time: '09:00–12:00', resources: ['Студия «Свет»', 'Никита Пчелинцев', 'Циклорама'], status: 'confirmed', author: 'Адум Джидда', initials: 'АД', own: false },
  { title: 'Обсуждение осеннего спецпроекта', number: 'БР-0132', day: '22', month: 'окт', date: 'Чт, 22 октября', time: '15:00–16:00', resources: ['Переговорная «Лес»'], status: 'confirmed', author: 'Ксения Паздникова', initials: 'КП', own: true },
  { title: 'Предметная съёмка', number: 'БР-0123', day: '16', month: 'окт', date: 'Пт, 16 октября', time: '13:00–15:00', resources: ['Студия «Свет»', 'Камера Sony α7 IV'], status: 'completed', author: 'Екатерина Бородина', initials: 'ЕБ', own: false },
] as const;

function BookingsPage({ role, onCancelBooking }: Pick<WorkspacePageProps, 'role' | 'onCancelBooking'>) {
  const [tab, setTab] = useState('mine');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const ownBookings = bookings.filter(booking => booking.own);
  const relatedBookings = role === 'responsible' ? bookings.filter(booking => booking.resources.some(resource => responsibleResourceNames.includes(resource))) : bookings;
  const permittedBookings = role === 'employee' ? ownBookings : role === 'responsible' ? bookings.filter(booking => booking.own || relatedBookings.includes(booking)) : bookings;
  const attentionBookings = permittedBookings.filter(booking => booking.status === 'pending' || booking.status === 'revision');
  const tabs = [
    { id: 'mine', label: 'Мои бронирования', count: ownBookings.length },
    ...(role !== 'employee' ? [{ id: 'all', label: role === 'responsible' ? 'По моим ресурсам' : 'Все бронирования', count: relatedBookings.length }] : []),
    { id: 'attention', label: 'Требуют внимания', count: attentionBookings.length },
  ];
  const selected = tab === 'mine' || (tab === 'all' && role === 'employee') ? ownBookings : tab === 'attention' ? attentionBookings : relatedBookings;
  const visible = selected.filter(booking => (status === 'all' || booking.status === status) && `${booking.title} ${booking.number} ${booking.resources.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="wp-page">
    <div className="wp-tabs wp-tabs-border">{tabs.map(item => <button type="button" key={item.id} aria-pressed={tab === item.id} className={tab === item.id ? 'wp-tab wp-tab-active' : 'wp-tab'} onClick={() => setTab(item.id)}>{item.label}<span>{item.count}</span></button>)}</div>
    <div className="wp-toolbar"><SearchField placeholder="Название, номер или ресурс" value={query} onChange={setQuery} /><div className="wp-toolbar-right"><span className="wp-period"><Icon name="calendar" size={15} />Октябрь 2026</span><select className="wp-filter-select" aria-label="Статус бронирования" value={status} onChange={event => setStatus(event.target.value)}><option value="all">Все статусы</option><option value="confirmed">Подтверждено</option><option value="pending">На согласовании</option><option value="revision">На исправлении</option><option value="completed">Завершено</option></select></div></div>
    <div className="wp-booking-list"><div className="wp-booking-table-heading"><span>Бронирование и ресурсы</span><span>Дата и время</span><span>Автор</span><span>Статус</span><span /></div>{visible.map(booking => <article className={`wp-booking-row${booking.status === 'completed' ? ' wp-booking-completed' : ''}`} key={booking.number}><div className="wp-booking-main"><div className="wp-booking-date"><strong>{booking.day}</strong><span>{booking.month}</span></div><div className="wp-booking-info"><div className="wp-title-with-id"><h2>{booking.title}</h2><span>{booking.number}</span></div><div className="wp-resource-tags">{booking.resources.map(resource => <span key={resource}>{resource}</span>)}</div></div></div><div className="wp-booking-time"><strong>{booking.date}</strong><span>{booking.time}</span><small>UTC+7</small></div><div className="wp-booking-author"><span className={`wp-small-avatar wp-avatar-${booking.initials === 'КП' ? 'green' : booking.initials === 'ЕБ' ? 'purple' : 'sand'}`}>{booking.initials}</span><span>{booking.author}{booking.own && <small>Вы</small>}</span></div><div className="wp-booking-status"><StatusBadge status={booking.status} /></div><div className="wp-booking-actions">{booking.status !== 'completed' && (booking.own || role === 'admin') && <button type="button" className="wp-cancel-booking" data-wp-local aria-label={`Отменить бронирование «${booking.title}»`} onClick={() => onCancelBooking({ id: booking.number, title: booking.title, date: `${booking.day} октября 2026`, time: booking.time, resources: [...booking.resources], own: booking.own, status: booking.status })}>Отменить</button>}</div></article>)}</div>
    {visible.length === 0 && <div className="wp-empty"><Icon name="calendar" size={30} /><h3>Бронирования не найдены</h3><p>Попробуйте изменить поисковый запрос.</p></div>}
    <div className="wp-list-footer"><span>Показано {visible.length} из {selected.length} бронирований</span><span>Октябрь 2026 · Asia/Barnaul, UTC+7</span></div>
  </div>;
}

function ApprovalsPage({ role }: Pick<WorkspacePageProps, 'role'>) {
  const [tab, setTab] = useState('waiting');
  const isResponsible = role === 'responsible';
  return <div className="wp-page">
    {isResponsible && <p className="wp-role-context"><Icon name="shield" size={15} />Вы согласуете только закреплённые ресурсы: {responsibleResourceNames.join(', ')}.</p>}
    <div className="wp-tabs wp-tabs-border">{[{ id: 'waiting', label: 'Ожидают решения', count: isResponsible ? 2 : 3 }, { id: 'revision', label: 'На исправлении', count: isResponsible ? 0 : 1 }, { id: 'history', label: 'История решений', count: null }].map(item => <button type="button" key={item.id} aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className={tab === item.id ? 'wp-tab wp-tab-active' : 'wp-tab'}>{item.label}{item.count !== null && <span>{item.count}</span>}</button>)}</div>
    {tab === 'waiting' && <><div className="wp-info-bar"><span className="wp-info-bar-icon"><Icon name="clock" size={18} /></span><div><strong>Время ресурсов уже зарезервировано</strong><p>У каждой заявки свой срок согласования. Примите решение до его окончания.</p></div><span className="wp-info-bar-count">{isResponsible ? '2 заявки' : '3 заявки'}</span></div><div className="wp-approval-grid"><ApprovalCard /><article className="wp-panel wp-approval-secondary"><div className="wp-panel-topline"><span className="wp-eyebrow">БР-0134</span><StatusBadge status="pending" /></div><h2>Портреты для сайта</h2><div className="wp-request-author"><span className="wp-small-avatar wp-avatar-sand">АД</span><span>Адум Джидда<small>Сегодня, в 09:15</small></span></div><div className="wp-request-interval"><Icon name="calendar" size={16} /><span>22 октября, четверг<strong>10:00–12:00 <small>UTC+7</small></strong></span></div><div className="wp-approval-resource"><span className="wp-resource-icon wp-resource-icon-sand"><Icon name="camera" size={19} /></span><span><strong>Камера Sony α7 IV</strong><small>Ожидает вашего решения</small></span><span className="wp-decision-dot" /></div><div className="wp-approval-resource"><span className="wp-resource-icon"><Icon name="building" size={19} /></span><span><strong>Студия «Свет»</strong><small>Екатерина Бородина · сегодня, 09:28</small></span><Icon name="check" className="wp-green-icon" size={17} /></div><div className="wp-approval-note"><Icon name="clock" size={14} /><span>На решение осталось <strong>22 ч 15 мин</strong></span></div><div className="wp-approval-actions"><button type="button" className="wp-button wp-button-reject"><Icon name="x" size={15} />Отклонить</button><button type="button" className="wp-button wp-button-brand"><Icon name="check" size={15} />Согласовать</button></div></article></div>{!isResponsible && <div className="wp-compact-request"><span className="wp-resource-icon wp-resource-icon-purple"><Icon name="users" size={22} /></span><div><h3>Съёмка осеннего спецпроекта <span>БР-0135</span></h3><p>23 октября · 14:00–17:00 · Никита Пчелинцев, фотограф</p></div><span className="wp-compact-deadline"><Icon name="clock" size={14} />Ещё 23 часа</span></div>}</>}
    {tab === 'revision' && (isResponsible ? <div className="wp-empty"><Icon name="check" size={30} /><h3>Нет заявок на исправлении</h3><p>Здесь появятся заявки по закреплённым за вами ресурсам.</p></div> : <RevisionCard />)}
    {tab === 'history' && <div className="wp-panel wp-history-panel"><h2>Последние решения</h2><p className="wp-section-description">Решения сохраняются отдельно для каждого ресурса и интервала.</p>{[{ title: 'Съёмка новой коллекции', resource: 'Студия «Свет»', person: 'Екатерина Бородина', time: 'Сегодня, 08:42', approved: true }, { title: 'Интервью с командой', resource: 'Проектор Epson', person: 'Вячеслав Черданцев', time: 'Сегодня, 08:31', approved: false }, { title: 'Запись образовательного курса', resource: 'Циклорама', person: 'Автоподтверждение', time: '18 октября, 16:20', approved: true }].filter(item => !isResponsible || responsibleResourceNames.includes(item.resource)).map(item => <div className="wp-history-row" key={item.title}><span className={`wp-history-symbol${item.approved ? '' : ' wp-history-symbol-red'}`}><Icon name={item.approved ? 'check' : 'x'} size={16} /></span><div><h3>{item.title}</h3><p>{item.resource} · {item.person}</p></div><span className={item.approved ? 'wp-green-text' : 'wp-red-text'}>{item.approved ? 'Согласовано' : 'Отказ по ресурсу'}</span><small>{item.time}</small></div>)}</div>}
  </div>;
}

function ApprovalCard() {
  return <article className="wp-panel wp-approval-primary"><div className="wp-panel-topline"><span className="wp-eyebrow">БР-0129</span><StatusBadge status="pending" /></div><h2>Предметная съёмка</h2><p className="wp-section-description">Съёмка объектов для каталога и социальных сетей.</p><div className="wp-request-author"><span className="wp-small-avatar wp-avatar-sand">АД</span><span>Адум Джидда<small>Сегодня, в 08:45</small></span><span className="wp-deadline-pill"><Icon name="clock" size={13} />Осталось 4 ч 20 мин</span></div><div className="wp-request-interval"><Icon name="calendar" size={17} /><span>Сегодня, 19 октября<strong>14:00–17:00 <small>UTC+7 · общий интервал для всех ресурсов</small></strong></span></div><div className="wp-subsection-label"><span>Ресурсы в заявке</span><span>1 из 3 согласован</span></div><div className="wp-approval-resource wp-approval-resource-pending"><span className="wp-resource-icon wp-resource-icon-purple"><Icon name="monitor" size={20} /></span><span><strong>Студия «Свет»</strong><small>Вы можете принять решение</small></span><span className="wp-pending-text">Ожидает решения</span></div><div className="wp-approval-resource"><span className="wp-resource-icon wp-resource-icon-purple"><Icon name="user" size={20} /></span><span><strong>Никита Пчелинцев</strong><small>Ожидается решение специалиста</small></span><span className="wp-decision-dot" /></div><div className="wp-approval-resource"><span className="wp-resource-icon"><Icon name="layers" size={20} /></span><span><strong>Циклорама</strong><small>Подтверждено автоматически · 08:45</small></span><span className="wp-decision-check"><Icon name="check" size={13} /></span></div><div className="wp-approval-note"><Icon name="shield" size={15} /><span>Заявка подтвердится после согласования всех ресурсов.</span></div><div className="wp-approval-actions"><button type="button" className="wp-button wp-button-reject"><Icon name="x" size={15} />Отклонить ресурс</button><button type="button" className="wp-button wp-button-brand"><Icon name="check" size={15} />Согласовать ресурс</button></div></article>;
}

function RevisionCard() {
  return <article className="wp-panel wp-revision-card"><div className="wp-panel-topline"><span className="wp-eyebrow">БР-0130</span><StatusBadge status="revision" /></div><h2>Интервью с командой</h2><div className="wp-request-author"><span className="wp-small-avatar wp-avatar-green">КП</span><span>Ксения Паздникова<small>Автор заявки</small></span></div><div className="wp-request-interval"><Icon name="calendar" size={17} /><span>Завтра, 20 октября<strong>11:00–12:30 <small>UTC+7</small></strong></span></div><div className="wp-approval-resource"><span className="wp-resource-icon"><Icon name="building" size={20} /></span><span><strong>Переговорная «Лес»</strong><small>Согласование и удержание сохранены</small></span><span className="wp-decision-check"><Icon name="check" size={13} /></span></div><div className="wp-approval-resource wp-approval-resource-rejected"><span className="wp-resource-icon wp-resource-icon-red"><Icon name="monitor" size={20} /></span><span><strong>Проектор Epson</strong><small>Вячеслав Черданцев · сегодня, 08:31</small></span><span className="wp-red-text">Отказ</span></div><div className="wp-rejection-comment"><strong>Комментарий ответственного</strong><p>Проектор недоступен в выбранное время. Пожалуйста, удалите его из заявки или выберите другой интервал.</p></div><div className="wp-info-bar wp-info-bar-amber"><Icon name="clock" size={19} /><div><strong>Исправить до 20 октября, 08:31</strong><p>Автор может заменить или удалить отклонённый ресурс. Одобрения остальных ресурсов сохраняются.</p></div></div></article>;
}

const members = [
  { name: 'Ксения Паздникова', email: 'kseniya@sreda.example', initials: 'КП', role: 'Администратор', tone: 'green', resources: 'Все ресурсы', joined: '2 сентября 2026', own: true },
  { name: 'Екатерина Бородина', email: 'ekaterina@sreda.example', initials: 'ЕБ', role: 'Владелец', tone: 'purple', resources: 'Студия «Свет», Камера Sony α7 IV', joined: '3 сентября 2026', own: false },
  { name: 'Вячеслав Черданцев', email: 'vyacheslav@sreda.example', initials: 'ВЧ', role: 'Сотрудник', tone: 'sand', resources: 'Проектор Epson, Вячеслав Черданцев', joined: '3 сентября 2026', own: false },
  { name: 'Никита Пчелинцев', email: 'nikita@sreda.example', initials: 'НП', role: 'Сотрудник', tone: 'rose', resources: 'Фотограф Никита Пчелинцев', joined: '5 сентября 2026', own: false },
  { name: 'Адум Джидда', email: 'adum@sreda.example', initials: 'АД', role: 'Сотрудник', tone: 'sand', resources: '—', joined: '12 сентября 2026', own: false },
];

function TeamPage() {
  const [tab, setTab] = useState('members');
  const [query, setQuery] = useState('');
  const [memberRole, setMemberRole] = useState('all');
  const visibleMembers = members.filter(member => (memberRole === 'all' || member.role === memberRole) && `${member.name} ${member.email}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="wp-page"><div className="wp-tabs wp-tabs-border">{[{ id: 'members', label: 'Участники', count: members.length }, { id: 'invites', label: 'Приглашения', count: 2 }, { id: 'requests', label: 'Заявки на вступление', count: 1 }].map(item => <button type="button" key={item.id} aria-pressed={tab === item.id} className={tab === item.id ? 'wp-tab wp-tab-active' : 'wp-tab'} onClick={() => setTab(item.id)}>{item.label}<span>{item.count}</span></button>)}</div>
    {tab === 'members' && <><div className="wp-toolbar"><SearchField placeholder="Имя или почта участника" value={query} onChange={setQuery} /><select className="wp-filter-select" aria-label="Роль участника" value={memberRole} onChange={event => setMemberRole(event.target.value)}><option value="all">Все роли</option><option value="Владелец">Владелец</option><option value="Администратор">Администратор</option><option value="Сотрудник">Сотрудник</option></select></div><div className="wp-member-table"><div className="wp-member-heading"><span>Участник</span><span>Роль</span><span>Ответственный за ресурсы</span><span>В команде с</span></div>{visibleMembers.map(member => <div className="wp-member-row" key={member.email}><div className="wp-member-person"><span className={`wp-member-avatar wp-avatar-${member.tone}`}>{member.initials}</span><span><strong>{member.name}{member.own && <small>Вы</small>}</strong><span>{member.email}</span></span></div><span><span className={`wp-role-badge${member.role === 'Владелец' ? ' wp-role-owner' : member.role === 'Администратор' ? ' wp-role-admin' : ''}`}>{member.role}</span></span><div className="wp-member-responsibility">{member.resources !== '—' && <Icon name="shield" size={14} />}<span>{member.resources}</span></div><span className="wp-member-joined">{member.joined}</span></div>)}{visibleMembers.length === 0 && <div className="wp-empty"><Icon name="search" size={26} /><h3>Участники не найдены</h3><p>Измените имя, адрес почты или роль.</p></div>}</div><div className="wp-list-footer"><span>Показано {visibleMembers.length} из {members.length} участников</span><span className="wp-footer-note"><Icon name="shield" size={14} />Ответственные согласуют заявки по закреплённым ресурсам</span></div></>}
    {tab === 'invites' && <><div className="wp-info-bar"><Icon name="mail" size={20} /><div><strong>Приглашения действуют 7 дней</strong><p>Каждое приглашение персональное и доступно только для указанного адреса почты.</p></div></div><div className="wp-panel wp-invitation-panel">{[{ email: 'ekaterina@sreda.example', name: 'Екатерина Бородина', date: 'До 23 октября' }, { email: 'vyacheslav@sreda.example', name: 'Вячеслав Черданцев', date: 'До 25 октября' }].map(invite => <div className="wp-invite-row" key={invite.email}><span className="wp-invite-icon"><Icon name="mail" size={20} /></span><div><h3>{invite.name}</h3><p>{invite.email}</p></div><span className="wp-role-badge">Сотрудник</span><span className="wp-invite-expiration">{invite.date}</span><button type="button" className="wp-button">Отозвать</button></div>)}</div></>}
    {tab === 'requests' && <div className="wp-panel wp-join-request"><span className="wp-member-avatar wp-avatar-rose">АД</span><div><h2>Адум Джидда</h2><p>adum@sreda.example</p><span className="wp-section-description">Заявка на вступление · сегодня, 09:12</span></div><div className="wp-join-actions"><button type="button" className="wp-button">Отклонить</button><button type="button" className="wp-button wp-button-brand"><Icon name="check" size={15} />Принять в команду</button></div></div>}
  </div>;
}

function SettingsPage() {
  const [tab, setTab] = useState('general');
  const [logo, setLogo] = useState('');
  useEffect(() => () => {
    if (logo) URL.revokeObjectURL(logo);
  }, [logo]);
  return <div className="wp-page wp-settings-layout"><nav className="wp-settings-nav" aria-label="Разделы настроек">{[{ id: 'general', title: 'Общие настройки', icon: 'building' }, { id: 'schedule', title: 'Рабочее время', icon: 'clock' }, { id: 'booking', title: 'Правила бронирования', icon: 'calendar' }, { id: 'notifications', title: 'Уведомления', icon: 'mail' }].map(item => <button type="button" key={item.id} aria-pressed={tab === item.id} className={tab === item.id ? 'wp-settings-nav-active' : ''} onClick={() => setTab(item.id)}><Icon name={item.icon} size={17} />{item.title}<Icon name="arrow-right" size={13} /></button>)}</nav><div className="wp-settings-content">
    {tab === 'general' && <><section className="wp-panel wp-settings-panel"><h2>Информация об организации</h2><p className="wp-section-description">Эти данные видят участники вашей команды.</p><div className="wp-org-identity">{logo ? <img className="wp-org-logo" src={logo} alt="" /> : <span className="wp-org-mark">с<span /></span>}<div><strong>Медиацентр «Среда»</strong></div><label className="wp-button wp-logo-upload">Изменить логотип<input type="file" accept="image/*" aria-label="Изменить логотип" onChange={event => { const file = event.target.files?.[0]; if (file?.type.startsWith('image/')) setLogo(URL.createObjectURL(file)); }} /></label></div><div className="wp-form-grid"><label className="wp-field wp-field-full">Название организации<input defaultValue="Медиацентр «Среда»" /></label><label className="wp-field">ИНН <span className="wp-optional">необязательно</span><input defaultValue="" placeholder="Укажите ИНН организации" /></label><label className="wp-field">Город<input defaultValue="Барнаул" /></label><label className="wp-field wp-field-full">Часовой пояс<select defaultValue="Asia/Barnaul"><option value="Asia/Barnaul">Барнаул · Asia/Barnaul (UTC+7)</option></select><small>Время во всех календарях организации показывается в этом часовом поясе.</small></label><label className="wp-field wp-field-full">Описание<textarea rows={3} defaultValue="Общее пространство команды: студии, оборудование и специалисты для наших проектов." /></label></div></section><section className="wp-panel wp-settings-panel"><h2>Доступность организации</h2><p className="wp-section-description">Выберите, как новые участники смогут найти вашу команду.</p><Toggle title="Показывать в поиске" description="Организацию можно найти по названию или ИНН. Вступление требует одобрения администратора." initial /><div className="wp-subtle-note"><Icon name="shield" size={15} /><span>Ресурсы и бронирования доступны только действующим участникам.</span></div></section></>}
    {tab === 'schedule' && <section className="wp-panel wp-settings-panel"><h2>Рабочее время организации</h2><p className="wp-section-description">Ресурсы наследуют этот график, если для них не указан индивидуальный.</p><div className="wp-timezone-note"><Icon name="clock" size={15} />Asia/Barnaul · UTC+7</div><div className="wp-working-days">{['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((day, index) => <WorkingDay key={day} day={day} initial={index < 5} />)}</div><div className="wp-subtle-note"><Icon name="calendar" size={15} /><span>Обслуживание, ремонт и другие исключения задаются в карточке ресурса.</span></div></section>}
    {tab === 'booking' && <><section className="wp-panel wp-settings-panel"><h2>Согласование и исправление</h2><p className="wp-section-description">Два независимых срока для заявок вашей организации.</p><div className="wp-rule-setting"><span className="wp-rule-icon"><Icon name="clock" size={21} /></span><div><h3>Первоначальное согласование</h3><p>Сколько времени есть у ответственных на решение по ресурсам.</p></div><label className="wp-hours-input"><input type="number" min="1" defaultValue="24" aria-label="Срок первоначального согласования в часах" /><span>часа</span></label></div><div className="wp-rule-setting"><span className="wp-rule-icon wp-rule-icon-purple"><Icon name="settings" size={21} /></span><div><h3>Исправление после отказа</h3><p>Сколько времени есть у автора на замену или удаление отклонённого ресурса.</p></div><label className="wp-hours-input"><input type="number" min="1" defaultValue="24" aria-label="Срок исправления в часах" /><span>часа</span></label></div><div className="wp-info-bar wp-info-bar-amber"><Icon name="clock" size={20} /><div><strong>После истечения срока заявка отменяется</strong><p>Удержания ресурсов освобождаются. Несогласованная заявка также отменяется при наступлении времени начала.</p></div></div></section><section className="wp-panel wp-settings-panel"><h2>Подтверждение ресурсов</h2><p className="wp-section-description">Способ подтверждения — автоматически или через ответственного — настраивается в карточке каждого ресурса.</p><div className="wp-subtle-note"><Icon name="check" size={15} /><span>Заявка подтверждается, когда согласован весь выбранный набор. У всех ресурсов один общий интервал.</span></div></section></>}
    {tab === 'notifications' && <section className="wp-panel wp-settings-panel"><h2>Уведомления в приложении</h2><p className="wp-section-description">События появляются в центре уведомлений и отмечаются счётчиком.</p><Toggle title="Мои бронирования" description="Согласование, исправление, изменение и отмена ваших заявок." initial /><Toggle title="Заявки на согласование" description="Новые заявки и изменения по ресурсам, за которые вы отвечаете." initial /><Toggle title="События команды" description="Приглашения и заявки на вступление в организацию." initial /><div className="wp-subtle-note"><Icon name="mail" size={15} /><span>На почту отправляется только письмо для подтверждения учётной записи.</span></div></section>}
    <div className="wp-settings-footer"><span>Изменения применяются к текущей организации</span><button type="button" className="wp-button wp-button-brand" onClick={event => {
      const inputs = event.currentTarget.closest('.wp-settings-content')?.querySelectorAll<HTMLInputElement>('input');
      for (const input of inputs ?? []) {
        if (!input.reportValidity()) { event.preventDefault(); event.stopPropagation(); break; }
      }
    }}>Сохранить изменения</button></div>
  </div></div>;
}

function WorkingDay({ day, initial }: { day: string; initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('19:00');
  return <div className={`wp-day-row${enabled ? '' : ' wp-day-weekend'}`}><label><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} />{day}</label>{enabled ? <div className="wp-day-times"><TimeInput label={`${day}, начало рабочего дня`} value={start} onChange={setStart} required hideLabel /><span className="time-range-dash">—</span><TimeInput label={`${day}, окончание рабочего дня`} value={end} onChange={setEnd} after={start} required hideLabel /></div> : <span>Выходной</span>}</div>;
}

function Toggle({ title, description, initial = false }: { title: string; description: string; initial?: boolean }) {
  const [checked, setChecked] = useState(initial);
  return <div className="wp-toggle-row"><div><h3>{title}</h3><p>{description}</p></div><button type="button" role="switch" aria-checked={checked} aria-label={title} onClick={() => setChecked(!checked)} className={`wp-toggle${checked ? ' wp-toggle-checked' : ''}`}><span /></button></div>;
}

export function WorkspacePage({ page, role, onAddResource, onCancelBooking }: WorkspacePageProps) {
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  let content;
  switch (page) {
    case 'resources': content = <ResourcesPage role={role} onAddResource={onAddResource} />; break;
    case 'bookings': content = <BookingsPage key={role} role={role} onCancelBooking={onCancelBooking} />; break;
    case 'approvals': content = <ApprovalsPage key={role} role={role} />; break;
    case 'team': content = <TeamPage />; break;
    case 'settings': content = <SettingsPage />; break;
  }
  return <div className="wp-page-host" onClick={event => {
    const button = (event.target as Element).closest('button');
    if (!button || button.hasAttribute('aria-pressed') || button.getAttribute('role') === 'switch' || button.hasAttribute('data-wp-local')) return;
    const label = button.getAttribute('aria-label') ?? button.textContent?.trim() ?? 'Действие';
    if (label.includes('Сохранить')) setNotice('Сохранение изменений недоступно.');
    else if (label.includes('Согласовать') || label.includes('Отклонить')) setNotice('Отправка решения недоступна.');
    else if (label.includes('Отозвать')) setNotice('Отзыв приглашения недоступен.');
    else if (label.includes('Принять')) setNotice('Приём участника недоступен.');
  }}>{content}{notice && <div className="wp-preview-notice" role="status"><Icon name="info" size={19} /><p>{notice}</p><button type="button" aria-label="Закрыть сообщение" data-wp-local onClick={() => setNotice('')}><Icon name="x" size={16} /></button></div>}</div>;
}
