import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppData } from "../AppDataContext.tsx";

const getCategoryColor = (index: number) =>
  `hsl(${Math.round((index * 137.508) % 360)} 66% 42%)`;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(amount);

const toMonthInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const RecordInsights = () => {
  const { categories, records, recordsLoading, recordsError } = useAppData();
  const [selectedMonth, setSelectedMonth] = useState(() =>
    toMonthInputValue(new Date()),
  );
  const [isEditingMonth, setIsEditingMonth] = useState(false);
  const [yearText, monthText] = selectedMonth.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const monthStart = new Date(year, monthIndex, 1).getTime();
  const nextMonthStart = new Date(year, monthIndex + 1, 1).getTime();
  const monthLabel = new Date(year, monthIndex, 1).toLocaleDateString(
    undefined,
    {
      month: "long",
      year: "numeric",
    },
  );
  const changeMonth = (offset: number) => {
    setSelectedMonth(toMonthInputValue(new Date(year, monthIndex + offset, 1)));
  };

  const monthRecords = records.filter(
    (record) =>
      !record.isHidden &&
      record.timestamp >= monthStart &&
      record.timestamp < nextMonthStart,
  );
  const categoryTotals = monthRecords.reduce<Map<string, number>>(
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
      name:
        categories.find((category) => category.id === categoryId)?.name ??
        "Other",
      amount,
      color:
        categoryColors.get(categoryId) ??
        getCategoryColor(sortedCategories.length),
    }))
    .sort((first, second) => second.amount - first.amount);
  const total = monthRecords.reduce((sum, record) => sum + record.amount, 0);
  const average = monthRecords.length > 0 ? total / monthRecords.length : 0;
  const topCategory = categorySpending[0];
  const dailyTotals = monthRecords.reduce<Map<number, number>>(
    (totals, record) => {
      const day = new Date(record.timestamp).getDate();
      totals.set(day, (totals.get(day) ?? 0) + record.amount);
      return totals;
    },
    new Map(),
  );
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dailySpending = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    amount: dailyTotals.get(index + 1) ?? 0,
  }));

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto">
      <header className="flex flex-wrap items-end justify-between gap-3 px-3 pb-2 pt-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Record insights
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monthly spending breakdown
          </p>
        </div>
        <Link
          to="/"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-700"
        >
          Dashboard
        </Link>
      </header>

      <div className="mx-3 mt-2">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Month
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-fit items-center gap-2 rounded-md border border-slate-300 bg-white p-1 shadow-sm">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
              className="grid size-9 cursor-pointer place-items-center rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </button>
            {isEditingMonth ? (
              <input
                aria-label="Choose month"
                type="month"
                autoFocus
                value={selectedMonth}
                onChange={(event) => {
                  setSelectedMonth(event.target.value);
                  setIsEditingMonth(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setIsEditingMonth(false);
                }}
                className="h-9 w-36 cursor-pointer rounded border border-emerald-700 bg-white px-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-100"
              />
            ) : (
              <button
                type="button"
                aria-label={`Edit month: ${monthLabel}`}
                onClick={() => setIsEditingMonth(true)}
                className="min-w-36 cursor-pointer rounded px-2 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-700"
              >
                {monthLabel}
              </button>
            )}
            <button
              type="button"
              aria-label="Next month"
              onClick={() => changeMonth(1)}
              className="grid size-9 cursor-pointer place-items-center rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
      </div>

      {recordsLoading ? (
        <p className="m-3 text-sm text-slate-500">Loading records...</p>
      ) : recordsError ? (
        <p role="alert" className="m-3 text-sm text-red-700">
          {recordsError}
        </p>
      ) : (
        <>
          <section className="mx-3 mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Total spent</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                {formatCurrency(total)}
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Records</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                {monthRecords.length}
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Average record</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                {formatCurrency(average)}
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Top category</p>
              <p className="mt-1 truncate text-lg font-semibold text-slate-900">
                {topCategory?.name ?? "—"}
              </p>
            </article>
          </section>

          <section className="mx-3 mb-4 mt-4 grid gap-3 lg:grid-cols-2">
            <article className="min-w-0 rounded-md border border-slate-200 bg-white">
              <header className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-semibold text-slate-900">By category</h2>
                <p className="mt-0.5 text-sm text-slate-500">{monthLabel}</p>
              </header>
              {categorySpending.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  No visible records for {monthLabel.toLowerCase()}.
                </p>
              ) : (
                <div className="grid items-center gap-2 p-3 sm:grid-cols-[minmax(12rem,0.9fr)_minmax(0,1.1fr)]">
                  <div className="h-56 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                        <Pie
                          data={categorySpending}
                          dataKey="amount"
                          nameKey="name"
                          outerRadius={88}
                          paddingAngle={2}
                          stroke="#ffffff"
                          strokeWidth={2}
                          startAngle={90}
                          endAngle={450}
                        >
                          {categorySpending.map((category) => (
                            <Cell
                              key={category.categoryId}
                              fill={category.color}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="grid content-center gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
            </article>

            <article className="min-w-0 rounded-md border border-slate-200 bg-white">
              <header className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-semibold text-slate-900">Daily spending</h2>
                <p className="mt-0.5 text-sm text-slate-500">{monthLabel}</p>
              </header>
              {monthRecords.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  No visible records for {monthLabel.toLowerCase()}.
                </p>
              ) : (
                <div className="h-72 px-2 py-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailySpending}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        tickMargin={8}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        tickFormatter={(value) => `$${value}`}
                        width={46}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Bar
                        dataKey="amount"
                        name="Spent"
                        fill="#0f766e"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
};

export default RecordInsights;
