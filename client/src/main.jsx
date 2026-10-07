import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const navigation = [
  { label: 'Overview', icon: 'overview' },
  { label: 'Inventory', icon: 'inventory', active: true },
  { label: 'Issues & kits', icon: 'issues', upcoming: true },
  { label: 'Members', icon: 'members', upcoming: true },
];

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    inventory: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    issues: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18m-12 4h6m-6 3h4" /></>,
    members: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1H3Zm13-12a3 3 0 0 1 0 6m2 1a5 5 0 0 1 3 5" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="M3 8v8l9 5 9-5V8m-9 5v8" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5m-18 4 9 5 9-5" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-forest">
        <Icon name="box" className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-lg font-bold leading-tight tracking-tight">PartsPal</p>
        <p className="text-xs text-white/55">Robotics lab</p>
      </div>
    </div>
  );
}

function NavigationItem({ item }) {
  const baseClass = 'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors';
  const colorClass = item.active ? 'bg-white/10 text-white' : 'text-white/55';

  return (
    <div
      aria-current={item.active ? 'page' : undefined}
      aria-disabled={item.upcoming ? 'true' : undefined}
      className={`${baseClass} ${colorClass}`}
      title={item.upcoming ? 'Coming in a later milestone' : undefined}
    >
      <Icon name={item.icon} className="h-[18px] w-[18px]" />
      <span>{item.label}</span>
      {item.upcoming && <span className="ml-auto hidden text-[10px] uppercase tracking-wider text-white/35 sm:block lg:hidden xl:block">Soon</span>}
    </div>
  );
}

function SummaryCard({ label, value, note, icon, tone = 'green' }) {
  const toneClass = tone === 'lime' ? 'bg-lime/25 text-forest' : 'bg-green/10 text-green';

  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted">{note}</p>
    </article>
  );
}

