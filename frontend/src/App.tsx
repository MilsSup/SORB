import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Icon } from './ui';
import { CalendarPage } from './components/CalendarPage';
import { WorkspacePage } from './components/WorkspacePages';
import { AccountPage } from './components/AccountPages';
import { PreviewDialog } from './components/PreviewDialog';
import type { DialogState } from './components/PreviewDialog';
import { ResourceFormDialog } from './components/ResourceFormDialog';
import { CancellationDialog } from './components/CancellationDialog';
import { roleLabels } from './demo';
import type { CancellationPreview, PreviewRole } from './demo';

const navigation = [
  { path: '/calendar', label: 'Календарь', icon: 'calendar' },
  { path: '/resources', label: 'Ресурсы', icon: 'grid' },
  { path: '/bookings', label: 'Мои бронирования', icon: 'clipboard' },
  { path: '/approvals', label: 'Согласование', icon: 'approvals', count: 3 },
];
const management = [
  { path: '/team', label: 'Участники', icon: 'users' },
  { path: '/settings', label: 'Настройки', icon: 'settings' },
];
const pageTitles: Record<string, string> = {
  '/calendar': 'Календарь ресурсов', '/resources': 'Ресурсы',
  '/bookings': 'Мои бронирования', '/approvals': 'Согласование',
  '/team': 'Участники', '/settings': 'Настройки организации',
  '/organizations': 'Мои организации', '/profile': 'Мой профиль',
  '/login': 'Вход', '/register': 'Регистрация',
};

