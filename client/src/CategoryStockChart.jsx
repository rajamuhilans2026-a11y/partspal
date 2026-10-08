import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function CategoryStockChart({ data, status, error }) {
  return (
    <section aria-labelledby="stock-chart-heading" className="mb-6 overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
      <div className="mb-4">
        <h2 id="stock-chart-heading" className="font-display text-base font-bold">Stock by category</h2>
        <p className="mt-1 text-xs text-muted">Compare available units with total lab stock.</p>
      </div>
      {status === 'loading' ? (
        <div className="grid h-[260px] place-items-center text-sm text-muted" role="status">Loading category stock…</div>
      ) : status === 'error' ? (
        <div className="grid h-[260px] place-items-center rounded-xl bg-rose-50 px-5 text-center text-sm text-rose-800" role="alert">
          Unable to load chart data: {error}
        </div>
      ) : data.length === 0 ? (
        <div className="grid h-[260px] place-items-center rounded-xl bg-soft px-5 text-center">
          <div>
            <p className="text-sm font-semibold">No stock data to chart</p>
            <p className="mt-1 text-xs text-muted">Category totals will appear when inventory is available.</p>
          </div>
        </div>
      ) : (
        <>
          <div aria-label="Bar chart comparing total and available stock by category" className="h-[280px] w-full sm:h-[320px]" role="img">
            <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <BarChart
                accessibilityLayer
                data={data}
                margin={{ top: 8, right: 12, left: 8, bottom: 26 }}
              >
                <CartesianGrid stroke="#e6e9e3" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  angle={-20}
                  axisLine={{ stroke: '#dce2da' }}
                  dataKey="category"
                  height={58}
                  interval={0}
                  label={{ value: 'Category', position: 'insideBottom', offset: -14, fill: '#78847d', fontSize: 11 }}
                  textAnchor="end"
                  tick={{ fill: '#64736b', fontSize: 10 }}
                  tickLine={false}
                  tickMargin={8}
                  tickSize={0}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  label={{ value: 'Units', angle: -90, position: 'insideLeft', fill: '#78847d', fontSize: 11 }}
                  tick={{ fill: '#78847d', fontSize: 11 }}
                  tickLine={false}
                  width={38}
                />
                <Tooltip
                  contentStyle={{ border: '1px solid #e6e9e3', borderRadius: 10, fontSize: 12 }}
                  formatter={(value, name) => [`${value} units`, name]}
                  labelStyle={{ color: '#17231e', fontWeight: 700, marginBottom: 4 }}
                />
                <Legend
                  align="right"
                  height={28}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: '#64736b' }}
                />
                <Bar dataKey="totalStock" fill="#17363a" name="Total stock" radius={[4, 4, 0, 0]} />
                <Bar dataKey="availableStock" fill="#a7cf56" name="Available stock" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <details className="mt-3 border-t border-line pt-3">
            <summary className="cursor-pointer text-xs font-semibold text-green hover:text-forest">View chart data as a table</summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">Total and available stock by category</caption>
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted">
                    <th className="py-2 pr-4">Category</th>
                    <th className="px-4 py-2 text-right">Total stock (units)</th>
                    <th className="py-2 pl-4 text-right">Available stock (units)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.map((item) => (
                    <tr key={item.category}>
                      <th className="py-2 pr-4 font-medium text-ink">{item.category}</th>
                      <td className="px-4 py-2 text-right tabular-nums">{item.totalStock}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{item.availableStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
