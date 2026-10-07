import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const navigation = [
  { label: 'Overview', icon: 'overview' },
  { label: 'Inventory', icon: 'inventory', active: true },
  { label: 'Issues & kits', icon: 'issues' },
  { label: 'Members', icon: 'members', upcoming: true },
];

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, options);
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an unreadable response.');
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}

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
    return: <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5m4-1v5l3 2" /></>,
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

function InventoryPage({ refreshToken }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [inventory, setInventory] = useState(null);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, [search, category, refreshToken]);

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
        <span>Core workflows · Milestone 04 / 06</span>
      </footer>
    </>
  );
}

function localDateAfter(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function displayDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function IssueManager({ onInventoryChange }) {
  const [parts, setParts] = useState([]);
  const [kits, setKits] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [returningId, setReturningId] = useState('');
  const [issueType, setIssueType] = useState('part');
  const [form, setForm] = useState({
    memberName: '',
    registrationNumber: '',
    dueDate: localDateAfter(7),
    partId: '',
    kitId: '',
    quantity: '1',
  });

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest('/api/inventory'), apiRequest('/api/issues'), apiRequest('/api/kits')])
      .then(([inventoryData, issueData, kitData]) => {
        if (!active) return;
        setParts(inventoryData.items);
        setIssues(issueData.issues);
        setKits(kitData.kits);
        setLoadError('');
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message || 'Could not load issue information.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedPart = parts.find((part) => part.id === form.partId);
  const selectedKit = kits.find((kit) => kit.id === form.kitId);
  const kitComponents = selectedKit?.components.map((component) => ({
    ...component,
    available: (parts.find((part) => part.id === component.partId)?.availableStock ?? 0),
  })) ?? [];
  const selectedKitAvailable = kitComponents.length > 0
    && kitComponents.every((component) => component.available >= component.quantity);
  const availableParts = parts.filter((part) => part.availableStock > 0);
  const activeCount = issues.filter((issue) => issue.status === 'active').length;

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError('');
    setFeedback(null);
  }

  async function submitIssue(event) {
    event.preventDefault();
    setBusy(true);
    setFormError('');
    setFeedback(null);

    try {
      const data = await apiRequest('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: form.memberName,
          registrationNumber: form.registrationNumber,
          dueDate: form.dueDate,
          ...(issueType === 'kit'
            ? { kitId: form.kitId }
            : { partId: form.partId, quantity: Number(form.quantity) }),
        }),
      });
      setIssues((current) => [data.issue, ...current]);
      setParts((current) => current.map((part) => (
        data.issue.components.some((component) => component.partId === part.id)
          ? {
            ...part,
            availableStock: part.availableStock - data.issue.components
              .filter((component) => component.partId === part.id)
              .reduce((total, component) => total + component.quantity, 0),
          }
          : part
      )));
      setForm((current) => ({
        ...current,
        memberName: '',
        registrationNumber: '',
        dueDate: localDateAfter(7),
        partId: '',
        kitId: '',
        quantity: '1',
      }));
      setFeedback({ type: 'success', message: data.message });
      onInventoryChange();
    } catch (requestError) {
      setFormError(requestError.message || 'Could not issue this part.');
    } finally {
      setBusy(false);
    }
  }

  async function returnIssue(issue) {
    setReturningId(issue.id);
    setFormError('');
    setFeedback(null);
    try {
      const data = await apiRequest(`/api/issues/${encodeURIComponent(issue.id)}/return`, {
        method: 'PATCH',
      });
      setIssues((current) => current.map((item) => item.id === issue.id ? data.issue : item));
      setParts((current) => current.map((part) => (
        data.issue.components.some((component) => component.partId === part.id)
          ? {
            ...part,
            availableStock: part.availableStock + data.issue.components
              .filter((component) => component.partId === part.id)
              .reduce((total, component) => total + component.quantity, 0),
          }
          : part
      )));
      setFeedback({ type: 'success', message: data.message });
      onInventoryChange();
    } catch (requestError) {
      setFormError(requestError.message || 'Could not return this issue.');
    } finally {
      setReturningId('');
    }
  }

  return (
    <section className="mt-7" aria-labelledby="issues-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.14em] text-green">CHECKOUT DESK</p>
          <h2 id="issues-heading" className="font-display text-xl font-bold tracking-tight">Part issues & returns</h2>
          <p className="mt-1 text-sm text-muted">Check parts out to members and record them back in.</p>
        </div>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted">
          {activeCount} active {activeCount === 1 ? 'issue' : 'issues'}
        </span>
      </div>

      {loadError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{loadError}</div>}
      {feedback && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green/20 bg-green/5 text-green' : 'border-rose-200 bg-rose-50 text-rose-800'}`} role="status">
          {feedback.message}
        </div>
      )}
      {formError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{formError}</div>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,.8fr)_minmax(0,1.5fr)]">
        <form className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6" onSubmit={submitIssue}>
          <div className="mb-5">
            <h3 className="font-display text-base font-bold">Issue inventory</h3>
            <p className="mt-1 text-xs text-muted">Check out a single part or an assembled kit.</p>
          </div>
          <div className="space-y-4">
            <div aria-label="Issue type" className="grid grid-cols-2 rounded-lg bg-soft p-1" role="group">
              {['part', 'kit'].map((type) => (
                <button
                  aria-pressed={issueType === type}
                  className={`rounded-md px-3 py-2 text-xs font-semibold capitalize transition ${issueType === type ? 'bg-white text-forest shadow-sm' : 'text-muted hover:text-ink'}`}
                  key={type}
                  onClick={() => {
                    setIssueType(type);
                    setFormError('');
                    setFeedback(null);
                  }}
                  type="button"
                >
                  {type === 'part' ? 'Individual part' : 'Kit'}
                </button>
              ))}
            </div>
            <label className="block text-xs font-semibold text-ink">
              Member name
              <input
                autoComplete="name"
                className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                maxLength={80}
                minLength={2}
                onChange={(event) => updateForm('memberName', event.target.value)}
                placeholder="e.g. Asha Kumar"
                required
                value={form.memberName}
              />
            </label>
            <label className="block text-xs font-semibold text-ink">
              Registration number
              <input
                autoComplete="off"
                className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal uppercase outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                maxLength={20}
                minLength={3}
                onChange={(event) => updateForm('registrationNumber', event.target.value)}
                pattern="[A-Za-z0-9\-]{3,20}"
                placeholder="e.g. 23BCE1234"
                required
                value={form.registrationNumber}
              />
            </label>
            {issueType === 'part' ? (
              <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-3">
                <label className="block min-w-0 text-xs font-semibold text-ink">
                  Part
                  <select
                    className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                    onChange={(event) => updateForm('partId', event.target.value)}
                    required
                    value={form.partId}
                  >
                    <option value="">Choose a part</option>
                    {parts.map((part) => (
                      <option disabled={part.availableStock === 0} key={part.id} value={part.id}>
                        {part.name} · {part.availableStock} available
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-ink">
                  Quantity
                  <input
                    className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                    max={selectedPart?.availableStock || undefined}
                    min="1"
                    onChange={(event) => updateForm('quantity', event.target.value)}
                    required
                    type="number"
                    value={form.quantity}
                  />
                </label>
              </div>
            ) : (
              <>
                <label className="block text-xs font-semibold text-ink">
                  Robotics kit
                <select
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                  onChange={(event) => updateForm('kitId', event.target.value)}
                  required
                  value={form.kitId}
                >
                  <option value="">Choose a kit</option>
                  {kits.map((kit) => (
                    <option key={kit.id} value={kit.id}>
                      {kit.name}
                    </option>
                  ))}
                </select>
                </label>
                {selectedKit && (
                  <div className="rounded-lg border border-line bg-soft/60 p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-muted">Kit contents</p>
                    <ul className="space-y-2">
                      {kitComponents.map((component) => (
                        <li className="flex items-center justify-between gap-2 text-xs" key={component.partId}>
                          <span className="font-medium text-ink">{component.partName}<span className="ml-1.5 text-muted">× {component.quantity}</span></span>
                          <span className={`whitespace-nowrap ${component.available < component.quantity ? 'font-semibold text-rose-700' : 'text-muted'}`}>
                            {component.available} available
                          </span>
                        </li>
                      ))}
                    </ul>
                    {!selectedKitAvailable && (
                      <p className="mt-2 border-t border-line pt-2 text-[11px] font-medium text-rose-700">One or more parts are unavailable. This kit cannot be issued.</p>
                    )}
                  </div>
                )}
              </>
            )}
            <label className="block text-xs font-semibold text-ink">
              Due date
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                min={localDateAfter(0)}
                onChange={(event) => updateForm('dueDate', event.target.value)}
                required
                type="date"
                value={form.dueDate}
              />
            </label>
            <button
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 text-sm font-semibold text-white transition hover:bg-green disabled:cursor-not-allowed disabled:opacity-55"
              disabled={busy || loading || (issueType === 'part' ? availableParts.length === 0 : !selectedKit)}
              type="submit"
            >
              {busy ? 'Issuing…' : issueType === 'kit' ? 'Issue kit' : 'Issue part'}
            </button>
            {issueType === 'part' && availableParts.length === 0 && !loading && <p className="text-center text-xs text-amber-700">No parts are currently available to issue.</p>}
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card" aria-labelledby="current-issues-heading">
          <div className="flex items-center justify-between gap-3 p-5 sm:px-6 sm:py-5">
            <div>
              <h3 id="current-issues-heading" className="font-display text-base font-bold">Checkout history</h3>
              <p className="mt-1 text-xs text-muted">Track member checkouts and record returns.</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime/25 text-green"><Icon name="return" className="h-[18px] w-[18px]" /></span>
          </div>
          {loading ? (
            <div className="grid min-h-44 place-items-center text-sm text-muted" role="status">Loading checkouts…</div>
          ) : issues.length === 0 ? (
            <div className="grid min-h-44 place-items-center px-5 text-center">
              <div>
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-soft text-muted"><Icon name="issues" /></span>
                <p className="mt-3 text-sm font-semibold">No checkouts yet</p>
                <p className="mt-1 text-xs text-muted">Issued parts will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="max-h-[640px] divide-y divide-line overflow-y-auto">
              {issues.map((issue) => (
                <article className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" key={issue.id}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-green"><Icon name="box" className="h-[18px] w-[18px]" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{issue.memberName}<span className="ml-2 font-normal text-muted">{issue.registrationNumber}</span></p>
                      {issue.type === 'kit' ? (
                        <div className="mt-1">
                          <p className="text-xs font-medium text-ink">{issue.kitName}</p>
                          <p className="mt-1 text-[11px] leading-5 text-muted">
                            {issue.components.map((component) => `${component.quantity} × ${component.partName}`).join(' · ')}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-ink">{issue.quantity} × {issue.partName}</p>
                      )}
                      <p className="mt-1 text-[11px] text-muted">Due {displayDate(issue.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pl-12 sm:justify-end sm:pl-0">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${issue.status === 'active' ? 'bg-amber-50 text-amber-700' : 'bg-green/10 text-green'}`}>
                      {issue.status === 'active' ? 'Checked out' : 'Returned'}
                    </span>
                    {issue.status === 'active' && (
                      <button
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-green hover:text-green disabled:cursor-wait disabled:opacity-50"
                        disabled={returningId === issue.id}
                        onClick={() => returnIssue(issue)}
                        type="button"
                      >
                        {returningId === issue.id ? 'Returning…' : 'Return'}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="border-t border-line bg-soft/50 px-5 py-3.5 text-xs text-muted sm:px-6">
            Issue records are held in server memory and reset when the backend restarts.
          </div>
        </section>
      </div>
    </section>
  );
}

function App() {
  const [refreshToken, setRefreshToken] = useState(0);

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
            <InventoryPage refreshToken={refreshToken} />
            <IssueManager onInventoryChange={() => setRefreshToken((current) => current + 1)} />
          </main>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
