import { useEffect, useRef, useState } from "react";
import RecordCard from "../components/RecordCard";
import { getRecordsPage, type RecordPageCursor } from "../firebase";

const RecordList = () => {
  const [records, setRecords] = useState<Awaited<ReturnType<typeof getRecordsPage>>["records"]>([]);
  const [nextCursor, setNextCursor] = useState<RecordPageCursor | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTargetRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    getRecordsPage()
      .then((page) => {
        if (!isMounted) return;
        setRecords(page.records);
        setNextCursor(page.cursor);
        setHasMore(page.hasMore);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setRecordsError(
            error instanceof Error ? error.message : "Unable to load records.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setRecordsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const loadMoreTarget = loadMoreTargetRef.current;
    if (
      !scrollContainer ||
      !loadMoreTarget ||
      recordsLoading ||
      loadingMore ||
      !hasMore ||
      recordsError
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingMoreRef.current || !nextCursor) {
          return;
        }

        loadingMoreRef.current = true;
        setLoadingMore(true);
        getRecordsPage(nextCursor)
          .then((page) => {
            setRecords((currentRecords) => [...currentRecords, ...page.records]);
            setNextCursor(page.cursor);
            setHasMore(page.hasMore);
          })
          .catch((error: unknown) => {
            setRecordsError(
              error instanceof Error ? error.message : "Unable to load records.",
            );
          })
          .finally(() => {
            loadingMoreRef.current = false;
            setLoadingMore(false);
          });
      },
      { root: scrollContainer, rootMargin: "160px" },
    );

    observer.observe(loadMoreTarget);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, nextCursor, recordsError, recordsLoading]);

  const searchQuery = searchTerm.trim().toLowerCase();
  const visibleRecords = records
    .filter(
      (record) =>
        (record.isRedacted
          ? "redacted record".includes(searchQuery)
          : record.title.toLowerCase().includes(searchQuery)),
    )
    .sort((first, second) => second.timestamp - first.timestamp);

  return (
    <main
      ref={scrollContainerRef}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <header className="px-3 pb-1 pt-4">
        <h1 className="text-xl font-semibold text-slate-900">Records</h1>
      </header>

      <div className="mx-3 mb-1 mt-3">
        <label
          htmlFor="record-search"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Find a record
        </label>
        <input
          type="search"
          id="record-search"
          name="record-search"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="block h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div
        ref={scrollContainerRef}
        className="m-3 min-h-0 flex-1 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 shadow-sm"
      >
        {recordsLoading ? (
          <p className="p-3 text-sm text-slate-500">Loading records...</p>
        ) : recordsError ? (
          <p role="alert" className="p-3 text-sm text-red-700">{recordsError}</p>
        ) : visibleRecords.length === 0 ? (
          <p className="p-3 text-sm text-slate-500">
            {searchQuery
              ? hasMore
                ? ""
                : "No matching records."
              : hasMore
                ? ""
                : "No records yet."}
          </p>
        ) : (
          visibleRecords.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))
        )}
        {loadingMore && (
          <p aria-live="polite" className="p-3 text-center text-sm text-slate-500">
            Loading more records...
          </p>
        )}
        <div ref={loadMoreTargetRef} aria-hidden="true" className="h-1 shrink-0" />
      </div>
    </main>
  );
};

export default RecordList;