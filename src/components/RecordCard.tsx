import { Link } from "react-router-dom";
import type { Record } from "../Record";
import { useAppData } from "../AppDataContext.tsx";

const RecordCard = ({ record }: { record: Record }) => {
  const { categories } = useAppData();
  const category = categories.find(
    (category) => category.id === record.categoryId
  );
  const timestamp = new Date(record.timestamp);
  const hasValidTimestamp = Number.isFinite(timestamp.getTime());
  const formattedAmount = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: record.currency,
    currencyDisplay: "narrowSymbol",
  }).format(record.amount);

  return (
    <Link
      to={`/records/${record.id}/edit`}
      aria-label={`Edit record: ${record.title}`}
      className="block cursor-pointer text-left outline-offset-2 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
    >
      <article className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 last:border-b-0">
        <div className="grid size-11 place-items-center rounded-md bg-emerald-50 text-2xl text-emerald-800 select-none">
          {category?.icon ?? "•"}
        </div>

        <div className="min-w-0">
          <h2 className="wrap-break-word text-sm font-semibold text-slate-900">
            {record.title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {category?.name ?? "Uncategorized"}
          </p>
        </div>

        <div className="text-right">
          <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-rose-700">
            -{formattedAmount}
          </p>
          {hasValidTimestamp ? (
            <time
              dateTime={timestamp.toISOString()}
              className="mt-1 block whitespace-nowrap text-xs text-slate-500"
            >
              {timestamp.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              <span className="px-1">·</span>
              {timestamp.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
          ) : (
            <span className="mt-1 block text-xs text-slate-500">Unknown date</span>
          )}
        </div>
      </article>
    </Link>
  );
};

export default RecordCard;
