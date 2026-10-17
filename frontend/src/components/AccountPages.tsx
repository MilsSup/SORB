import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import { roleLabels } from '../demo';
import type { PreviewRole } from '../demo';
import './account-pages.css';

type AccountPageName = 'login' | 'register' | 'organizations' | 'profile';
type OrganizationDialog = 'create' | 'find' | 'invite' | null;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="ac-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function ServiceNotice({ children }: { children: ReactNode }) {
  return <div className="ac-notice" role="alert"><Icon name="info" size={17} /><span>{children}</span></div>;
}

function AuthPage({ register }: { register: boolean }) {
  const [notice, setNotice] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(register ? 'Регистрация недоступна.' : 'Вход недоступен.');
  }
  return <main className="ac-auth">
    <section className="ac-auth-story" aria-label="О Резервике">
      <Link to="/calendar" className="ac-auth-brand" aria-label="Резервика — открыть календарь"><img src="/brand/rezervika.png" alt="Резервика" /></Link>
      <div className="ac-story-content">
        <span className="ac-story-eyebrow">РЕСУРСЫ ОРГАНИЗАЦИИ</span>
        <h1>Календарь<br /><em>вашей команды</em></h1>
        <p>Бронируйте помещения, оборудование<br className="ac-desktop-break" /> и время специалистов.</p>
        <div className="ac-story-art" aria-hidden="true">
          <div className="ac-art-card ac-art-calendar">
            <div className="ac-art-card-head"><span>Октябрь 2026</span><Icon name="calendar" size={18} /></div>
            <div className="ac-art-week"><span>ПН</span><span>ВТ</span><span>СР</span><span>ЧТ</span><span>ПТ</span></div>
            <div className="ac-art-days">{[12, 13, 14, 15, 16].map(day => <span key={day} className={day === 14 ? 'ac-art-day-current' : ''}>{day}</span>)}</div>
            <div className="ac-art-booking"><span className="ac-art-booking-line" /><div><b>Съемка нового проекта</b><span>10:00 – 12:00 · Фотостудия</span></div><span className="ac-art-avatar">АМ</span></div>
            <div className="ac-art-booking ac-art-booking-muted"><span className="ac-art-booking-line" /><div><b>Встреча команды</b><span>14:00 – 15:00 · Переговорная</span></div></div>
          </div>
          <div className="ac-art-card ac-art-resource"><span className="ac-art-resource-icon"><Icon name="camera" size={21} /></span><div><b>Камера Sony A7 IV</b><span><i /> Доступна для бронирования</span></div></div>
        </div>
      </div>
      <div className="ac-story-footer"><span>© Резервика, 2026</span></div>
    </section>
    <section className="ac-auth-form-side">
      <div className="ac-auth-top">{register ? 'Уже есть аккаунт?' : 'Первый раз здесь?'} <Link to={register ? '/login' : '/register'}>{register ? 'Войти' : 'Создать аккаунт'} <Icon name="arrow-up-right" size={15} /></Link></div>
      <div className="ac-auth-form-wrap">
        <span className="ac-auth-welcome"><Icon name={register ? 'users' : 'user'} size={20} /></span>
        <h2>{register ? 'Создать аккаунт' : 'Вход в аккаунт'}</h2>
        <p className="ac-auth-description">{register ? 'Укажите свои данные для регистрации.' : 'Введите почту и пароль.'}</p>
        <form onSubmit={submit} className="ac-auth-form">
          {register && <Field label="Имя и фамилия"><div className="ac-input-icon"><Icon name="user" size={18} /><input name="name" autoComplete="name" placeholder="Как к вам обращаться" required /></div></Field>}
          <Field label="Электронная почта"><div className="ac-input-icon"><Icon name="mail" size={18} /><input type="email" name="email" autoComplete="email" placeholder="you@company.ru" required /></div></Field>
          <Field label="Пароль" hint={register ? 'Не менее 8 символов' : undefined}><div className="ac-input-icon"><Icon name="lock" size={18} /><input type="password" name="password" autoComplete={register ? 'new-password' : 'current-password'} placeholder={register ? 'Придумайте надежный пароль' : 'Введите пароль'} minLength={register ? 8 : undefined} required /></div></Field>
          {!register && <div className="ac-login-options"><label className="ac-checkbox"><input type="checkbox" defaultChecked /><span>Запомнить меня</span></label><button type="button" onClick={() => setNotice('Восстановление пароля недоступно.')}>Забыли пароль?</button></div>}
          {register && <label className="ac-checkbox ac-auth-consent"><input type="checkbox" required /><span>Я согласен с условиями использования и обработкой персональных данных</span></label>}
          <button type="submit" className="ac-button ac-button-primary ac-auth-submit">{register ? 'Создать аккаунт' : 'Войти в аккаунт'}<Icon name="arrow-right" size={18} /></button>
          {notice && <ServiceNotice>{notice}</ServiceNotice>}
        </form>
        <div className="ac-auth-divider"><span />или<span /></div>
        <Link className="ac-button ac-button-outline ac-calendar-button" to="/calendar">Открыть календарь <Icon name="arrow-up-right" size={17} /></Link>
        {register && <p className="ac-auth-email-note"><Icon name="mail" size={15} /> После регистрации потребуется подтвердить email.</p>}
      </div>
    </section>
  </main>;
}

