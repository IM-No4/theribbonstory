import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Minus, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { api, assetUrl } from "../../api/client";

const RANGES = [
  { id: "today", label: "Today", compare: "yesterday by this time" },
  { id: "7d", label: "7 days", compare: "previous 7 days" },
  { id: "30d", label: "30 days", compare: "previous 30 days" },
];

const rupees = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const dayLabel = (iso, opts) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", opts);

/** "+12% vs previous 7 days", with an icon so the direction isn't colour-only */
function Change({ now, before, compare }) {
  if (!before) {
    return <span className="text-[11px] text-slate-500">{now ? `No sales in the ${compare}` : "No sales yet"}</span>;
  }
  const pct = Math.round(((now - before) / before) * 100);
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  const tone = pct > 0 ? "text-emerald-400" : pct < 0 ? "text-rose-400" : "text-slate-400";
  return (
    <span className={`text-[11px] font-semibold inline-flex items-center gap-0.5 ${tone}`}>
      <Icon size={13} aria-hidden="true" />
      {pct > 0 ? "+" : ""}
      {pct}% <span className="font-normal text-slate-500">vs {compare}</span>
    </span>
  );
}

function Tile({ label, value, children }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 min-w-0">
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      <div className="mt-1.5 text-xl sm:text-2xl font-bold font-display text-white truncate">{value}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/** Revenue per day: one series, so no legend; hover/focus a day for its numbers */
function RevenueChart({ days, range }) {
  const [active, setActive] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(...days.map((d) => d.revenue), 0);
  // Round the axis up to a tidy number so gridlines land on readable values
  const step = max > 0 ? 10 ** Math.floor(Math.log10(max)) : 1;
  const top = max > 0 ? Math.ceil(max / step) * step : 1000;
  const ticks = [top, top / 2, 0];
  const labelEvery = range === "30d" ? 5 : 1;
  const shown = active != null ? days[active] : null;

  return (
    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display font-bold text-sm text-white">Revenue per day</h3>
          <p className="text-[11px] text-slate-400 h-4" aria-live="polite">
            {shown
              ? `${dayLabel(shown.date, { weekday: "short", day: "numeric", month: "short" })}: ${rupees(shown.revenue)} from ${shown.orders} order${shown.orders === 1 ? "" : "s"}`
              : "Hover or tap a day for details"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-[11px] font-semibold text-slate-400 hover:text-white underline-offset-2 hover:underline shrink-0"
        >
          {showTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-slate-300">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="py-1.5 font-semibold">Day</th>
                <th className="py-1.5 font-semibold text-right">Orders</th>
                <th className="py-1.5 font-semibold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date} className="border-b border-slate-900">
                  <td className="py-1.5">{dayLabel(d.date, { weekday: "short", day: "numeric", month: "short" })}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.orders}</td>
                  <td className="py-1.5 text-right tabular-nums">{rupees(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Y axis */}
          <div className="relative w-12 shrink-0 h-48 text-[10px] text-slate-500 tabular-nums">
            {ticks.map((t, i) => (
              <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}>
                {t >= 1000 ? `₹${(t / 1000).toLocaleString("en-IN")}k` : `₹${t}`}
              </span>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <div className="relative h-48" onMouseLeave={() => setActive(null)}>
              {/* Recessive gridlines */}
              {ticks.map((t, i) => (
                <div
                  key={t}
                  className={`absolute inset-x-0 border-t ${i === ticks.length - 1 ? "border-slate-700" : "border-slate-800/70 border-dashed"}`}
                  style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end gap-0.5">
                {days.map((d, i) => (
                  <button
                    key={d.date}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(i)}
                    aria-label={`${dayLabel(d.date, { weekday: "long", day: "numeric", month: "long" })}: ${rupees(d.revenue)}, ${d.orders} orders`}
                    className="group relative flex-1 h-full flex items-end justify-center focus:outline-none"
                  >
                    {/* Whole column is the hit target; the bar itself stays thin */}
                    <span
                      className={`w-full max-w-[28px] rounded-t-[4px] transition-colors ${active === i ? "bg-rose-400" : "bg-rose-500"} group-focus-visible:ring-2 group-focus-visible:ring-white`}
                      style={{ height: d.revenue > 0 ? `${Math.max((d.revenue / top) * 100, 1.5)}%` : 0 }}
                    />
                    {active === i && <span className="absolute inset-0 bg-white/[0.04] rounded" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
            {/* X axis */}
            <div className="flex gap-0.5 mt-1.5 text-[10px] text-slate-500">
              {days.map((d, i) => (
                <span key={d.date} className="relative flex-1 h-4">
                  {(i % labelEvery === 0 || i === days.length - 1) && (
                    <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                      {dayLabel(d.date, range === "30d" ? { day: "numeric", month: "short" } : { weekday: "short" })}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesOverview() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/orders/admin/sales", { params: { range } })
      .then(({ data: report }) => {
        if (cancelled) return;
        setData(report);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load sales. Refresh to try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const meta = RANGES.find((r) => r.id === range);
  const loading = !data || data.range !== range;
  const split = data?.paymentSplit;
  const onlineShare = data?.orders ? Math.round((split.online.orders / data.orders) * 100) : 0;

  return (
    <section className="space-y-4" aria-labelledby="sales-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="sales-heading" className="font-display text-lg font-bold text-white">Sales</h2>
          <p className="text-xs text-slate-400">Placed orders, excluding cancelled and refunded ones. Days are India time.</p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 self-start" role="tablist" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={range === r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${range === r.id ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-rose-400" role="alert">{error}</p>}

      {loading && !error ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Tile label="Revenue" value={rupees(data.revenue)}>
                <Change now={data.revenue} before={data.previous.revenue} compare={meta.compare} />
              </Tile>
              <Tile label="Orders" value={data.orders.toLocaleString("en-IN")}>
                <Change now={data.orders} before={data.previous.orders} compare={meta.compare} />
              </Tile>
              <Tile label="Average order" value={data.orders ? rupees(data.averageOrderValue) : "—"}>
                <span className="text-[11px] text-slate-500">per order</span>
              </Tile>
              <Tile label="Paid online vs COD" value={data.orders ? `${onlineShare}% / ${100 - onlineShare}%` : "—"}>
                <span className="text-[11px] text-slate-500">
                  {split.online.orders} online ({rupees(split.online.revenue)}) · {split.cod.orders} COD ({rupees(split.cod.revenue)})
                </span>
              </Tile>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                {range === "today" ? (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 h-full flex flex-col justify-center">
                    <h3 className="font-display font-bold text-sm text-white">Order status ({meta.label.toLowerCase()})</h3>
                    <Fulfilment counts={data.fulfilment} />
                  </div>
                ) : (
                  <RevenueChart days={data.byDay} range={range} />
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80">
                <h3 className="font-display font-bold text-sm text-white mb-3">Top products</h3>
                {data.topProducts.length === 0 ? (
                  <p className="text-xs text-slate-500">No sales in this period yet.</p>
                ) : (
                  <ol className="space-y-2.5">
                    {data.topProducts.map((p, i) => (
                      <li key={p.name} className="flex items-center gap-3 text-xs">
                        <span className="w-4 text-slate-500 tabular-nums">{i + 1}</span>
                        {p.image ? (
                          <img src={assetUrl(p.image)} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0" />
                        ) : (
                          <span className="w-8 h-8 rounded-lg bg-slate-800 shrink-0" />
                        )}
                        <span className="flex-1 min-w-0">
                          <span className="block text-slate-200 font-semibold truncate">{p.name}</span>
                          <span className="block text-[11px] text-slate-500">{p.quantity} sold</span>
                        </span>
                        <span className="text-slate-200 font-semibold tabular-nums">{rupees(p.revenue)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {range !== "today" && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80">
                <h3 className="font-display font-bold text-sm text-white">Orders from this period by status</h3>
                <Fulfilment counts={data.fulfilment} />
              </div>
            )}
            {data.refunded > 0 && (
              <p className="text-[11px] text-slate-500">{rupees(data.refunded)} refunded in this period (not counted as revenue).</p>
            )}
          </>
        )
      )}
    </section>
  );
}

function Fulfilment({ counts }) {
  const items = [
    { label: "To make & pack", value: counts.toMake, icon: Package },
    { label: "Shipped", value: counts.shipped, icon: Truck },
    { label: "Delivered", value: counts.delivered, icon: CheckCircle2 },
    { label: "Cancelled", value: counts.cancelled, icon: XCircle },
  ];
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map(({ label, value, icon: Icon }) => (
        <Link
          key={label}
          to="/admin/orders"
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
        >
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Icon size={13} aria-hidden="true" />
            {label}
          </span>
          <span className="block mt-1 text-lg font-bold text-white tabular-nums">{value}</span>
        </Link>
      ))}
    </div>
  );
}