function StockLevel({ available, total }) {
  const ratio = total === 0 ? 0 : available / total;
  const status = available === 0
    ? { label: 'Out of stock', classes: 'bg-rose-50 text-rose-700' }
    : ratio <= 0.25
      ? { label: 'Low stock', classes: 'bg-amber-50 text-amber-700' }
      : { label: 'In stock', classes: 'bg-green/10 text-green' };

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.classes}`}>
      {status.label}
    </span>
  );
}

function InventoryTable({ items }) {
  if (items.length === 0) {
    return (
      <div className="grid min-h-64 place-items-center px-5 text-center">
        <div>
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-soft text-muted"><Icon name="search" /></span>
          <p className="mt-3 text-sm font-semibold">No parts found</p>
          <p className="mt-1 text-xs text-muted">Try another search or category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-y border-line bg-soft/70 text-[10px] font-bold uppercase tracking-[.12em] text-muted">
            <th className="px-5 py-3.5 sm:px-6">Part</th>
            <th className="px-4 py-3.5">Category</th>
            <th className="px-4 py-3.5 text-right">Total stock</th>
            <th className="px-4 py-3.5 text-right">Available</th>
            <th className="px-5 py-3.5 text-right sm:px-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-soft/60">
              <td className="px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime/20 text-green"><Icon name="box" className="h-[18px] w-[18px]" /></span>
                  <span className="text-sm font-semibold">{item.name}</span>
                </div>
              </td>
              <td className="px-4 py-4"><span className="rounded-md bg-soft px-2.5 py-1.5 text-xs font-medium text-muted">{item.category}</span></td>
              <td className="px-4 py-4 text-right text-sm font-medium tabular-nums">{item.totalStock}</td>
              <td className="px-4 py-4 text-right">
                <span className="text-sm font-bold tabular-nums">{item.availableStock}</span>
                <span className="text-xs text-muted"> / {item.totalStock}</span>
              </td>
              <td className="px-5 py-4 text-right sm:px-6"><StockLevel available={item.availableStock} total={item.totalStock} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [inventory, setInventory] = useState(null);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category !== 'All categories') params.set('category', category);
    const query = params.toString();
    const endpoint = `${apiUrl}/api/inventory${query ? `?${query}` : ''}`;

    setStatus((current) => current === 'loading' ? 'loading' : 'refreshing');
    setError('');
    fetch(endpoint, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
        if (!Array.isArray(data.items) || !Array.isArray(data.categories) || !data.summary) {
          throw new Error('The inventory response was not in the expected format.');
        }
        return data;
      })
      .then((data) => {
        setInventory(data.items);
        setCategories(data.categories);
        setSummary(data.summary);
        setStatus('ready');
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message || 'Could not load inventory.');
        setStatus('error');
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [search, category]);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-green">LAB WORKSPACE</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Parts inventory</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">A live view of the components available in your robotics lab.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted">
          <span className={`h-2 w-2 rounded-full ${status === 'ready' || status === 'refreshing' ? 'bg-green' : status === 'error' ? 'bg-rose-500' : 'animate-pulse bg-amber-400'}`} />
          {status === 'ready' || status === 'refreshing' ? 'Inventory live' : status === 'error' ? 'Connection issue' : 'Loading inventory'}
        </span>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Part types" value={summary?.partTypes ?? '—'} note="Unique components tracked" icon="box" />
        <SummaryCard label="Total stock" value={summary?.totalStock ?? '—'} note="Units owned by the lab" icon="layers" tone="lime" />
        <SummaryCard label="Available now" value={summary?.availableStock ?? '—'} note="Ready to issue to members" icon="inventory" />
      </div>

      <section aria-labelledby="inventory-heading" className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6 sm:py-5">
          <div>
            <h2 id="inventory-heading" className="font-display text-base font-bold">All parts</h2>
            <p className="mt-1 text-xs text-muted">{inventory ? `${inventory.length} ${inventory.length === 1 ? 'part' : 'parts'} shown` : 'Loading inventory records'}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <label className="relative block sm:w-56">
              <span className="sr-only">Search parts</span>
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-green focus:ring-2 focus:ring-green/10"
                maxLength={100}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search parts…"
                type="search"
                value={search}
              />
            </label>
            <label className="relative block sm:w-48">
              <span className="sr-only">Filter by category</span>
              <Icon name="filter" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                className="h-10 w-full appearance-none rounded-lg border border-line bg-white pl-9 pr-8 text-sm outline-none transition focus:border-green focus:ring-2 focus:ring-green/10"
                onChange={(event) => setCategory(event.target.value)}
                value={category}
              >
                <option>All categories</option>
                {categories.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:mx-6" role="alert">
            <p className="font-semibold">Unable to load inventory</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        )}

        {inventory === null ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted" role="status">Loading parts…</div>
        ) : (
          <InventoryTable items={inventory} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-soft/50 px-5 py-3.5 text-xs text-muted sm:px-6">
          <span>Available stock reflects parts currently on the shelf.</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green" />Live from PartsPal API</span>
        </div>
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>PartsPal · Robotics Club, VIT Chennai</span>
        <span>Inventory · Milestone 02 / 06</span>
      </footer>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto min-h-screen max-w-[1600px] lg:flex">
        <aside className="bg-forest text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[250px] lg:shrink-0 lg:flex-col">
          <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
            <Brand />
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60 lg:hidden">VIT Chennai</span>
          </div>
          <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible lg:px-4 lg:py-5">
            <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/35 lg:block">Workspace</p>
            {navigation.map((item) => <NavigationItem key={item.label} item={item} />)}
          </nav>
          <div className="mt-auto hidden border-t border-white/10 px-6 py-5 lg:block">
            <p className="text-xs font-semibold text-white/75">Robotics Club</p>
            <p className="mt-1 text-xs text-white/40">VIT Chennai · Web Dev Round 2</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[66px] items-center justify-between border-b border-line bg-white/80 px-5 sm:px-8 lg:px-10">
            <p className="text-sm font-medium text-muted">Workspace <span className="mx-2 text-slate-300">/</span><span className="text-ink">Inventory</span></p>
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-line">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-lime/30 text-[10px] font-bold text-forest">RC</span>
              <span className="hidden text-xs font-semibold text-ink sm:inline">Robotics Club</span>
            </div>
          </header>
          <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <InventoryPage />
          </main>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