function OrganizationForm({ mode, close }: { mode: Exclude<OrganizationDialog, null>; close: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const titles = { create: 'Новая организация', find: 'Найти свою команду', invite: 'Пригласить участника' };
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>('input')?.focus();
    return () => {
      dialog?.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(mode === 'find' ? 'Поиск организаций недоступен.' : mode === 'invite' ? 'Отправка приглашения недоступна.' : 'Создание организации недоступно.');
  }
  return <dialog ref={dialogRef} className="ac-dialog" aria-labelledby="ac-dialog-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  }}>
      <div className="ac-dialog-head"><span className="ac-section-symbol"><Icon name={mode === 'find' ? 'search' : mode === 'invite' ? 'mail' : 'building'} size={23} /></span><button className="ac-icon-button" type="button" aria-label="Закрыть" onClick={close}><Icon name="x" size={20} /></button></div>
      <h2 id="ac-dialog-title">{titles[mode]}</h2>
      <p>{mode === 'create' ? 'Укажите название и часовой пояс организации.' : mode === 'find' ? 'Введите название или ИНН организации. Для вступления потребуется одобрение администратора.' : 'Приглашенный участник присоединится без дополнительного согласования.'}</p>
      <form onSubmit={submit} className="ac-dialog-form">
        {mode === 'create' && <>
          <Field label="Название организации"><input name="organization" placeholder="Например, Медиацентр «Среда»" required /></Field>
          <Field label="ИНН" hint="Необязательно. Если указан, должен быть уникальным."><input name="inn" placeholder="10 или 12 цифр" inputMode="numeric" pattern="(?:[0-9]{10}|[0-9]{12})" /></Field>
          <Field label="Часовой пояс"><select defaultValue="Asia/Barnaul"><option value="Asia/Barnaul">Барнаул · UTC+7</option><option value="Europe/Moscow">Москва · UTC+3</option><option value="Asia/Novosibirsk">Новосибирск · UTC+7</option></select></Field>
          <label className="ac-checkbox ac-discovery-check"><input type="checkbox" defaultChecked /><span>Разрешить поиск организации<small>Пользователи смогут найти вас по названию или ИНН</small></span></label>
        </>}
        {mode === 'find' && <><Field label="Название или ИНН" hint="Для поиска введите не менее 3 символов."><div className="ac-input-icon"><Icon name="search" size={18} /><input value={query} onChange={event => setQuery(event.target.value)} name="query" placeholder="Название вашей организации" minLength={3} required /></div></Field><div className="ac-find-info"><Icon name="lock" size={19} /><span>Закрытые организации доступны только по персональному приглашению.</span></div></>}
        {mode === 'invite' && <><Field label="Электронная почта"><input type="email" name="invite-email" placeholder="colleague@company.ru" required /></Field><Field label="Роль в организации"><select defaultValue="employee"><option value="employee">Сотрудник</option><option value="administrator">Администратор</option></select></Field><div className="ac-find-info"><Icon name="clock" size={19} /><span>Приглашение привязано к этому email, действует 7 дней и используется один раз.</span></div></>}
        {notice && <ServiceNotice>{notice}</ServiceNotice>}
        <div className="ac-dialog-actions"><button className="ac-button ac-button-outline" type="button" onClick={close}>Отмена</button><button className="ac-button ac-button-primary" type="submit" disabled={mode === 'find' && query.trim().length < 3}>{mode === 'create' ? 'Создать организацию' : mode === 'find' ? 'Найти организацию' : 'Отправить приглашение'}<Icon name="arrow-right" size={16} /></button></div>
      </form>
  </dialog>;
}

function OrganizationsPage({ role }: { role: PreviewRole }) {
  const [dialog, setDialog] = useState<OrganizationDialog>(null);
  const [notice, setNotice] = useState('');
  return <div className="ac-account-content">
    <div className="ac-organizations-toolbar"><div><h2>Ваши организации</h2><p>Выберите организацию для работы с её ресурсами.</p></div><div className="ac-toolbar-buttons"><button className="ac-button ac-button-outline" type="button" onClick={() => setDialog('find')}><Icon name="search" size={17} />Найти организацию</button><button className="ac-button ac-button-primary" type="button" onClick={() => setDialog('create')}><Icon name="plus" size={18} />Создать организацию</button></div></div>
    <div className="ac-organizations-grid">
      <article className="ac-org-card ac-org-card-current"><div className="ac-org-card-top"><span className="ac-org-avatar">с<span>•</span></span><span className="ac-current-badge"><span />Текущая организация</span></div><p className="ac-org-type">МЕДИА И ТВОРЧЕСТВО</p><h3>Медиацентр «Среда»</h3><p className="ac-org-description">Барнаул · UTC+7</p><div className="ac-org-stats"><span><Icon name="users" size={16} />18 участников</span><span><Icon name="building" size={16} />7 ресурсов</span></div><div className="ac-org-card-bottom"><span className="ac-role-badge"><Icon name="shield" size={14} />{roleLabels[role]}</span><Link to="/calendar">Календарь<Icon name="arrow-right" size={17} /></Link></div></article>
      <article className="ac-org-card"><div className="ac-org-card-top"><span className="ac-org-avatar ac-org-avatar-amber">в<span>↗</span></span><span className="ac-org-timezone">UTC+7 · Барнаул</span></div><p className="ac-org-type">ОБРАЗОВАНИЕ</p><h3>Учебный центр «Вектор»</h3><div className="ac-org-stats"><span><Icon name="users" size={16} />24 участника</span><span><Icon name="building" size={16} />14 ресурсов</span></div><div className="ac-org-card-bottom"><span className="ac-role-badge ac-role-badge-neutral">Сотрудник</span><button className="ac-org-open-link" type="button" onClick={() => setNotice('Переключение организации недоступно.')}>Открыть<Icon name="arrow-right" size={17} /></button></div></article>
    </div>
    {notice && <div className="ac-organization-notice"><ServiceNotice>{notice}</ServiceNotice></div>}
    {role === 'admin' && <section className="ac-team-banner"><span className="ac-section-symbol" aria-hidden="true"><Icon name="users" size={21} /></span><div className="ac-team-banner-copy"><h3>Участники Медиацентра «Среда»</h3><p>Пригласите сотрудника по электронной почте.</p></div><button className="ac-button ac-button-outline" type="button" onClick={() => setDialog('invite')}><Icon name="mail" size={17} />Пригласить коллегу</button></section>}
    <p className="ac-organizations-help">Роль и доступ к ресурсам задаются отдельно в каждой организации.</p>
    {dialog && <OrganizationForm key={dialog} mode={dialog} close={() => setDialog(null)} />}
  </div>;
}

function ProfilePage({ role }: { role: PreviewRole }) {
  const [notice, setNotice] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState('');
  function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setNotice('Сохранение изменений недоступно.'); }
  return <div className="ac-account-content ac-profile-layout">
    <aside className="ac-profile-summary"><div className="ac-profile-cover" /><div className="ac-profile-summary-body"><span className="ac-profile-avatar">АМ</span><h2>Анастасия Морозова</h2><p>anastasia@sreda.ru</p><span className="ac-verified"><Icon name="check" size={14} />Почта подтверждена</span><div className="ac-summary-divider" /><p className="ac-summary-label">ТЕКУЩАЯ ОРГАНИЗАЦИЯ</p><div className="ac-summary-org"><span className="ac-mini-org">с•</span><div><b>Медиацентр «Среда»</b><span>{roleLabels[role]}</span></div></div><Link to="/organizations" className="ac-profile-org-link">Мои организации<Icon name="arrow-up-right" size={16} /></Link></div></aside>
    <div className="ac-profile-main"><section className="ac-profile-panel"><div className="ac-panel-heading"><span className="ac-section-symbol"><Icon name="user" size={20} /></span><div><h3>Личные данные</h3><p>Так вас будут видеть участники вашей команды.</p></div></div><form onSubmit={save}><div className="ac-profile-fields"><Field label="Имя"><input defaultValue="Анастасия" autoComplete="given-name" required /></Field><Field label="Фамилия"><input defaultValue="Морозова" autoComplete="family-name" required /></Field><Field label="Электронная почта" hint="Используется для входа и персональных приглашений."><input type="email" defaultValue="anastasia@sreda.ru" autoComplete="email" required /></Field><Field label="Должность" hint="Необязательно"><input defaultValue="Продюсер проектов" placeholder="Укажите должность" /></Field></div><div className="ac-profile-form-footer"><span>Профиль общий для всех ваших организаций</span><button className="ac-button ac-button-primary" type="submit">Сохранить изменения</button></div>{notice && <ServiceNotice>{notice}</ServiceNotice>}</form></section>
      <section className="ac-profile-panel"><div className="ac-panel-heading"><span className="ac-section-symbol"><Icon name="lock" size={20} /></span><div><h3>Безопасность</h3><p>Управление доступом к вашей учетной записи.</p></div></div><div className="ac-security-row"><div><b>Пароль</b><p>Используйте надежный пароль для защиты аккаунта.</p></div><button type="button" className="ac-button ac-button-outline" onClick={() => setPasswordOpen(!passwordOpen)}>{passwordOpen ? 'Свернуть' : 'Изменить пароль'}<Icon name="chevron-right" size={16} /></button></div>{passwordOpen && <form className="ac-password-form" onSubmit={event => { event.preventDefault(); setPasswordNotice('Изменение пароля недоступно.'); }}><Field label="Текущий пароль"><input type="password" autoComplete="current-password" required /></Field><Field label="Новый пароль" hint="Не менее 8 символов"><input type="password" minLength={8} autoComplete="new-password" required /></Field><button className="ac-button ac-button-primary" type="submit">Обновить пароль</button>{passwordNotice && <ServiceNotice>{passwordNotice}</ServiceNotice>}</form>}</section>
      <p className="ac-profile-note"><Icon name="shield" size={16} />Ваша роль и права определяются отдельно в каждой организации.</p>
    </div>
  </div>;
}

export function AccountPage({ page, role = 'admin' }: { page: AccountPageName; role?: PreviewRole }) {
  if (page === 'login' || page === 'register') return <AuthPage key={page} register={page === 'register'} />;
  if (page === 'profile') return <ProfilePage role={role} />;
  return <OrganizationsPage role={role} />;
}
