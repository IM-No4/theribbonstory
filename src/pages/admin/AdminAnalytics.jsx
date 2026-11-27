import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Copy } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import { useSeo } from "../../utils/seo";

const RANGES = [
  { id: "today", label: "Today", compare: "yesterday by this time" },
  { id: "7d", label: "7 days", compare: "previous 7 days" },
  { id: "30d", label: "30 days", compare: "previous 30 days" },
  { id: "90d", label: "90 days", compare: "previous 90 days" },
];

const count = (n) => Math.round(n || 0).toLocaleString("en-IN");
const rupees = (n) => `₹${count(n)}`;
const percent = (part, whole) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : "–");
const panel = "rounded-2xl bg-slate-950 border border-slate-800/80";

function Change({ now, before }) {
  if (!before) return <span className="text-[11px] text-slate-500">no earlier data</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  const tone = pct > 0 ? "text-emerald-400" : pct < 0 ? "text-rose-400" : "text-slate-400";
  return (
    <span className={`text-[11px] font-semibold inline-flex items-center gap-0.5 ${tone}`}>
      <Icon size={13} aria-hidden="true" />
      {pct > 0 ? "+" : ""}
      {pct}%
    </span>
  );
}

function Table({ title, hint, columns, rows, empty }) {
  return (
    <section className={`${panel} overflow-hidden`}>
      <div className="p-5 pb-3">
        <h2 className="font-display font-bold text-sm text-white">{title}</h2>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      </div>
      {rows.length === 0 ? (
        <p className="px-5 pb-6 text-xs text-slate-500">{empty}</p>
      ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                {columns.map((c, i) => (
                  <th key={c.label} className={`py-2.5 px-4 font-semibold whitespace-nowrap ${i ? "text-right" : ""}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((c, i) => (
                    <td key={c.label} className={`py-2.5 px-4 ${i ? "text-right tabular-nums whitespace-nowrap" : "max-w-xs truncate"}`}>
                      {c.value(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DailyChart({ days }) {
  const [metric, setMetric] = useState("visitors");
  const metrics = { visitors: "Visitors", visits: "Visits", pageViews: "Page views", addedVisits: "Visits with add to cart", boughtVisits: "Visits with an order" };
  const max = Math.max(1, ...days.map((d) => d[metric]));
  return (
    <section className={`${panel} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display font-bold text-sm text-white">Day by day</h2>
        <select
          aria-label="Chart measure"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5"
        >
          {Object.entries(metrics).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      {days.length === 0 ? (
        <p className="text-xs text-slate-500">No visits recorded in this period yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex items-end gap-1 h-44 min-w-full">
            {days.map((d) => {
              const label = new Date(`${d.day}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
              return (
                <div key={d.day} className="flex-1 min-w-[14px] h-full flex flex-col justify-end items-center gap-1" title={`${label}: ${count(d[metric])} ${metrics[metric].toLowerCase()}`}>
                  {days.length <= 31 && <span className="text-[10px] text-slate-400 tabular-nums">{d[metric] || ""}</span>}
                  <div className="w-full max-w-12 rounded-t bg-rose-500" style={{ height: `${(d[metric] / max) * 75}%`, minHeight: d[metric] ? 2 : 0 }} />
                  {days.length <= 14 && <span className="text-[10px] text-slate-500 whitespace-nowrap">{label}</span>}
                </div>
              );
            })}
          </div>
          {days.length > 14 && (
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{days[0].day}</span>
              <span>{days[days.length - 1].day}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function LinkBuilder() {
  const [form, setForm] = useState({ page: "https://theribbonstory.com/", source: "instagram", campaign: "christmas" });
  const link = (() => {
    try {
      const url = new URL(form.page);
      url.searchParams.set("utm_source", form.source.trim());
      url.searchParams.set("utm_medium", "paid");
      if (form.campaign.trim()) url.searchParams.set("utm_campaign", form.campaign.trim());
      return url.toString();
    } catch {
      return "";
    }
  })();
  const field = "w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white";
  return (
    <section className={`${panel} p-5 space-y-3`}>
      <div>
        <h2 className="font-display font-bold text-sm text-white">Ad link builder</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">Use this link in your ad so its visits and orders show up by campaign above.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { key: "page", label: "Page the ad opens" },
          { key: "source", label: "Where the ad runs (instagram, google…)" },
          { key: "campaign", label: "Campaign name" },
        ].map((f) => (
          <label key={f.key} className="space-y-1 block">
            <span className="text-[11px] text-slate-400">{f.label}</span>
            <input className={field} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <input readOnly aria-label="Ad link" className={`${field} font-mono`} value={link || "Enter a full page address, starting with https://"} />
        <button
          type="button"
          disabled={!link}
          onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copied"), () => toast.error("Could not copy"))}
          className="px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
        >
          <Copy size={13} /> Copy
        </button>
      </div>
    </section>
  );
}

export default function AdminAnalytics() {
  useSeo({ title: "Analytics — Admin", noindex: true });
  const [range, setRange] = useState("7d");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const { data } = await api.get("/admin/analytics", { params: { range } });
      setReport(data.report);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const t = report?.totals;
  const p = report?.previous;
  const compare = RANGES.find((r) => r.id === range).compare;
  const conversion = (x) => (x.visits ? (x.boughtVisits / x.visits) * 100 : 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visitors, products and ad performance. Your own admin browsing isn't counted.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {report && (
            <span className="text-xs text-emerald-400 font-semibold mr-1">● {report.liveVisitors} on the site now</span>
          )}
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                range === r.id ? "bg-rose-600 border-rose-600 text-white" : "border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
          <button type="button" onClick={load} aria-label="Refresh" className="p-2 rounded-lg border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {failed ? (
        <p className={`${panel} p-8 text-center text-sm text-slate-400`}>Could not load analytics. Use refresh to try again.</p>
      ) : !report ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }, (_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-900/60 animate-pulse" />)}
        </div>
      ) : (
        <div className={`space-y-6 ${loading ? "opacity-60" : ""}`}>
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                ["Unique visitors", count(t.visitors), t.visitors, p.visitors],
                ["Visits", count(t.visits), t.visits, p.visits],
                ["Page views", count(t.pageViews), t.pageViews, p.pageViews],
                ["Clicks", count(t.clicks), t.clicks, p.clicks],
                ["Products viewed", count(t.productViews), t.productViews, p.productViews],
                ["Added to cart", count(t.addToCarts), t.addToCarts, p.addToCarts],
                ["Checkouts started", count(t.checkouts), t.checkouts, p.checkouts],
                ["Orders", count(t.orders), t.orders, p.orders],
                ["Revenue", rupees(t.revenue), t.revenue, p.revenue],
                ["Conversion rate", `${conversion(t).toFixed(1)}%`, conversion(t), conversion(p)],
              ].map(([label, value, now, before]) => (
                <div key={label} className={`${panel} p-4 min-w-0`}>
                  <div className="text-[11px] font-medium text-slate-400">{label}</div>
                  <div className="mt-1.5 text-xl sm:text-2xl font-bold font-display text-white truncate">{value}</div>
                  <Change now={now} before={before} />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Changes compare with the {compare}. Orders and revenue are paid and cash-on-delivery orders, excluding cancelled ones.
            </p>
          </div>

          <section className={`${panel} p-5`}>
            <h2 className="font-display font-bold text-sm text-white mb-1">Where visitors drop off</h2>
            <p className="text-[11px] text-slate-400 mb-4">Number of visits reaching each step, as a share of all visits.</p>
            <div className="space-y-3">
              {[
                ["Visited the store", t.visits],
                ["Viewed a product", t.viewedVisits],
                ["Added to cart", t.addedVisits],
                ["Started checkout", t.checkoutVisits],
                ["Placed an order", t.boughtVisits],
              ].map(([label, n]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{label}</span>
                    <span className="text-white font-semibold tabular-nums">
                      {count(n)} <span className="text-slate-500 font-normal">· {percent(n, t.visits)}</span>
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${t.visits ? (n / t.visits) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <DailyChart days={report.daily} />

          <Table
            title="Traffic sources and campaigns"
            hint="Tag your ad links (builder below) to see each campaign separately."
            empty="No visits recorded yet."
            rows={report.sources}
            columns={[
              { label: "Source / campaign", value: (r) => <span><span className="text-white font-semibold">{r.source}</span> <span className="text-slate-500">/ {r.medium}</span>{r.campaign && <span className="text-rose-300"> · {r.campaign}</span>}</span> },
              { label: "Visitors", value: (r) => count(r.visitors) },
              { label: "Visits", value: (r) => count(r.visits) },
              { label: "Viewed product", value: (r) => count(r.viewedVisits) },
              { label: "Added to cart", value: (r) => count(r.addedVisits) },
              { label: "Checkout", value: (r) => count(r.checkoutVisits) },
              { label: "Orders", value: (r) => count(r.orders) },
              { label: "Revenue", value: (r) => rupees(r.revenue) },
              { label: "Conversion", value: (r) => percent(r.boughtVisits, r.visits) },
            ]}
          />

          <Table
            title="Products"
            hint="Interest versus sales. Many views with few additions can mean the price, photos or description need work."
            empty="No product views yet."
            rows={report.products}
            columns={[
              { label: "Product", value: (r) => <span className="text-white font-semibold">{r.name}</span> },
              { label: "Views", value: (r) => count(r.views) },
              { label: "Viewers", value: (r) => count(r.viewers) },
              { label: "Added by", value: (r) => count(r.adders) },
              { label: "Units added", value: (r) => count(r.unitsAdded) },
              { label: "View → cart", value: (r) => (r.viewers ? percent(Math.min(r.adders, r.viewers), r.viewers) : "–") },
              { label: "Units sold", value: (r) => count(r.unitsSold) },
              { label: "Sales", value: (r) => rupees(r.sales) },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <Table
              title="Most viewed pages"
              empty="No page views yet."
              rows={report.pages}
              columns={[
                { label: "Page", value: (r) => r.path },
                { label: "Views", value: (r) => count(r.views) },
                { label: "Visitors", value: (r) => count(r.visitors) },
              ]}
            />
            <Table
              title="Most clicked buttons and links"
              empty="No clicks yet."
              rows={report.clicks}
              columns={[
                { label: "Clicked", value: (r) => <span title={`${r.label} on ${r.path}`}><span className="text-white">{r.label}</span> <span className="text-slate-500">{r.path}</span></span> },
                { label: "Clicks", value: (r) => count(r.clicks) },
                { label: "Visitors", value: (r) => count(r.visitors) },
              ]}
            />
            <Table
              title="Searches"
              empty="No searches yet."
              rows={report.searches}
              columns={[
                { label: "Search term", value: (r) => r.term },
                { label: "Searches", value: (r) => count(r.searches) },
                { label: "Visitors", value: (r) => count(r.visitors) },
              ]}
            />
            <Table
              title="Devices"
              empty="No visits yet."
              rows={report.devices}
              columns={[
                { label: "Device", value: (r) => <span className="capitalize">{r.device}</span> },
                { label: "Visits", value: (r) => count(r.visits) },
                { label: "Share", value: (r) => percent(r.visits, t.visits) },
                { label: "Conversion", value: (r) => percent(r.boughtVisits, r.visits) },
              ]}
            />
          </div>
        </div>
      )}

      <LinkBuilder />
    </div>
  );
}