export function App() {
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('rezervika-theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<PreviewRole>('admin');
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [cancellation, setCancellation] = useState<CancellationPreview | null>(null);
  const isAdmin = role === 'admin';
  const canApprove = role !== 'employee';
  const title = pageTitles[location.pathname] ?? 'Страница не найдена';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('rezervika-theme', theme); } catch { /* Storage is optional. */ }
  }, [theme]);
  useEffect(() => { document.title = `${title} — Резервика`; }, [title]);
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const closeSidebar = () => setSidebarOpen(false);
  const changeRole = (value: PreviewRole) => {
    setRole(value);
    setDialog(null);
    setCancellation(null);
    setResourceFormOpen(false);
  };
  const cancelBooking = (booking: CancellationPreview) => {
    if ((!booking.own && !isAdmin) || booking.status === 'cancelled' || booking.status === 'completed') return;
    setDialog(null);
    setCancellation(booking);
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return <AccountPage page={location.pathname.slice(1) as 'login' | 'register'} role={role} />;
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Перейти к содержимому</a>
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Закрыть навигацию" onClick={closeSidebar} />}
    <aside id="main-sidebar" className={`app-sidebar${sidebarOpen ? ' open' : ''}`} onKeyDown={event => { if (event.key === 'Escape') closeSidebar(); }}>
      <Link className="brand" to="/calendar" aria-label="Резервика — календарь" onClick={closeSidebar}>
        <span className="brand-logo" role="img" aria-label="Резервика" />
      </Link>
      <details className="organization-switcher">
        <summary><span className="organization-avatar"><Icon name="building" size={19} /></span><span><strong>Медиацентр «Среда»</strong><small>Организация</small></span><Icon name="chevron-down" size={15} /></summary>
        <div className="organization-menu"><div><span className="connection-dot" />Медиацентр «Среда»<Icon name="check" size={16} /></div><Link to="/organizations" onClick={event => { event.currentTarget.closest('details')?.removeAttribute('open'); closeSidebar(); }}>Мои организации<Icon name="arrow-up-right" size={16} /></Link></div>
      </details>
      <span className="nav-label">ПРОСТРАНСТВО</span>
      <nav className="sidebar-navigation" aria-label="Основная навигация">
        {navigation.filter(item => item.path !== '/approvals' || canApprove).map(item => <NavLink key={item.path} to={item.path} onClick={closeSidebar}><Icon name={item.icon} size={19} /><span>{item.label}</span>{item.count && <small>{isAdmin ? 3 : 2}</small>}</NavLink>)}
      </nav>
      {isAdmin && <><span className="nav-label management-label">УПРАВЛЕНИЕ</span><nav className="sidebar-navigation" aria-label="Управление организацией">{management.map(item => <NavLink key={item.path} to={item.path} onClick={closeSidebar}><Icon name={item.icon} size={19} /><span>{item.label}</span></NavLink>)}</nav></>}
      <div className="sidebar-bottom">
        <div className="sidebar-utility"><button onClick={() => setDialog({ type: 'help' })}><Icon name="help" size={18} />Помощь</button><button className="theme-switch" aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button></div>
        <Link className="sidebar-profile" to="/profile" onClick={closeSidebar}><span className="avatar profile-avatar">АМ</span><span><strong>Анастасия Морозова</strong><small>{roleLabels[role]}</small></span><Icon name="chevron-right" size={15} /></Link>
      </div>
    </aside>
    <div className="app-workspace">
      <header className="topbar">
        <div className="topbar-location"><button className="icon-button mobile-menu" aria-label="Открыть навигацию" aria-expanded={sidebarOpen} aria-controls="main-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}><Icon name="menu" /></button><Icon name="building" size={17} /><span>Медиацентр «Среда»</span><span className="breadcrumb-separator">/</span><strong>{title}</strong></div>
        <div className="topbar-actions">
          <label className="role-picker"><Icon name="user" size={15} /><select aria-label="Роль просмотра" value={role} onChange={event => changeRole(event.target.value as PreviewRole)}><option value="admin">Администратор</option><option value="employee">Сотрудник</option><option value="responsible">Ответственный</option></select></label>
          <button className="icon-button" aria-label="Поиск по пространству" onClick={() => setDialog({ type: 'search' })}><Icon name="search" size={19} /></button>
          <button className="icon-button notification-button" aria-label={`Уведомления: новых — ${isAdmin ? 3 : canApprove ? 2 : 1}`} onClick={() => setDialog({ type: 'notifications' })}><Icon name="bell" size={19} /><span /></button>
          <Link to="/profile" className="avatar topbar-avatar" aria-label="Профиль Анастасии Морозовой">АМ</Link>
        </div>
      </header>
      <main id="main-content" className="main-content">
        <div className="page-heading"><h1>{title}</h1>{['/calendar', '/resources', '/bookings'].includes(location.pathname) && <button className="button button-primary new-booking-button" onClick={() => setDialog({ type: 'booking' })}><Icon name="plus" size={18} />Новое бронирование</button>}</div>
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<CalendarPage role={role} onEvent={event => setDialog({ type: 'event', event })} onInfo={setToast} />} />
          {(['resources', 'bookings', 'approvals', 'team', 'settings'] as const).map(page => <Route key={page} path={`/${page}`} element={((page === 'team' || page === 'settings') && !isAdmin) || (page === 'approvals' && !canApprove) ? <Navigate to="/calendar" replace /> : <WorkspacePage key={`${page}-${role}`} page={page} role={role} onAddResource={() => { if (isAdmin) setResourceFormOpen(true); }} onCancelBooking={cancelBooking} />} />)}
          {(['organizations', 'profile'] as const).map(page => <Route key={page} path={`/${page}`} element={<AccountPage page={page} role={role} />} />)}
          <Route path="*" element={<div className="not-found"><Icon name="search" size={36} /><h2>Страница не найдена</h2><Link to="/calendar" className="button">Открыть календарь</Link></div>} />
        </Routes>
      </main>
    </div>
    {dialog && <PreviewDialog state={dialog} role={role} onCancelBooking={cancelBooking} onClose={() => setDialog(null)} />}
    {resourceFormOpen && isAdmin && <ResourceFormDialog onClose={() => setResourceFormOpen(false)} />}
    {cancellation && <CancellationDialog booking={cancellation} onClose={() => setCancellation(null)} />}
    {toast && <div className="toast" role="status"><Icon name="info" size={19} /><p>{toast}</p><button className="icon-button small" aria-label="Закрыть сообщение" onClick={() => setToast('')}><Icon name="x" size={16} /></button></div>}
  </div>;
}