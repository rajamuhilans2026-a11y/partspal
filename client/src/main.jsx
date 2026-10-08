import React, { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Box,
  Boxes,
  CalendarDays,
  Cpu,
  Filter,
  History,
  LayoutDashboard,
  Layers3,
  ListFilter,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react';
import './style.css';

const CategoryStockChart = lazy(() => import('./CategoryStockChart.jsx'));

const navigation = [
  { label: 'Overview', icon: 'overview', href: '#overview' },
  { label: 'Inventory', icon: 'inventory', href: '#inventory' },
  { label: 'Issue & return', icon: 'issues', href: '#issue-form' },
  { label: 'Checkout history', icon: 'history', href: '#checkout-history' },
  { label: 'Members', icon: 'members', href: '#member-search' },
  { label: 'Kit details', icon: 'kits', href: '#kit-details' },
];

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiUrl = (configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:4000' : '')).replace(/\/+$/, '');

async function apiRequest(path, options = {}) {
  if (!apiUrl) {
    throw new Error('The RoboRack API address is not configured. Set VITE_API_URL to https://partspal.onrender.com in Vercel, then redeploy the Production build.');
  }

  let response;
  try {
    response = await fetch(`${apiUrl}${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    const origin = window.location.origin;
    throw new Error(`Could not connect to ${apiUrl}. Check VITE_API_URL, confirm Render CLIENT_ORIGIN allows ${origin} exactly (without a trailing slash), and check whether the Render backend is sleeping or unavailable.`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an unreadable response.');
  }
  if (!response.ok) {
    const detailMessage = data.details && typeof data.details === 'object'
      ? Object.values(data.details).filter((detail) => typeof detail === 'string').join(' ')
      : '';
    throw new Error([data.error, detailMessage].filter(Boolean).join(' ') || `Request failed (${response.status}).`);
  }
  return data;
}

function Icon({ name, className = 'h-5 w-5' }) {
  const icons = {
    overview: LayoutDashboard,
    inventory: Boxes,
    issues: ArrowLeftRight,
    history: History,
    members: Users,
    kits: Cpu,
    search: Search,
    box: Box,
    layers: Layers3,
    arrow: ArrowUpRight,
    filter: Filter,
    return: RotateCcw,
    calendar: CalendarDays,
    listFilter: ListFilter,
  };
  const IconComponent = icons[name] || Box;

  return <IconComponent aria-hidden="true" className={className} strokeWidth={1.8} />;
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-forest shadow-[0_5px_18px_rgba(201,237,117,.16)]">
        <Icon name="kits" className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-lg font-bold leading-tight tracking-tight">RoboRack</p>
        <p className="mt-0.5 text-[11px] text-white/55">Robotics lab inventory</p>
      </div>
    </div>
  );
}

function NavigationItem({ item }) {
  const baseClass = 'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors';

  return (
    <a className={`${baseClass} text-white/65 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime`} href={item.href}>
      <Icon name={item.icon} className="h-[18px] w-[18px]" />
      <span>{item.label}</span>
    </a>
  );
}

function SummaryCard({ label, value, note, icon, tone = 'green' }) {
  const toneClass = tone === 'lime' ? 'bg-lime/25 text-forest' : 'bg-green/10 text-green';

  return (
    <article className="group rounded-2xl border border-line/90 bg-white p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${toneClass}`}>
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

function InventoryTable({ items, onEdit, onRestock }) {
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
      <table className="w-full min-w-[880px] text-left">
        <thead>
          <tr className="border-y border-line bg-soft/70 text-[10px] font-bold uppercase tracking-[.12em] text-muted">
            <th className="px-5 py-3.5 sm:px-6">Part</th>
            <th className="px-4 py-3.5">Category</th>
            <th className="px-4 py-3.5 text-right">Total stock</th>
            <th className="px-4 py-3.5 text-right">Available</th>
            <th className="px-5 py-3.5 text-right sm:px-6">Status</th>
            <th className="px-5 py-3.5 text-right sm:px-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-soft/60">
              <td className="px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime/20 text-green"><Icon name="box" className="h-[18px] w-[18px]" /></span>
                  <span>
                    <span className="text-sm font-semibold">{item.name}</span>
                    {item.isExample && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">Example</span>}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4"><span className="rounded-md bg-soft px-2.5 py-1.5 text-xs font-medium text-muted">{item.category}</span></td>
              <td className="px-4 py-4 text-right text-sm font-medium tabular-nums">{item.totalStock}</td>
              <td className="px-4 py-4 text-right">
                <span className="text-sm font-bold tabular-nums">{item.availableStock}</span>
                <span className="text-xs text-muted"> / {item.totalStock}</span>
              </td>
              <td className="px-5 py-4 text-right sm:px-6"><StockLevel available={item.availableStock} total={item.totalStock} /></td>
              <td className="px-5 py-4 text-right sm:px-6">
                <div className="flex justify-end gap-2">
                  <button
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-green hover:text-green"
                    onClick={() => onRestock(item)}
                    type="button"
                  >
                    Restock
                  </button>
                  <button
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-green hover:text-green"
                    onClick={() => onEdit(item)}
                    type="button"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryFormDialog({ mode, onClose, onSaved }) {
  const dialogRef = React.useRef(null);
  const isRestock = mode.type === 'restock';
  const isEdit = mode.type === 'edit';
  const [name, setName] = useState(mode.part?.name ?? '');
  const [category, setCategory] = useState(mode.part?.category ?? '');
  const [quantity, setQuantity] = useState(isRestock ? '' : String(mode.part?.totalStock ?? ''));
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const title = isRestock ? `Restock ${mode.part.name}` : isEdit ? `Edit ${mode.part.name}` : 'Add part';

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    if (!isRestock && !name.trim()) {
      setFormError('Enter a part name.');
      return;
    }
    if (!isRestock && !category.trim()) {
      setFormError('Enter a category.');
      return;
    }
    if (!/^[1-9]\d*$/.test(quantity) || !Number.isSafeInteger(Number(quantity))) {
      setFormError(isRestock
        ? 'Enter a positive whole number of new units.'
        : 'Enter total stock as a positive whole number.');
      return;
    }

    setBusy(true);
    try {
      const path = isRestock
        ? `/api/inventory/${encodeURIComponent(mode.part.id)}/restock`
        : isEdit
          ? `/api/inventory/${encodeURIComponent(mode.part.id)}`
          : '/api/inventory';
      const body = isRestock
        ? { quantity: Number(quantity) }
        : { name, category, totalStock: Number(quantity) };
      const data = await apiRequest(path, {
        method: isRestock ? 'POST' : isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      onSaved(data.message, data.part);
    } catch (requestError) {
      setFormError(requestError.message || 'Could not save this inventory change.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      aria-labelledby="inventory-dialog-title"
      className="w-[min(100%-2rem,30rem)] rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-forest/40"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <form className="space-y-4 p-5 sm:p-6" noValidate onSubmit={submit}>
        <div>
          <h2 className="font-display text-lg font-bold" id="inventory-dialog-title">{title}</h2>
          <p className="mt-1 text-xs text-muted">
            {isRestock
              ? 'Restocking adds newly acquired units to total and available stock.'
              : isEdit
                ? 'Editing total stock preserves the units currently checked out.'
                : 'New parts start with all owned units available.'}
          </p>
        </div>
        {!isRestock && (
          <>
            <label className="block text-xs font-semibold text-ink">
              Part name
              <input
                autoFocus
                className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>
            <label className="block text-xs font-semibold text-ink">
              Category
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                maxLength={60}
                onChange={(event) => setCategory(event.target.value)}
                value={category}
              />
            </label>
          </>
        )}
        <label className="block text-xs font-semibold text-ink">
          {isRestock ? 'New units to add' : 'Total units owned'}
          <input
            className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/10"
            inputMode="numeric"
            onChange={(event) => setQuantity(event.target.value)}
            value={quantity}
          />
        </label>
        {formError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{formError}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button
            className="h-10 rounded-lg border border-line px-4 text-sm font-semibold text-ink hover:border-green"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-lg bg-forest px-4 text-sm font-semibold text-white transition hover:bg-green disabled:cursor-wait disabled:opacity-55"
            disabled={busy}
            type="submit"
          >
            {busy ? 'Saving…' : isRestock ? 'Restock' : isEdit ? 'Save changes' : 'Add part'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function InventoryPage({ refreshToken, onInventoryChange }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [inventoryData, setInventoryData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [activeEditor, setActiveEditor] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category !== 'All categories') params.set('category', category);
    const query = params.toString();

    setStatus((current) => current === 'loading' ? 'loading' : 'refreshing');
    setError('');
    apiRequest(`/api/inventory${query ? `?${query}` : ''}`, { signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data.items) || !Array.isArray(data.categories) || !Array.isArray(data.categoryStock) || !data.summary) {
          throw new Error('The inventory response was not in the expected format.');
        }
        return data;
      })
      .then((data) => {
        setInventoryData(data);
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
        <div id="overview" className="scroll-mt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-green">LAB WORKSPACE</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Parts inventory</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">A live view of the components available in your robotics lab.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted">
          <span className={`h-2 w-2 rounded-full ${status === 'ready' || status === 'refreshing' ? 'bg-green' : status === 'error' ? 'bg-rose-500' : 'animate-pulse bg-amber-400'}`} />
          {status === 'ready' || status === 'refreshing' ? 'Inventory live' : status === 'error' ? 'Connection issue' : 'Loading inventory'}
        </span>
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">Starter inventory is example data.</p>
        <p className="mt-1 text-xs leading-5">Correct each example part to match your actual inventory. Manual changes are held in memory and reset when the backend restarts.</p>
      </div>
      {feedback && <div className="mb-4 rounded-lg border border-green/20 bg-green/5 px-4 py-3 text-sm text-green" role="status">{feedback}</div>}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Part types" value={inventoryData?.summary.partTypes ?? '—'} note="Unique components tracked" icon="box" />
        <SummaryCard label="Total stock" value={inventoryData?.summary.totalStock ?? '—'} note="Units owned by the lab" icon="layers" tone="lime" />
        <SummaryCard label="Available now" value={inventoryData?.summary.availableStock ?? '—'} note="Ready to issue to members" icon="inventory" />
      </div>

      <Suspense fallback={(
        <section aria-labelledby="stock-chart-heading" className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
          <h2 id="stock-chart-heading" className="font-display text-base font-bold">Stock by category</h2>
          <div className="grid h-[260px] place-items-center text-sm text-muted" role="status">Loading chart…</div>
        </section>
      )}>
        <CategoryStockChart data={inventoryData?.categoryStock ?? []} status={status} error={error} />
      </Suspense>

      <section aria-labelledby="inventory-heading" className="scroll-mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card" id="inventory">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6 sm:py-5">
          <div>
            <h2 id="inventory-heading" className="font-display text-base font-bold">All parts</h2>
            <p className="mt-1 text-xs text-muted">{inventoryData ? `${inventoryData.items.length} ${inventoryData.items.length === 1 ? 'part' : 'parts'} shown` : 'Loading inventory records'}</p>
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
                {inventoryData?.categories.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <button
              className="h-10 rounded-lg bg-forest px-4 text-sm font-semibold text-white transition hover:bg-green"
              onClick={() => {
                setFeedback('');
                setActiveEditor({ type: 'add' });
              }}
              type="button"
            >
              Add Part
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:mx-6" role="alert">
            <p className="font-semibold">Unable to load inventory</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        )}

        {inventoryData === null ? (
          <div className="grid min-h-64 place-items-center px-5 text-center text-sm text-muted" role={status === 'error' ? 'alert' : 'status'}>
            {status === 'error' ? `Unable to load inventory: ${error}` : 'Loading parts…'}
          </div>
        ) : (
          <InventoryTable
            items={inventoryData.items}
            onEdit={(part) => {
              setFeedback('');
              setActiveEditor({ type: 'edit', part });
            }}
            onRestock={(part) => {
              setFeedback('');
              setActiveEditor({ type: 'restock', part });
            }}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-soft/50 px-5 py-3.5 text-xs text-muted sm:px-6">
          <span>Available stock reflects parts currently on the shelf.</span>
          <span className="inline-flex items-center gap-1.5" role="status">
            <span className={`h-1.5 w-1.5 rounded-full ${status === 'ready' || status === 'refreshing' ? 'bg-green' : status === 'error' ? 'bg-rose-500' : 'animate-pulse bg-amber-400'}`} />
            {status === 'ready' || status === 'refreshing' ? 'Connected to RoboRack API' : status === 'error' ? 'API connection needs attention' : 'Connecting to RoboRack API'}
          </span>
        </div>
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>RoboRack · Robotics Club, VIT Chennai</span>
        <span>Inventory · Checkout · Kit tracking</span>
      </footer>
      {activeEditor && (
        <InventoryFormDialog
          key={`${activeEditor.type}-${activeEditor.part?.id ?? 'new'}`}
          mode={activeEditor}
          onClose={() => setActiveEditor(null)}
          onSaved={(message, part) => {
            if (
              activeEditor.type === 'edit'
              && category === activeEditor.part.category
              && activeEditor.part.category !== part.category
            ) {
              setCategory('All categories');
            }
            setActiveEditor(null);
            setFeedback(message);
            onInventoryChange();
          }}
        />
      )}
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

function IssueManager({ inventoryRefreshToken, onInventoryChange }) {
  const [parts, setParts] = useState([]);
  const [kits, setKits] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issueRefreshToken, setIssueRefreshToken] = useState(0);
  const [issueStatus, setIssueStatus] = useState('all');
  const [memberSearch, setMemberSearch] = useState('');
  const [loadError, setLoadError] = useState('');
  const [issuesError, setIssuesError] = useState('');
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
    setLoading(true);
    Promise.all([apiRequest('/api/inventory'), apiRequest('/api/kits')])
      .then(([inventoryData, kitData]) => {
        if (!active) return;
        setParts(inventoryData.items);
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
  }, [inventoryRefreshToken]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams({ status: issueStatus });
      if (memberSearch.trim()) params.set('search', memberSearch.trim());
      setIssuesLoading(true);
      setIssuesError('');
      apiRequest(`/api/issues?${params.toString()}`)
        .then((data) => {
          if (!Array.isArray(data.issues)) {
            throw new Error('The issue response was not in the expected format.');
          }
          if (active) setIssues(data.issues);
        })
        .catch((requestError) => {
          if (active) setIssuesError(requestError.message || 'Could not load member checkouts.');
        })
        .finally(() => {
          if (active) setIssuesLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [issueStatus, memberSearch, issueRefreshToken]);

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
      setForm((current) => ({
        ...current,
        memberName: '',
        registrationNumber: '',
        dueDate: localDateAfter(7),
        partId: '',
        kitId: issueType === 'kit' ? form.kitId : '',
        quantity: '1',
      }));
      setFeedback({ type: 'success', message: data.message });
      onInventoryChange();
      setIssueRefreshToken((current) => current + 1);
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
      setFeedback({ type: 'success', message: data.message });
      onInventoryChange();
      setIssueRefreshToken((current) => current + 1);
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
          {activeCount} active {activeCount === 1 ? 'issue' : 'issues'} shown
        </span>
      </div>

      {loadError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{loadError}</div>}
      {feedback && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green/20 bg-green/5 text-green' : 'border-rose-200 bg-rose-50 text-rose-800'}`} role="status">
          {feedback.message}
        </div>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,.8fr)_minmax(0,1.5fr)]">
        <form className="scroll-mt-6 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6" id="issue-form" onSubmit={submitIssue}>
          <div className="mb-5">
            <h3 className="font-display text-base font-bold">Issue inventory</h3>
            <p className="mt-1 text-xs text-muted">Check out a single part or an assembled kit.</p>
          </div>
          {formError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{formError}</div>}
          <div className="space-y-4">
            <div aria-label="Issue type" className="grid scroll-mt-6 grid-cols-2 rounded-lg bg-soft p-1" id="kit-details" role="group">
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
              disabled={busy || loading || issuesLoading || (issueType === 'part' ? availableParts.length === 0 : !selectedKit)}
              type="submit"
            >
              {busy ? 'Issuing…' : issueType === 'kit' ? 'Issue kit' : 'Issue part'}
            </button>
            {issueType === 'part' && availableParts.length === 0 && !loading && <p className="text-center text-xs text-amber-700">No parts are currently available to issue.</p>}
          </div>
        </form>

        <section className="scroll-mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card" aria-labelledby="current-issues-heading" id="checkout-history">
          <div className="flex items-center justify-between gap-3 p-5 sm:px-6 sm:py-5">
            <div>
              <h3 id="current-issues-heading" className="font-display text-base font-bold">Who has what</h3>
              <p className="mt-1 text-xs text-muted">Find member checkouts, due dates, and returns.</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime/25 text-green"><Icon name="return" className="h-[18px] w-[18px]" /></span>
          </div>
          <div className="grid gap-2 border-y border-line bg-soft/50 p-4 sm:grid-cols-[minmax(0,1fr)_150px] sm:px-6">
            <label className="relative block" id="member-search">
              <span className="sr-only">Search issues by member name or registration number</span>
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-green focus:ring-2 focus:ring-green/10"
                maxLength={100}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Find a member or registration no."
                type="search"
                value={memberSearch}
              />
            </label>
            <label className="block">
              <span className="sr-only">Filter checkout status</span>
              <select
                className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10"
                onChange={(event) => setIssueStatus(event.target.value)}
                value={issueStatus}
              >
                <option value="all">All issues</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
            </label>
          </div>
          {issuesError && (
            <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:mx-6" role="alert">
              Unable to load checkouts: {issuesError}
            </div>
          )}
          {loading || issuesLoading ? (
            <div className="grid min-h-44 place-items-center text-sm text-muted" role="status">Loading checkouts…</div>
          ) : issues.length === 0 ? (
            <div className="grid min-h-44 place-items-center px-5 text-center">
              <div>
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-soft text-muted"><Icon name="issues" /></span>
                <p className="mt-3 text-sm font-semibold">{memberSearch.trim() || issueStatus !== 'all' ? 'No matching checkouts' : 'No checkouts yet'}</p>
                <p className="mt-1 text-xs text-muted">{memberSearch.trim() || issueStatus !== 'all' ? 'Try another member name, registration number, or status.' : 'Issued parts and kits will appear here.'}</p>
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
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${issue.isOverdue ? 'bg-rose-50 text-rose-700' : issue.status === 'active' ? 'bg-amber-50 text-amber-700' : 'bg-green/10 text-green'}`}>
                      {issue.isOverdue ? 'Overdue' : issue.status === 'active' ? 'Checked out' : 'Returned'}
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
      <div className="mx-auto min-h-screen max-w-[1680px] lg:flex">
          <aside className="z-20 bg-forest text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[268px] lg:shrink-0 lg:flex-col">
          <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
            <Brand />
              <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60 lg:hidden">Robotics club</span>
          </div>
          <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible lg:px-4 lg:py-5">
              <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/35 lg:block">Lab workspace</p>
            {navigation.map((item) => <NavigationItem key={item.label} item={item} />)}
          </nav>
          <div className="mt-auto hidden border-t border-white/10 px-6 py-5 lg:block">
              <p className="text-xs font-semibold text-white/75">Robotics Club · VIT Chennai</p>
              <p className="mt-2 text-[11px] leading-5 text-white/45">Inventory and checkout data live in backend memory and reset on restart.</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
            <header className="flex min-h-[68px] items-center justify-between gap-3 border-b border-line/90 bg-white/75 px-5 backdrop-blur sm:px-8 lg:px-10">
              <p className="text-xs font-medium text-muted sm:text-sm">RoboRack <span className="mx-2 text-slate-300">/</span><span className="text-ink">Lab operations</span></p>
              <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-3 py-2 shadow-sm">
                <span aria-hidden="true" className="relative grid h-2.5 w-2.5 place-items-center rounded-full bg-green">
                  <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-green/35" />
                </span>
                <span className="text-[11px] font-semibold text-ink sm:text-xs">Live workspace</span>
              </div>
            </header>
            <main className="mx-auto max-w-[1320px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10">
              <InventoryPage
                onInventoryChange={() => setRefreshToken((current) => current + 1)}
                refreshToken={refreshToken}
              />
              <IssueManager
                inventoryRefreshToken={refreshToken}
                onInventoryChange={() => setRefreshToken((current) => current + 1)}
              />
            </main>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
