import { Link } from "react-router-dom";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import RecordCard from "../components/RecordCard";
import { useAppData } from "../AppDataContext.tsx";

const getCategoryColor = (index: number) =>
  `hsl(${Math.round((index * 137.508) % 360)} 66% 42%)`;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(amount);

const Dashboard = () => {
  const {
    categories,
    records,
    recordsLoading,
    recordsError,
  } = useAppData();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const nextMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  ).getTime();
  const recentRecords = records
    .sort((first, second) => second.timestamp - first.timestamp)
    .slice(0, 4);
  const currentMonthRecords = records.filter(
    (record) =>
      !record.isExcluded &&
      record.timestamp >= monthStart &&
      record.timestamp < nextMonthStart,
  );
  const categoryTotals = currentMonthRecords.reduce<Map<string, number>>(
    (totals, record) => {
      totals.set(
        record.categoryId,
        (totals.get(record.categoryId) ?? 0) + record.amount,
      );
      return totals;
    },
    new Map(),
  );
  const sortedCategories = [...categories].sort((first, second) =>
    first.id.localeCompare(second.id),
  );
  const categoryColors = new Map(
    sortedCategories.map((category, index) => [
      category.id,
      getCategoryColor(index),
    ]),
  );
  const categorySpending = [...categoryTotals.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      name: categories.find((category) => category.id === categoryId)?.name ?? "Other",
      amount,
      color:
        categoryColors.get(categoryId) ??
        getCategoryColor(sortedCategories.length),
    }))
    .sort((first, second) => second.amount - first.amount);
  const currentMonthTotal = categorySpending.reduce(
    (total, category) => total + category.amount,
    0,
  );
  const monthLabel = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-4">
      <section className="mx-3 mt-3 flex shrink-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Recent records</h1>
            <p className="mt-0.5 text-sm text-slate-500">Your latest activity</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm tabular-nums text-slate-500">
              {recordsLoading ? "" : `${recentRecords.length} shown`}
            </span>
            <Link
              to="/records"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              Show more
            </Link>
          </div>
        </header>

        <div className="bg-slate-50">
          {recordsLoading ? (
            <p className="p-4 text-sm text-slate-500">Loading records...</p>
          ) : recordsError ? (
            <p role="alert" className="p-4 text-sm text-red-700">{recordsError}</p>
          ) : recentRecords.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No records yet.</p>
          ) : (
            recentRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          )}
        </div>

      </section>

      <section className="mx-3 mb-4 mt-4 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Spending by category
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold tabular-nums text-slate-900">
              {formatCurrency(currentMonthTotal)}
            </p>
            <Link
              to="/insights"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              Show more
            </Link>
          </div>
        </header>

        {recordsLoading ? (
          <p className="p-4 text-sm text-slate-500">Loading this month’s records...</p>
        ) : recordsError ? (
          <p role="alert" className="p-4 text-sm text-red-700">
            {recordsError}
          </p>
        ) : categorySpending.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            No visible records for {monthLabel.toLowerCase()}.
          </p>
        ) : (
          <div className="grid items-center gap-2 p-3 sm:grid-cols-[minmax(14rem,0.9fr)_minmax(0,1.1fr)] sm:p-4">
            <div className="h-56 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: "6px",
                      borderColor: "#cbd5e1",
                      boxShadow: "0 4px 12px rgb(15 23 42 / 0.10)",
                    }}
                  />
                  <Pie
                    data={categorySpending}
                    dataKey="amount"
                    nameKey="name"
                    startAngle={90}
                    endAngle={450}
                    outerRadius={88}
                    paddingAngle={0}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {categorySpending.map((category) => (
                      <Cell key={category.categoryId} fill={category.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="grid content-center gap-2 sm:grid-cols-2 sm:gap-x-4">
              {categorySpending.map((category) => (
                <li
                  key={category.categoryId}
                  className="flex min-w-0 items-center gap-2 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-slate-600">
                    {category.name}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-slate-900">
                    {formatCurrency(category.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

    </main>
  );
};

export default Dashboard;
