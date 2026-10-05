import { useQuery } from '@tanstack/react-query';
import { api } from './api/client';

export function App() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get<{ status: string }>('/health')).data,
    retry: false,
  });
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold tracking-widest text-teal-400">SORB</p>
        <h1 className="mt-4 text-4xl font-semibold">Бронирование общих ресурсов</h1>
        <p className="mt-5 text-slate-300">Окружение разработки подготовлено. Следующий этап — реестр ресурсов и календарь бронирований.</p>
        <p role="status" className="mt-8 rounded-xl border border-slate-700 p-4">
          API: {health.isPending ? 'проверка соединения…' : health.isError ? 'недоступен — запустите backend' : health.data.status === 'ok' ? 'соединение установлено' : 'неожиданный ответ'}
        </p>
      </div>
    </main>
  );
}
